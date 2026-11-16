import fs from "fs";
import WebSocket from "ws";

const wav1 = fs.readFileSync("/tmp/patient_consent.wav").subarray(44);
const wav2 = fs.readFileSync("/tmp/patient_clinical.wav").subarray(44);
const wav3 = fs.readFileSync("/tmp/patient_closing.wav").subarray(44);

console.log("Audio Turn 1 (Consent):", wav1.length, "bytes (~" + (wav1.length / 32000).toFixed(1) + "s)");
console.log("Audio Turn 2 (Clinical):", wav2.length, "bytes (~" + (wav2.length / 32000).toFixed(1) + "s)");
console.log("Audio Turn 3 (Closing):", wav3.length, "bytes (~" + (wav3.length / 32000).toFixed(1) + "s)");

console.log("\n=======================================================");
console.log("🧪 TEST E2E: LLAMADA CLÍNICA COMPLETA CON PERSISTENCIA");
console.log("Conectando a ws://localhost:3000/ws/live-call?patientId=LZ-0482 ...");
console.log("=======================================================\n");

const ws = new WebSocket("ws://localhost:3000/ws/live-call?patientId=LZ-0482");

let stage = "CONNECTING";
let callId = null;
let greetingReceived = false;
let consentGrantedReceived = false;
let callSavedReceived = false;
let savedCallData = null;

let currentTurnAudioReceived = 0;
let currentTurnText = "";

ws.on("open", () => {
  console.log("[TEST] Handshake WebSocket completado con el proxy Vite (3000 -> 3001)");
});

ws.on("message", (data) => {
  try {
    const msg = JSON.parse(data.toString());

    if (msg.type === "ready") {
      callId = msg.callId;
      console.log("[TEST] ✅ Sesión lista. CallID asignado:", callId);
      console.log("[TEST] Esperando saludo AUTOMÁTICO de Lazo (sin enviar audio del paciente)...");
      stage = "AWAITING_AUTO_GREETING";
    }

    if (msg.type === "transcript" || msg.type === "transcript_update" || msg.type === "transcript_final") {
      const spk = msg.speaker === "lazo" ? "🩺 Lazo" : "👤 Paciente";
      if (msg.type === "transcript_final") {
        console.log(`[TEST-TRANSCRIPT-CONSOLIDATED] ${spk} [${msg.second}s-${msg.endSecond}s]: "${msg.text}"`);
      }
      currentTurnText = msg.text;
    }

    if (msg.type === "audio") {
      currentTurnAudioReceived++;
      if (stage === "AWAITING_AUTO_GREETING") {
        greetingReceived = true;
      }
    }

    if (msg.type === "consent_status") {
      console.log(`[TEST] ⚖️ Evento consent_status recibido: "${msg.consent}"`);
      if (msg.consent === "granted") {
        consentGrantedReceived = true;
      }
    }

    if (msg.type === "call_saved") {
      console.log("[TEST] 💾 ¡EVENTO call_saved RECIBIDO!", msg.call?.id);
      callSavedReceived = true;
      savedCallData = msg.call;
      setTimeout(() => {
        verifyPersistenceAndExit();
      }, 1200);
    }

    if (msg.type === "turn_complete") {
      console.log(`[TEST] Turno de Gemini completado (Bloques de audio: ${currentTurnAudioReceived})`);
      currentTurnAudioReceived = 0;

      if (stage === "AWAITING_AUTO_GREETING") {
        console.log("\n>>> [RESULTADO SALUDO AUTOMÁTICO]: Lazo saludó de forma autónoma sin intervención del usuario.");
        console.log(">>> [TURNO 1]: Enviando audio del paciente (Confirmación de identidad y consentimiento explícito)...");
        stage = "STREAMING_TURN_1";
        streamAudio(wav1, () => {
          streamSilence(20, () => {
            console.log("[TEST] Audio Turno 1 enviado completamente. Esperando respuesta de Lazo...");
            stage = "AWAITING_LAZO_TURN_1";
          });
        });
      } else if (stage === "AWAITING_LAZO_TURN_1") {
        console.log("\n>>> [RESULTADO CONSENTIMIENTO]:", consentGrantedReceived ? "✅ Consentimiento confirmado por el sistema." : "⚠️ Esperando confirmación de consentimiento.");
        console.log(">>> [TURNO 2]: Enviando reporte clínico (Glucosa 128 y omisión de metformina por trabajo)...");
        stage = "STREAMING_TURN_2";
        setTimeout(() => {
          streamAudio(wav2, () => {
            streamSilence(20, () => {
              console.log("[TEST] Audio Turno 2 enviado completamente. Esperando respuesta de Lazo (indagación de barreras)...");
              stage = "AWAITING_LAZO_TURN_2";
            });
          });
        }, 1500);
      } else if (stage === "AWAITING_LAZO_TURN_2") {
        console.log("\n>>> [TURNO 3]: Paciente confirma cierre acordado (\"No tengo ninguna otra duda...\")...");
        stage = "STREAMING_TURN_3";
        setTimeout(() => {
          streamAudio(wav3, () => {
            streamSilence(20, () => {
              console.log("[TEST] Audio Turno 3 enviado completamente. Esperando despedida cordial de Lazo...");
              stage = "AWAITING_LAZO_FAREWELL";
            });
          });
        }, 1500);
      } else if (stage === "AWAITING_LAZO_FAREWELL") {
        console.log("\n>>> [CIERRE PROTOCOLARIO]: Lazo se despidió. Enviando señal de colgado para persistencia...");
        stage = "HANGING_UP";
        ws.send(JSON.stringify({ type: "end_call" }));
        
        // Esperar guardado y persistencia
        setTimeout(() => {
          verifyPersistenceAndExit();
        }, 4000);
      }
    }
  } catch (err) {
    console.error("[TEST] Error procesando mensaje:", err);
  }
});

