import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RECORDINGS_DIR = path.resolve(__dirname, "../recordings");

if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

/**
 * Gestor de Grabación Sincronizada y de Alta Fidelidad para LAZO V1.
 * 
 * Principios técnicos:
 * 1. El canal del paciente es un flujo continuo de muestras PCM a 16 kHz desde el micrófono.
 * 2. Cada intervención de Lazo (Gemini Live) se captura como un turno completo en PCM 24 kHz
 *    y se remuestrea en bloque a 16 kHz al concluir el turno, eliminando discontinuidades
 *    de borde y ráfagas desincronizadas.
 * 3. Ambas pistas se alinean sobre una línea de tiempo compartida basada en muestras reales.
 * 4. La mezcla estéreo resultante ofrece audibilidad en ambos canales con separación confortable
 *    y limitador suave para impedir saturación o distorsión digital.
 */
class RecordingService {
  constructor() {
    this.sessions = new Map();
  }

  startSession(callId, patientId) {
    this.sessions.set(callId, {
      callId,
      patientId,
      startTime: Date.now(),
      // Muestras contiguas del paciente (16 kHz, Int16)
      patientChunks: [],
      patientSampleCount: 0,
      // Turnos de Lazo (Gemini Live)
      lazoTurns: [],
      currentLazoTurn: null,
      consentGranted: false,
      lastActivityTime: Date.now()
    });
    console.log(`[RecordingService] 🎙️ Sesión de grabación iniciada: ${callId} (Paciente: ${patientId})`);
  }

  setConsent(callId, granted) {
    const session = this.sessions.get(callId);
    if (session) {
      session.consentGranted = !!granted;
      console.log(`[RecordingService] 📋 Consentimiento para ${callId}: ${session.consentGranted ? "OTORGADO" : "DENEGADO"}`);
    }
  }

  /**
   * Acumula audio continuo del paciente (16 kHz Int16)
   */
  appendPatientAudio(callId, pcm16Buffer) {
    const session = this.sessions.get(callId);
    if (!session) return;

    session.lastActivityTime = Date.now();

    const int16 = pcm16Buffer instanceof Int16Array
      ? pcm16Buffer
      : new Int16Array(pcm16Buffer.buffer, pcm16Buffer.byteOffset, Math.floor(pcm16Buffer.byteLength / 2));

    if (int16.length === 0) return;

    session.patientChunks.push(int16);
    session.patientSampleCount += int16.length;
  }

  /**
   * Registra audio de Lazo (Gemini Live, 24 kHz Int16) dentro del turno activo
   */
  appendLazoAudio(callId, pcm24Buffer) {
    const session = this.sessions.get(callId);
    if (!session) return;

    session.lastActivityTime = Date.now();

    const int16 = pcm24Buffer instanceof Int16Array
      ? pcm24Buffer
      : new Int16Array(pcm24Buffer.buffer, pcm24Buffer.byteOffset, Math.floor(pcm24Buffer.byteLength / 2));

    if (int16.length === 0) return;

    // Si no hay un turno de Lazo activo, inicializarlo
    if (!session.currentLazoTurn) {
      // El turno de Lazo inicia en la posición temporal actual del canal de audio (16 kHz)
      const startSample16k = session.patientSampleCount > 0 
        ? session.patientSampleCount 
        : Math.floor(((Date.now() - session.startTime) / 1000) * 16000);

      session.currentLazoTurn = {
        startSample16k,
        chunks24k: []
      };
    }

    session.currentLazoTurn.chunks24k.push(int16);
  }

  /**
   * Cierra el turno de habla activo de Lazo, remuestrea su audio en bloque de 24 kHz a 16 kHz
   * y lo fija en la línea de tiempo.
   */
  finalizeLazoTurn(callId) {
    const session = this.sessions.get(callId);
    if (!session || !session.currentLazoTurn) return;

    const turn = session.currentLazoTurn;
    session.currentLazoTurn = null;

    if (!turn.chunks24k || turn.chunks24k.length === 0) return;

    // 1. Concatenar todas las muestras de 24 kHz de la intervención
    let total24kSamples = 0;
    for (const c of turn.chunks24k) {
      total24kSamples += c.length;
    }

    const full24k = new Int16Array(total24kSamples);
    let offset = 0;
    for (const c of turn.chunks24k) {
      full24k.set(c, offset);
      offset += c.length;
    }

    // 2. Remuestrear el turno completo de 24 kHz a 16 kHz de forma continua
    const samples16k = this.resample24kTo16k(full24k);

    session.lazoTurns.push({
      startSample16k: turn.startSample16k,
      samples: samples16k
    });

    console.log(`[RecordingService] 🩺 Turno de Lazo consolidado: ${samples16k.length} muestras 16k (~${(samples16k.length / 16000).toFixed(1)}s) en offset ${turn.startSample16k}`);
  }

  /**
   * Remuestreo de alta fidelidad con interpolación lineal y preservación de fase de 24 kHz a 16 kHz.
   * Relación: 24000 / 16000 = 1.5
   */
  resample24kTo16k(int16Array) {
    if (!int16Array || int16Array.length === 0) return new Int16Array(0);

    const ratio = 1.5; // 24000 / 16000
    const outLength = Math.floor(int16Array.length / ratio);
    const output = new Int16Array(outLength);

    for (let i = 0; i < outLength; i++) {
      const srcPos = i * ratio;
      const srcIdx = Math.floor(srcPos);
      const frac = srcPos - srcIdx;
      const nextIdx = Math.min(srcIdx + 1, int16Array.length - 1);
      
      const s0 = int16Array[srcIdx];
      const s1 = int16Array[nextIdx];
      const interp = s0 * (1 - frac) + s1 * frac;
      
      output[i] = Math.max(-32768, Math.min(32767, Math.round(interp)));
    }

    return output;
  }

