import WebSocket from "ws";
import { config } from "../config.js";
import { buildClinicalSystemInstruction } from "./clinicalPrompts.js";
import { recordingService } from "../services/recordingService.js";
import { generateClinicalSummary } from "../services/clinicalSummaryService.js";
import { saveCallRecord } from "../services/callPersistenceService.js";

/**
 * Gestor de Sesión Bidireccional en Vivo (Lazo Gateway <-> Gemini Live API)
 * Incluye:
 * - Saludo automático al confirmar setup (NOM-004) sin duplicaciones
 * - Grabación sincronizada de audio dual por turnos continuos
 * - Transcripción en vivo consolidada en UNA SOLA CAJA por turno conversacional
 * - Máquina de estados de consentimiento estructurada (6 fases de protocolo clínico)
 * - Persistencia y resumen clínico estricto basado exclusivamente en el diálogo
 */
export class GeminiLiveSession {
  constructor(clientWs, options = {}) {
    this.clientWs = clientWs;
    this.patient = options.patient || {
      id: "LZ-0482",
      nombre: "Roberto Méndez Silva",
      medicoTratante: "Dra. Anamar Cordero Valle"
    };

    // ID único de la llamada
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
    this.callId = `LL-${dateStr}-${timeStr}`;

    this.startTime = Date.now();
    this.geminiWs = null;
    this.isSetupComplete = false;
    this.isGreetingSent = false;
    this.isClosed = false;
    this.isEnding = false;

    // Máquina de estados de consentimiento y conversación
    // Fases: 
    // 1. GREETING_IDENTITY: Saludo y verificación de identidad
    // 2. AWAITING_CONSENT: Explicación de finalidad y solicitud explícita de consentimiento
    // 3. MONITORING: Cuestionario clínico y exploración de barreras
    // 4. CLOSING: Cierre acordado
    // 5. ENDED: Finalizada
    this.conversationPhase = "GREETING_IDENTITY";
    this.consentState = "PENDING"; // PENDING | GRANTED | DENIED
    this.consentTimestamp = null;
    this.identityVerified = false;
    this.nameConfirmed = false;
    this.dobConfirmed = false;

    // Acumulador de elocución activa para consolidar cada turno en una sola caja
    this.activeTurn = null; // { speaker, text, startSecond, lastUpdate }
    this.patientTurnTimer = null;

    // Historial consolidado de la conversación para el expediente
    this.transcript = [];

    // Iniciar servicio de grabación temporal
    recordingService.startSession(this.callId, this.patient.id);

    this.init();
  }

  init() {
    if (!config.hasApiKey) {
      console.error("[GeminiLive] ERROR: GEMINI_API_KEY no está configurada.");
      this.sendToClient({
        type: "error",
        code: "MISSING_API_KEY",
        message: "No se ha configurado la clave GEMINI_API_KEY en server/.env."
      });
      return;
    }

    const wsUrl = `${config.geminiLiveWsUrl}?key=${config.geminiApiKey}`;
    console.log(`[GeminiLive] Conectando a Gemini Live con modelo ${config.geminiModel} para llamada ${this.callId}...`);

    try {
      this.geminiWs = new WebSocket(wsUrl);
    } catch (err) {
      console.error("[GeminiLive] Error al instanciar WebSocket con Gemini:", err);
      this.sendToClient({
        type: "error",
        code: "CONNECTION_FAILED",
        message: "Fallo al conectar con Gemini Live: " + err.message
      });
      return;
    }

    this.setupGeminiHandlers();
    this.setupClientHandlers();
  }

  setupGeminiHandlers() {
    this.geminiWs.on("open", () => {
      console.log("[GeminiLive] WebSocket con Gemini abierto. Enviando configuración de setup...");
      this.sendSetupMessage();
    });

    this.geminiWs.on("message", (data) => {
      try {
        const text = data.toString("utf-8");
        const response = JSON.parse(text);
        this.handleGeminiMessage(response);
      } catch (err) {
        console.error("[GeminiLive] Error parseando mensaje de Gemini:", err);
      }
    });

    this.geminiWs.on("error", (error) => {
      console.error("[GeminiLive] Error en WebSocket de Gemini:", error.message);
      this.sendToClient({
        type: "error",
        code: "GEMINI_WS_ERROR",
        message: "Error de comunicación con Gemini Live: " + error.message
      });
    });

    this.geminiWs.on("close", (code, reason) => {
      console.log(`[GeminiLive] Conexión de Gemini cerrada (${code}: ${reason || "N/A"})`);
      if (!this.isClosed && !this.isEnding) {
        this.endCall("gemini_closed");
      }
    });
  }