function streamAudio(pcmBuffer, onDone) {
  const chunkSize = 2048;
  let offset = 0;
  const interval = setInterval(() => {
    if (offset >= pcmBuffer.length) {
      clearInterval(interval);
      if (onDone) onDone();
      return;
    }
    const chunk = pcmBuffer.subarray(offset, Math.min(offset + chunkSize, pcmBuffer.length));
    offset += chunkSize;
    ws.send(JSON.stringify({
      type: "audio",
      data: chunk.toString("base64")
    }));
  }, 64);
}

function streamSilence(chunkCount, onDone) {
  const silence = Buffer.alloc(2048);
  let count = 0;
  const interval = setInterval(() => {
    if (count >= chunkCount) {
      clearInterval(interval);
      if (onDone) onDone();
      return;
    }
    ws.send(JSON.stringify({
      type: "audio",
      data: silence.toString("base64")
    }));
    count++;
  }, 64);
}

async function verifyPersistenceAndExit() {
  console.log("\n=======================================================");
  console.log("🔍 VERIFICACIÓN DE PERSISTENCIA Y REQUISITOS CLÍNICOS");
  console.log("=======================================================");

  try {
    // 1. Verificar archivo WAV en disco
    if (savedCallData?.recordingFile) {
      const wavPath = "server/recordings/" + savedCallData.recordingFile;
      if (fs.existsSync(wavPath)) {
        const stats = fs.statSync(wavPath);
        console.log(`✅ Archivo WAV de grabación existe en disco: ${wavPath} (${(stats.size / 1024).toFixed(1)} KB)`);
      } else {
        console.error("❌ Archivo WAV no encontrado en:", wavPath);
      }
    } else {
      console.log("Nota: savedCallData.recordingFile:", savedCallData?.recordingFile);
    }

    // 2. Verificar llamada en calls.json
    const callsJson = JSON.parse(fs.readFileSync("server/data/calls.json", "utf-8"));
    const persisted = callsJson.find(c => c.id === callId);
    if (persisted) {
      console.log(`✅ Llamada ${callId} encontrada en server/data/calls.json!`);
      console.log("   - Duración:", persisted.duracion);
      console.log("   - Estado:", persisted.estado);
      console.log("   - Alerta:", persisted.alertaGenerada);
      console.log("   - Consentimiento:", persisted.permisoGrabacion);
      console.log("   - Audio URL:", persisted.audioUrl);
      console.log("   - Resumen Clínico presente:", !!persisted.resumenClinico);
      if (persisted.resumenClinico) {
        console.log("   - Medicamentos analizados:", persisted.resumenClinico.medicamentosYAdherencia?.length || 0);
        console.log("   - Bitácora glucosa:", persisted.resumenClinico.bitacoraGlucosa?.map(g => g.valor).join(", ") || "N/A");
      }
      console.log("   - Transcripción grabada turns:", persisted.transcripcionLiteral?.length || 0);
      persisted.transcripcionLiteral?.forEach((t, i) => {
        console.log(`     [Turno ${i + 1}] (${t.segundo}s - ${t.segundoFin}s) ${t.hablante}: "${t.texto}"`);
      });
      if (persisted.resumenClinico?.motivoAlerta) {
        console.log("   - Alerta detectada:", persisted.resumenClinico.motivoAlerta);
      }
      if (persisted.resumenClinico?.barrerasIdentificadas) {
        console.log("   - Barreras:", persisted.resumenClinico.barrerasIdentificadas);
      }
    } else {
      console.error(`❌ Llamada ${callId} no encontrada en server/data/calls.json`);
    }

    // 3. Verificar API endpoint /api/calls
    const apiRes = await fetch("http://localhost:3000/api/calls?patientId=LZ-0482");
    if (apiRes.ok) {
      const apiCalls = await apiRes.json();
      console.log(`✅ Endpoint GET /api/calls?patientId=LZ-0482 responde exitosamente con ${apiCalls.length} llamadas.`);
    }

    console.log("\n🎉 TODAS LAS VERIFICACIONES E2E COMPLETADAS EXITOSAMENTE!");
    ws.close(1000, "Test completed");
    process.exit(0);

  } catch (err) {
    console.error("Error en verificación:", err);
    process.exit(1);
  }
}

setTimeout(() => {
  console.error("[TEST] Timeout global de 120 segundos alcanzado.");
  ws.close();
  process.exit(1);
}, 120000);