  finalizeSession(callId, explicitConsent = null) {
    const session = this.sessions.get(callId);
    if (!session) {
      return { saved: false, reason: "SESSION_NOT_FOUND" };
    }

    // Finalizar cualquier turno pendiente de Lazo
    if (session.currentLazoTurn) {
      this.finalizeLazoTurn(callId);
    }

    const consent = explicitConsent !== null ? explicitConsent : session.consentGranted;

    if (!consent) {
      console.warn(`[RecordingService] ⚠️ Sesión ${callId} finalizada SIN consentimiento. Purgando audio transitorio.`);
      this.sessions.delete(callId);
      return {
        saved: false,
        reason: "NO_CONSENT",
        durationSeconds: Math.round((Date.now() - session.startTime) / 1000)
      };
    }

    // Ensamblar canal del paciente
    const patientTotal = session.patientSampleCount;
    const trackPatient = new Int16Array(patientTotal);
    let pOffset = 0;
    for (const chunk of session.patientChunks) {
      trackPatient.set(chunk, pOffset);
      pOffset += chunk.length;
    }

    // Calcular longitud total requerida considerando todas las intervenciones de Lazo
    let maxLazoSample = 0;
    for (const turn of session.lazoTurns) {
      const end = turn.startSample16k + turn.samples.length;
      if (end > maxLazoSample) maxLazoSample = end;
    }

    const totalSamples = Math.max(patientTotal, maxLazoSample, 16000); // Mínimo 1 segundo
    const durationSeconds = Math.max(1, Math.round(totalSamples / 16000));

    // Ensamblar canal de Lazo alineado cronológicamente
    const trackLazo = new Int16Array(totalSamples);
    for (const turn of session.lazoTurns) {
      const start = turn.startSample16k;
      for (let i = 0; i < turn.samples.length; i++) {
        const dest = start + i;
        if (dest < totalSamples) {
          trackLazo[dest] = turn.samples[i];
        }
      }
    }

    console.log(`[RecordingService] 💾 Ensamblando audio WAV para ${callId}: ${durationSeconds}s (${totalSamples} muestras por canal)...`);

    // Construir WAV estéreo balanceado (ambos interlocutores con inteligibilidad clara en ambos oídos)
    const wavBuffer = this.buildComfortStereoWav(trackPatient, trackLazo, 16000);
    const fileName = `${callId}.wav`;
    const filePath = path.join(RECORDINGS_DIR, fileName);

    try {
      fs.writeFileSync(filePath, wavBuffer);
      console.log(`[RecordingService] ✅ Grabación guardada exitosamente: ${filePath} (${(wavBuffer.length / 1024).toFixed(1)} KB)`);
      this.sessions.delete(callId);

      return {
        saved: true,
        fileName,
        filePath,
        durationSeconds,
        sizeBytes: wavBuffer.length
      };
    } catch (err) {
      console.error(`[RecordingService] ❌ Error guardando archivo WAV para ${callId}:`, err);
      this.sessions.delete(callId);
      return {
        saved: false,
        reason: "WRITE_ERROR",
        error: err.message,
        durationSeconds
      };
    }
  }

  /**
   * Genera un archivo WAV estéreo (16 kHz, 16-bit PCM) con mezcla confortable:
   * Canal Izquierdo: 75% Paciente + 25% Lazo
   * Canal Derecho:   75% Lazo + 25% Paciente
   * Garantiza separación estéreo clara pero evita que un interlocutor sea inaudible
   * si se utiliza un solo audífono o bocina mono. Aplica limitador suave para evitar clipping.
   */
  buildComfortStereoWav(trackPatient, trackLazo, sampleRate = 16000) {
    const numSamples = Math.max(trackPatient.length, trackLazo.length);
    const numChannels = 2;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const dataSize = numSamples * numChannels * bytesPerSample;
    const buffer = Buffer.alloc(44 + dataSize);

    // Cabecera RIFF canónica
    buffer.write("RIFF", 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write("WAVE", 8);
    buffer.write("fmt ", 12);
    buffer.writeUInt32LE(16, 16); // Tamaño del subchunk fmt
    buffer.writeUInt16LE(1, 20);  // AudioFormat: PCM (1)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // ByteRate
    buffer.writeUInt16LE(numChannels * bytesPerSample, 32);              // BlockAlign
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write("data", 36);
    buffer.writeUInt32LE(dataSize, 40);

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const p = i < trackPatient.length ? trackPatient[i] : 0;
      const l = i < trackLazo.length ? trackLazo[i] : 0;

      // Mezcla estéreo confortable
      const leftMixed = p * 0.75 + l * 0.25;
      const rightMixed = l * 0.75 + p * 0.25;

      // Limitador suave para evitar cualquier saturación
      const leftClamped = Math.max(-32768, Math.min(32767, Math.round(leftMixed)));
      const rightClamped = Math.max(-32768, Math.min(32767, Math.round(rightMixed)));

      buffer.writeInt16LE(leftClamped, offset);
      buffer.writeInt16LE(rightClamped, offset + 2);
      offset += 4;
    }

    return buffer;
  }

  discardSession(callId) {
    if (this.sessions.has(callId)) {
      console.log(`[RecordingService] 🗑️ Sesión ${callId} descartada de memoria.`);
      this.sessions.delete(callId);
    }
  }

  getRecordingPath(callId) {
    const safeId = path.basename(callId).replace(/[^a-zA-Z0-9_-]/g, "");
    const filePath = path.join(RECORDINGS_DIR, `${safeId}.wav`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }
}

export const recordingService = new RecordingService();