  sendSetupMessage() {
    const systemPrompt = buildClinicalSystemInstruction(this.patient);
    const setupMessage = {
      setup: {
        model: config.geminiModel,
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: config.geminiVoice
              }
            }
          }
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      }
    };

    this.geminiWs.send(JSON.stringify(setupMessage));
  }

  handleGeminiMessage(msg) {
    // 1. Confirmación de setup -> Saludo automático inmediato
    if (msg.setupComplete) {
      this.isSetupComplete = true;
      this.conversationPhase = "GREETING_IDENTITY";
      console.log(`[Gateway] ✅ Setup completado. Disparando saludo automático NOM-004 para ${this.callId}...`);

      this.sendToClient({
        type: "ready",
        callId: this.callId,
        model: config.geminiModel,
        voice: config.geminiVoice,
        patientName: this.patient.nombre
      });

      if (!this.isGreetingSent) {
        this.isGreetingSent = true;
        this.triggerAutoGreeting();
      }
      return;
    }

    // 2. Contenido generado por Gemini
    if (msg.serverContent) {
      const { modelTurn, interrupted, turnComplete } = msg.serverContent;

      if (interrupted) {
        console.log("[Gateway] ⚡ Interrupción detectada: el paciente habló mientras Lazo respondía.");
        recordingService.finalizeLazoTurn(this.callId);
        this.finalizeActiveTurn("lazo");
        this.sendToClient({ type: "interrupted" });
      }

      // 2.1 Transcripción nativa de lo que habló el PACIENTE (inputAudioTranscription)
      if (msg.serverContent.inputTranscription?.text) {
        const patientDelta = msg.serverContent.inputTranscription.text;
        if (patientDelta && patientDelta.trim()) {
          this.appendTranscriptionDelta("paciente", patientDelta);
          this.evaluatePatientUtterance(this.activeTurn?.text || patientDelta);
        }
      }

      // 2.2 Transcripción nativa de lo que habló LAZO (outputAudioTranscription)
      if (msg.serverContent.outputTranscription?.text) {
        const lazoDelta = msg.serverContent.outputTranscription.text;
        if (lazoDelta && lazoDelta.trim()) {
          this.appendTranscriptionDelta("lazo", lazoDelta);
          this.evaluateLazoUtterance(this.activeTurn?.text || lazoDelta);
        }
      }

      // 2.3 Audio de voz de Lazo (PCM 24kHz)
      if (modelTurn?.parts) {
        for (const part of modelTurn.parts) {
          if (part.inlineData && part.inlineData.data) {
            const audioBuffer = Buffer.from(part.inlineData.data, "base64");
            // Registrar en grabador sincronizado (se acumula en el turno de 24 kHz)
            recordingService.appendLazoAudio(this.callId, audioBuffer);

            // Reenviar al navegador para reproducción sin latencia
            this.sendToClient({
              type: "audio",
              data: part.inlineData.data,
              mimeType: part.inlineData.mimeType || "audio/pcm;rate=24000"
            });
          }
        }
      }

      // 2.4 Fin de turno de Lazo
      if (turnComplete) {
        recordingService.finalizeLazoTurn(this.callId);
        this.finalizeActiveTurn("lazo");
        this.sendToClient({ type: "turn_complete" });
      }
    }
  }

  /**
   * Acumula deltas de transcripción en tiempo real en UNA SOLA CAJA por turno conversacional.
   * Concatena respetando los límites de subpalabras/tokens de SentencePiece sin insertar
   * espacios artificiales que fragmenten palabras o números.
   */
  appendTranscriptionDelta(speaker, deltaText) {
    if (!deltaText) return;

    const nowSec = Math.max(0, Math.round((Date.now() - this.startTime) / 1000));

    // Si el hablante anterior era distinto, sellar su turno definitivamente
    if (this.activeTurn && this.activeTurn.speaker !== speaker) {
      this.finalizeActiveTurn();
    }

    if (!this.activeTurn) {
      this.activeTurn = {
        speaker,
        text: deltaText.replace(/^[\s\r\n]+/, ""),
        startSecond: nowSec,
        lastUpdate: Date.now()
      };
    } else {
      // Concatenar directamente respetando la presencia o ausencia de espacio nativo en el token
      this.activeTurn.text += deltaText;
      // Normalizar solo dobles espacios internos accidentales
      this.activeTurn.text = this.activeTurn.text.replace(/  +/g, " ");
      this.activeTurn.lastUpdate = Date.now();
    }

    // Emitir actualización de la caja activa hacia la interfaz en vivo
    this.sendToClient({
      type: "transcript_update",
      speaker,
      text: this.activeTurn.text,
      second: this.activeTurn.startSecond,
      isFinal: false
    });

    // Temporizador de silencio para el paciente: sellar turno tras 4.0s de inactividad
    // Da margen para consultar bitácora o pensar sin fragmentar el turno
    if (speaker === "paciente") {
      if (this.patientTurnTimer) clearTimeout(this.patientTurnTimer);
      this.patientTurnTimer = setTimeout(() => {
        if (this.activeTurn && this.activeTurn.speaker === "paciente") {
          this.finalizeActiveTurn("paciente");
        }
      }, 4000);
    }
  }

  /**
   * Sella de forma definitiva la caja de texto del turno activo y la guarda en el historial.
   * Si el interlocutor no ha cambiado, extiende la misma intervención para mantener una sola caja.
   */
  finalizeActiveTurn(expectedSpeaker = null) {
    if (!this.activeTurn) return;
    if (expectedSpeaker && this.activeTurn.speaker !== expectedSpeaker) return;

    if (this.patientTurnTimer) {
      clearTimeout(this.patientTurnTimer);
      this.patientTurnTimer = null;
    }

    const turn = this.activeTurn;
    this.activeTurn = null;

    const trimmed = (turn.text || "").trim();
    if (!trimmed || /^[\s.,;:!?¿¡-]+$/.test(trimmed)) return;

    const endSecond = Math.max(turn.startSecond, Math.round((Date.now() - this.startTime) / 1000));
    const hablanteLabel = turn.speaker === "lazo" ? "Lazo (IA)" : "Paciente";

    // Si el último turno del historial pertenece AL MISMO HABLANTE (el otro no ha intervenido),
    // fusionar en la misma caja continua de turno conversacional
    const lastEntry = this.transcript.length > 0 ? this.transcript[this.transcript.length - 1] : null;
    if (lastEntry && lastEntry.hablante === hablanteLabel) {
      lastEntry.texto = (lastEntry.texto + " " + trimmed).replace(/  +/g, " ");
      lastEntry.segundoFin = endSecond;
      console.log(`[Gateway] 💬 Turno continuo extendido [${lastEntry.segundo}s - ${endSecond}s] ${hablanteLabel}: "${lastEntry.texto}"`);

      if (turn.speaker === "paciente") {
        this.evaluatePatientUtterance(lastEntry.texto);
      } else if (turn.speaker === "lazo") {
        this.evaluateLazoUtterance(lastEntry.texto);
      }

      this.sendToClient({
        type: "transcript_final",
        speaker: turn.speaker,
        text: lastEntry.texto,
        second: lastEntry.segundo,
        endSecond,
        merged: true
      });
      return;
    }

    // Guardar en la estructura canónica de la llamada
    this.transcript.push({
      segundo: turn.startSecond,
      segundoFin: endSecond,
      hablante: hablanteLabel,
      texto: trimmed
    });

    console.log(`[Gateway] 💬 Turno consolidado [${turn.startSecond}s - ${endSecond}s] ${hablanteLabel}: "${trimmed}"`);

    // Evaluar la declaración completa consolidada
    if (turn.speaker === "paciente") {
      this.evaluatePatientUtterance(trimmed);
    } else if (turn.speaker === "lazo") {
      this.evaluateLazoUtterance(trimmed);
    }

    // Notificar al cliente que el turno quedó cerrado
    this.sendToClient({
      type: "transcript_final",
      speaker: turn.speaker,
      text: trimmed,
      second: turn.startSecond,
      endSecond
    });
  }

  /**
   * Dispara el saludo inicial solicitando identidad conforme al Script de Lazo V1 (Sección 01)
   */
  triggerAutoGreeting() {
    if (!this.geminiWs || this.geminiWs.readyState !== WebSocket.OPEN) return;

    const greetingTrigger = {
      clientContent: {
        turns: [
          {
            role: "user",
            parts: [
              {
                text: "Inicia la llamada de inmediato diciendo exactamente: 'Hola, le habla Lazo, el sistema automatizado de seguimiento de salud. Para verificar su identidad, ¿me puede confirmar, por favor, su nombre completo y su fecha de nacimiento?'"
              }
            ]
          }
        ],
        turnComplete: true
      }
    };

    try {
      this.geminiWs.send(JSON.stringify(greetingTrigger));
      console.log("[Gateway] 🚀 Saludo automático exacto (Script Sección 01) enviado a Gemini Live.");
    } catch (err) {
      console.error("[Gateway] Error al enviar auto-saludo a Gemini:", err);
    }
  }

  /**
   * Evalúa las declaraciones de Lazo para sincronizar la máquina de estados
   */
  evaluateLazoUtterance(lazoText) {
    const lower = (lazoText || "").toLowerCase();

    // Detección de solicitud explícita de consentimiento (Sección 02)
    if (lower.includes("grabar") || lower.includes("grabará") || lower.includes("de acuerdo en continuar") || lower.includes("de acuerdo en que grabemos")) {
      if (this.conversationPhase !== "AWAITING_CONSENT" && this.consentState === "PENDING") {
        this.conversationPhase = "AWAITING_CONSENT";
        console.log("[Gateway] ⚖️ Fase de llamada: Esperando consentimiento explícito del paciente...");
      }
    }

    // Detección de despedida protocolaria o corte de emergencia (Sección 03 u 08)
    if (
      lower.includes("excelente día") || 
      lower.includes("excelente dia") || 
      lower.includes("hasta luego") || 
      lower.includes("buen día") || 
      lower.includes("buen dia") || 
      lower.includes("respetamos totalmente") || 
      lower.includes("no realizaremos la llamada") || 
      lower.includes("suspenderé esta llamada") ||
      lower.includes("suspenderemos esta llamada") ||
      lower.includes("llame al 911")
    ) {
      console.log("[Gateway] 🏁 Lazo completó despedida o aviso de seguridad. Programando cierre ordenado...");
      setTimeout(() => {
        this.endCall("protocol_farewell_completed");
      }, 2500);
    }
  }

  /**
   * Evalúa las respuestas del paciente para verificación de identidad y consentimiento.
   * MÁQUINA DE ESTADOS ROBUSTA:
   * 1. La identidad requiere nombre y fecha de nacimiento (14/05/1964).
   * 2. El consentimiento solo se evalúa mientras está PENDIENTE.
   * 3. Respuestas clínicas negativas (ej. "no tengo dolor", "ahorita no", "no me tomé la pastilla")
   *    NUNCA alteran el consentimiento otorgado.
   */
  evaluatePatientUtterance(patientText) {
    const t = (patientText || "").toLowerCase();
    const collapsed = t.replace(/\s+/g, "");

    // 1. Verificación de identidad estricta: cotejo de nombre y fecha de nacimiento por separado
    if (!this.identityVerified) {
      if (t.includes("roberto") || t.includes("méndez") || t.includes("mendez") || collapsed.includes("roberto") || collapsed.includes("mendez")) {
        this.nameConfirmed = true;
      }
      if (t.includes("1964") || t.includes("mayo") || t.includes("64") || t.includes("catorce de mayo") || collapsed.includes("1964") || collapsed.includes("mayo")) {
        this.dobConfirmed = true;
      }
      if (this.nameConfirmed && this.dobConfirmed) {
        this.identityVerified = true;
        this.conversationPhase = "AWAITING_CONSENT";
        console.log("[Gateway] 🆔 Identidad del paciente confirmada verbalmente (Nombre completo y Fecha de Nacimiento cotejados).");
      }
    }

    // 2. Evaluación de consentimiento mientras está en estado PENDIENTE
    if (this.consentState === "PENDING") {
      const hasExplicitConsentWords = 
        /(acepto continuar|acepto que graben|que graben la llamada|de acuerdo en grabar|de acuerdo con grabar|sí acepto|si acepto|acepto|estoy de acuerdo)/i.test(t) ||
        /(aceptocontinuar|aceptoquegraben|quegrabenlallamada|deacuerdoengrabar|acepto|graben)/i.test(collapsed);

      const sanitized = t.replace(/\bsilva\b/gi, "").replace(/\bsi\s+lva\b/gi, "");
      const isAffirmative = 
        hasExplicitConsentWords || 
        /\b(sí|si|de acuerdo|está bien|esta bien|adelante|conforme|claro|por supuesto)\b/i.test(sanitized) ||
        /(si|deacuerdo|estabien|adelante|conforme|claro|porsupuesto|estoydeacuerdo)/i.test(collapsed);

      // Negativa explícita a la solicitud de consentimiento de continuar o grabar
      const isRefusal = 
        /\b(no acepto|no quiero continuar|no autorizo|no graben|no deseo la llamada|no llamen|no estoy de acuerdo en grabar|no acepto que graben|no quiero que graben)\b/i.test(t) ||
        (t.includes("no") && (t.includes("graben") || t.includes("grabar") || t.includes("autorizo") || (t.includes("continuar") && !t.includes("acepto")) || (t.includes("llamada") && t.includes("quiero"))));

      if (isAffirmative && !isRefusal) {
        this.consentState = "GRANTED";
        this.consentTimestamp = new Date().toISOString();
        this.conversationPhase = "MONITORING";
        recordingService.setConsent(this.callId, true);
        console.log("[Gateway] ✅ CONSENTIMIENTO EXPLÍCITO OTORGADO POR EL PACIENTE.");
        this.sendToClient({
          type: "consent_status",
          consent: "granted",
          timestamp: this.consentTimestamp
        });
      } else if (isRefusal) {
        this.consentState = "DENIED";
        this.consentTimestamp = new Date().toISOString();
        this.conversationPhase = "ENDED";
        recordingService.setConsent(this.callId, false);
        console.log("[Gateway] 🚫 CONSENTIMIENTO RECHAZADO POR EL PACIENTE. Finalizando llamada de inmediato.");
        this.sendToClient({
          type: "consent_status",
          consent: "denied",
          timestamp: this.consentTimestamp
        });

        // Ordenar a Gemini que pronuncie la despedida por rechazo de consentimiento
        if (this.geminiWs && this.geminiWs.readyState === WebSocket.OPEN) {
          const terminationMsg = {
            clientContent: {
              turns: [
                {
                  role: "user",
                  parts: [
                    {
                      text: "El paciente rechazó continuar o grabar la llamada. Di de inmediato y únicamente: 'Entendido, señor Roberto. Respetamos totalmente su decisión. No realizaremos la llamada en este momento y lo notificaremos a su equipo médico. Que tenga un buen día.' y finaliza la llamada."
                    }
                  ]
                }
              ],
              turnComplete: true
            }
          };
          this.geminiWs.send(JSON.stringify(terminationMsg));
        }

        setTimeout(() => {
          this.endCall("consent_denied_by_patient");
        }, 3500);
      }
    } else if (this.consentState === "GRANTED") {
      // 3. Cuando el consentimiento ya fue otorgado:
      // Las respuestas clínicas negativas (ej. "no tengo dolor", "ahorita no", "no me tomé la pastilla")
      // son contenido clínico y NUNCA alteran el consentimiento.
      // Solo una revocación explícita e inequívoca altera este estado:
      const isExplicitRevocation = 
        /\b(dejen de grabar|ya no me graben|borren la grabación|cancelo mi consentimiento|no sigan grabando)\b/i.test(t);

      if (isExplicitRevocation) {
        console.warn("[Gateway] ⚠️ Revocación explícita de consentimiento durante la llamada.");
        this.consentState = "DENIED";
        this.conversationPhase = "ENDED";
        recordingService.setConsent(this.callId, false);
        this.sendToClient({
          type: "consent_status",
          consent: "denied",
          timestamp: new Date().toISOString()
        });
        setTimeout(() => {
          this.endCall("consent_revoked_by_patient");
        }, 2000);
      }
    }
  }

  setupClientHandlers() {
    this.clientWs.on("message", (message, isBinary) => {
      try {
        let pcmBuffer = null;

        if (isBinary) {
          pcmBuffer = Buffer.isBuffer(message) ? message : Buffer.from(message);
        } else {
          const text = typeof message === "string" ? message : message.toString("utf-8");
          const payload = JSON.parse(text);

          if (payload?.type === "audio" && payload.data) {
            pcmBuffer = Buffer.from(payload.data, "base64");
          } else if (payload?.type === "end_call") {
            console.log("[Gateway] 🛑 Solicitud de finalización manual recibida desde el cliente.");
            this.endCall("user_clicked_end");
            return;
          }
        }

        if (pcmBuffer) {
          // El paciente está hablando o enviando audio continuo
          recordingService.appendPatientAudio(this.callId, pcmBuffer);

          // Transmitir a Gemini Live API
          this.forwardAudioToGemini(pcmBuffer.toString("base64"));
        }
      } catch (err) {
        console.error("[Gateway] Error procesando mensaje de entrada del cliente:", err);
      }
    });

    this.clientWs.on("close", () => {
      console.log(`[Gateway] 🔌 Cliente desconectó WebSocket para ${this.callId}.`);
      this.endCall("client_socket_closed");
    });

    this.clientWs.on("error", (err) => {
      console.error("[Gateway] Error en WebSocket de cliente:", err.message);
      this.endCall("client_socket_error");
    });
  }

  forwardAudioToGemini(base64PcmData) {
    if (!this.geminiWs || this.geminiWs.readyState !== WebSocket.OPEN || !this.isSetupComplete) {
      return;
    }

    const realtimeInput = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: "audio/pcm;rate=16000",
            data: base64PcmData
          }
        ]
      }
    };

    try {
      this.geminiWs.send(JSON.stringify(realtimeInput));
    } catch (err) {
      console.error("[Gateway] Error reenviando audio a Gemini:", err);
    }
  }

  sendToClient(data) {
    if (this.clientWs && this.clientWs.readyState === WebSocket.OPEN) {
      this.clientWs.send(JSON.stringify(data));
    }
  }

  /**
   * Finaliza la llamada de inmediato, asegura persistencia duradera del audio y la transcripción,
   * y delega la documentación clínica estructurada a un proceso en segundo plano.
   */
  async endCall(reason = "normal") {
    if (this.isEnding) return;
    this.isEnding = true;
    this.isClosed = true;

    console.log(`[Gateway] 🏁 Finalizando llamada ${this.callId} (Motivo: ${reason})...`);

    // 1. Sellar cualquier turno activo antes de guardar
    this.finalizeActiveTurn();

    const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    const duracionTexto = `${mins} min ${secs < 10 ? "0" : ""}${secs} s`;

    // 2. Finalizar y asegurar grabación en disco inmediatamente
    const isConsentGranted = this.consentState === "GRANTED";
    const recordingResult = recordingService.finalizeSession(this.callId, isConsentGranted);

    // 3. Formatear fecha y hora
    const now = new Date();
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const dia = String(now.getDate()).padStart(2, "0");
    const mes = meses[now.getMonth()];
    const anio = now.getFullYear();
    const hora = String(now.getHours()).padStart(2, "0");
    const minuto = String(now.getMinutes()).padStart(2, "0");
    const fechaHora = `${dia} ${mes} ${anio} · ${hora}:${minuto} hrs`;

    // Determinar estado preliminar seguro
    let estadoInicial = "Procesando documentación";
    let resumenEstado = "processing";
    if (this.consentState === "DENIED") {
      estadoInicial = "Rechazada / Sin consentimiento";
      resumenEstado = "skipped";
    } else if (durationSeconds < 10 && this.transcript.length <= 1) {
      estadoInicial = "Inconclusa";
      resumenEstado = "skipped";
    }

    // 4. Estructurar snapshot duradero inmediato de la llamada
    const callRecord = {
      id: this.callId,
      patientId: this.patient.id || "LZ-0482",
      fechaHora,
      direccion: "Saliente interactiva (Lazo Web)",
      tipo: "Llamada de prueba en vivo (Gemini Live)",
      duracion: duracionTexto,
      duracionSegundos: durationSeconds,
      estado: estadoInicial,
      resumenEstado,
      alertaGenerada: isConsentGranted ? "Pendiente de análisis" : "Rechazada / Sin consentimiento",
      verificacionIdentidad: this.identityVerified 
        ? `Verificada exitosamente (${this.patient.nombre})`
        : "No verificada formalmente",
      permisoGrabacion: isConsentGranted ? "Aceptado" : "Rechazado",
      consentimiento: {
        participacion: isConsentGranted,
        grabacion: isConsentGranted,
        timestamp: this.consentTimestamp || new Date().toISOString()
      },
      audioUrl: recordingResult.saved ? `/api/recordings/${this.callId}.wav` : null,
      recordingFile: recordingResult.saved ? recordingResult.fileName : null,
      grabacionConservada: recordingResult.saved,
      resumenClinico: null,
      transcripcionLiteral: [...this.transcript],
      esPruebaEnVivo: true,
      metadata: {
        terminacionMotivo: reason,
        modelo: config.geminiModel,
        voz: config.geminiVoice,
        tamanioGrabacionBytes: recordingResult.sizeBytes || 0
      }
    };

    // 5. PERSISTENCIA SEGURA DURADERA INMEDIATA en server/data/calls.json
    saveCallRecord(callRecord);
    console.log(`[Gateway] 💾 Registro seguro preliminar guardado en calls.json para ${this.callId}.`);

    // 6. Notificar al frontend la desconexión inmediata sin latencia
    this.sendToClient({
      type: "session_closed",
      callId: this.callId,
      status: "processing_documentation",
      call: callRecord
    });
    this.sendToClient({
      type: "call_saved",
      call: callRecord
    });

    // 7. Cerrar conexiones de voz de inmediato (< 400 ms)
    if (this.geminiWs && this.geminiWs.readyState === WebSocket.OPEN) {
      try { this.geminiWs.close(); } catch (e) {}
    }
    if (this.clientWs && this.clientWs.readyState === WebSocket.OPEN) {
      try { this.clientWs.close(); } catch (e) {}
    }

    console.log(`[Gateway] ⚡ Conexión de llamada ${this.callId} cerrada limpiamente. Iniciando síntesis en segundo plano...`);

    // 8. TAREA ASÍNCRONA EN SEGUNDO PLANO: Generar resumen clínico estructurado (NOM-004)
    if (isConsentGranted && this.transcript.length > 0) {
      (async () => {
        try {
          console.log(`[Gateway] 🧠 Generando resumen clínico NOM-004 en background para ${callRecord.id}...`);
          const clinicalSummary = await generateClinicalSummary({
            transcript: callRecord.transcripcionLiteral,
            patient: this.patient,
            callMetadata: {
              callId: callRecord.id,
              durationSeconds: callRecord.duracionSegundos,
              consentState: this.consentState
            }
          });

          // Actualizar registro en disco con el resumen definitivo
          callRecord.resumenClinico = clinicalSummary;
          callRecord.resumenEstado = "completed";
          callRecord.alertaGenerada = clinicalSummary?.alertaGenerada || "Normal (Seguimiento rutinario)";
          callRecord.estado = clinicalSummary?.alertaGenerada?.includes("Emergencia") 
            ? "Interrumpida por seguridad" 
            : "Completada";

          saveCallRecord(callRecord);
          console.log(`[Gateway] ✅ Documentación clínica completada y persistida exitosamente para ${callRecord.id}.`);
        } catch (err) {
          console.error(`[Gateway] ❌ Error en generación de resumen para ${callRecord.id}:`, err);
          callRecord.resumenEstado = "error";
          callRecord.estado = "Error de documentación (Reintentable)";
          callRecord.errorDetalle = err.message;
          saveCallRecord(callRecord);
        }
      })();
    }
  }
}
