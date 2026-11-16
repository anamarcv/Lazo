import fs from "fs";
import WebSocket from "ws";

const wavDenial = fs.readFileSync("/tmp/patient_denial.wav").subarray(44);

console.log("Audio Denial:", wavDenial.length, "bytes (~" + (wavDenial.length / 32000).toFixed(1) + "s)");

console.log("\n=======================================================");
console.log("🧪 TEST E2E: RECHAZO DE CONSENTIMIENTO Y PURGA DE AUDIO");
console.log("=======================================================\n");

const ws = new WebSocket("ws://localhost:3000/ws/live-call?patientId=LZ-0482");

let callId = null;
let consentDeniedReceived = false;
let savedCall = null;

ws.on("message", (data) => {
  try {
    const msg = JSON.parse(data.toString());

    if (msg.type === "ready") {
      callId = msg.callId;
      console.log("[TEST-DENIAL] Sesion lista:", callId);
    }

    if (msg.type === "transcript" || msg.type === "transcript_final") {
      console.log(`[TEST-TRANSCRIPT] ${msg.speaker === "lazo" ? "🩺 Lazo" : "👤 Paciente"}: "${msg.text}"`);
    }

    if (msg.type === "consent_status") {
      console.log("[TEST-DENIAL] consent_status:", msg.consent);
      if (msg.consent === "denied") {
        consentDeniedReceived = true;
      }
    }

    if (msg.type === "call_saved") {
      console.log("[TEST-DENIAL] 💾 call_saved recibido:", msg.call?.id);
      savedCall = msg.call;
    }

    if (msg.type === "turn_complete") {
      if (!consentDeniedReceived) {
        console.log("[TEST-DENIAL] Saludo recibido. Enviando rechazo verbal...");
        streamAudio(wavDenial, () => {
          streamSilence(15, () => {
            console.log("[TEST-DENIAL] Rechazo enviado. Esperando respuesta de Lazo...");
          });
        });
      }
    }
  } catch (e) {
    console.error(e);
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
    ws.send(JSON.stringify({ type: "audio", data: chunk.toString("base64") }));
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
    ws.send(JSON.stringify({ type: "audio", data: silence.toString("base64") }));
    count++;
  }, 64);
}

ws.on("close", () => {
  console.log("[TEST-DENIAL] Conexión cerrada. Verificando purga de audio...");
  setTimeout(() => {
    const wavPath = "server/recordings/" + callId + ".wav";
    const fileExists = fs.existsSync(wavPath);
    console.log("¿Existe archivo WAV en disco?:", fileExists ? "❌ ERROR: El audio debió purgarse" : "✅ CORRECTO: Audio purgado de disco");
    console.log("Estado de la llamada guardada:", savedCall?.estado);
    console.log("Permiso grabación:", savedCall?.permisoGrabacion);
    console.log("AudioURL:", savedCall?.audioUrl);
    process.exit(0);
  }, 1000);
});

setTimeout(() => {
  console.log("[TEST-DENIAL] Timeout.");
  process.exit(1);
}, 30000);
