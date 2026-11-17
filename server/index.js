import express from "express";
import cors from "cors";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import { config } from "./config.js";
import { GeminiLiveSession } from "./gemini/liveSession.js";
import { getCallsByPatientId, getCallById, getAllCalls, saveCallRecord } from "./services/callPersistenceService.js";
import { generateClinicalSummary } from "./services/clinicalSummaryService.js";
import { recordingService } from "./services/recordingService.js";
import { 
  getAllPatients, 
  getPatientById, 
  createPatient, 
  updatePatient, 
  addAnthropometryMeasurement, 
  updateLifestyle, 
  validateReportedField,
  calculateMifflinStJeor,
  deletePatient 
} from "./services/patientPersistenceService.js";
import { 
  requireReviewerAuth, 
  validateAcademicPasskey, 
  createReviewerSession, 
  getSessionFromRequest,
  BASELINE_PATIENT_IDS
} from "./services/authService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// 1. Diagnóstico del Gateway
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Lazo Clinical Gateway",
    timestamp: new Date().toISOString(),
    gemini: {
      model: config.geminiModel,
      voice: config.geminiVoice,
      hasApiKey: config.hasApiKey,
      status: config.hasApiKey ? "configured" : "missing_api_key"
    }
  });
});

// ==========================================
// RUTAS DE AUTENTICACIÓN ACADÉMICA (SANDBOX)
// ==========================================

app.post("/api/auth/login", (req, res) => {
  try {
    const { passkey, reviewerName } = req.body || {};
    if (!validateAcademicPasskey(passkey)) {
      return res.status(401).json({
        error: "Clave de acceso académica inválida",
        code: "INVALID_PASSKEY",
        message: "La clave ingresada no es válida para la evaluación académica."
      });
    }

    const session = createReviewerSession(reviewerName);
    const maxAgeSec = Math.round(config.sessionMaxAgeMs / 1000);
    const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader(
      "Set-Cookie",
      `${session.cookieName}=${session.cookieValue}; Path=/; Max-Age=${maxAgeSec}; HttpOnly; SameSite=Lax${secureFlag}`
    );

    res.json({
      success: true,
      reviewer: {
        id: session.sessionId,
        name: session.reviewerName
      },
      token: session.cookieValue
    });
  } catch (err) {
    console.error("[Server] Error en autenticación académica:", err);
    res.status(500).json({ error: "Error interno al iniciar sesión académica." });
  }
});

app.get("/api/auth/session", (req, res) => {
  try {
    const session = getSessionFromRequest(req);
    if (session) {
      return res.json({
        authenticated: true,
        reviewer: {
          id: session.sessionId,
          name: session.reviewerName
        }
      });
    }

    if (process.env.NODE_ENV !== "production" && !process.env.ENFORCE_ACADEMIC_PASSKEY) {
      return res.json({
        authenticated: true,
        isLocalDev: true,
        reviewer: {
          id: "local-dev-reviewer",
          name: "Dra. Anamar Cordero Valle (Desarrollo Local)"
        }
      });
    }

    res.json({ authenticated: false });
  } catch (err) {
    res.status(500).json({ error: "Error al verificar sesión." });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.setHeader("Set-Cookie", "lazo_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
  res.json({ success: true, message: "Sesión académica cerrada." });
});

// ==========================================
// RUTAS DE PACIENTES Y EXPEDIENTES (LAZO V2)
// ==========================================

// 2. Obtener lista de pacientes con filtros opcionales
app.get("/api/patients", requireReviewerAuth, (req, res) => {
  try {
    const { search, priority, status } = req.query;
    const patients = getAllPatients({ search, priority, status }, req.reviewer?.id);
    res.json(patients);
  } catch (err) {
    console.error("[Server] Error obteniendo pacientes:", err);
    res.status(500).json({ error: "Error al leer expedientes de pacientes." });
  }
});

// 2.1 Obtener expediente de un paciente específico
app.get("/api/patients/:id", requireReviewerAuth, (req, res) => {
  try {
    const patient = getPatientById(req.params.id, req.reviewer?.id);
    if (!patient) {
      return res.status(404).json({ error: `Paciente con ID ${req.params.id} no encontrado.` });
    }
    res.json(patient);
  } catch (err) {
    console.error(`[Server] Error obteniendo paciente ${req.params.id}:`, err);
    res.status(500).json({ error: "Error al recuperar expediente del paciente." });
  }
});

// 2.2 Alta de nuevo paciente (completo o borrador)
app.post("/api/patients", requireReviewerAuth, async (req, res) => {
  try {
    const patientData = req.body;
    if (!patientData.nombre || !patientData.nombre.trim()) {
      return res.status(400).json({ error: "El nombre completo del paciente es obligatorio." });
    }
    const newPatient = await createPatient(patientData, req.reviewer);
    res.status(201).json({ success: true, patient: newPatient });
  } catch (err) {
    console.warn("[Server] Aviso en alta de paciente:", err.message);
    res.status(err.statusCode || 500).json({ 
      error: err.message || "Error al registrar paciente.",
      code: err.code || "CREATE_PATIENT_ERROR"
    });
  }
});

// 2.3 Edición de datos generales o clínicos del paciente
app.put("/api/patients/:id", requireReviewerAuth, async (req, res) => {
  try {
    const updated = await updatePatient(req.params.id, req.body, req.reviewer);
    res.json({ success: true, patient: updated });
  } catch (err) {
    console.warn(`[Server] Aviso editando paciente ${req.params.id}:`, err.message);
    res.status(err.statusCode || 500).json({ 
      error: err.message || "Error al actualizar paciente.",
      code: err.code || "UPDATE_PATIENT_ERROR"
    });
  }
});

// 2.3b Eliminación protegida de paciente (bloqueo absoluto de pacientes basales)
app.delete("/api/patients/:id", requireReviewerAuth, async (req, res) => {
  try {
    const result = await deletePatient(req.params.id, req.reviewer);
    res.json(result);
  } catch (err) {
    console.warn(`[Server] Error al eliminar paciente ${req.params.id}:`, err.message);
    res.status(err.statusCode || 500).json({ 
      error: err.message || "Error al eliminar paciente.",
      code: err.code || "DELETE_PATIENT_ERROR"
    });
  }
});

// 2.4 Registrar toma antropométrica con cálculo determinista de IMC e ICC
app.post("/api/patients/:id/anthropometry", requireReviewerAuth, async (req, res) => {
  try {
    const result = await addAnthropometryMeasurement(req.params.id, req.body, req.reviewer);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    console.warn(`[Server] Error registrando antropometría para ${req.params.id}:`, err.message);
    res.status(err.statusCode || 500).json({ 
      error: err.message || "Error al guardar medición antropométrica.",
      code: err.code || "ANTHROPOMETRY_ERROR"
    });
  }
});

// 2.5 Actualizar estilo de vida (actividad física o alimentación) con procedencia
app.put("/api/patients/:id/lifestyle", requireReviewerAuth, async (req, res) => {
  try {
    const updated = await updateLifestyle(req.params.id, req.body, req.reviewer);
    res.json({ success: true, patient: updated });
  } catch (err) {
    console.warn(`[Server] Error actualizando estilo de vida para ${req.params.id}:`, err.message);
    res.status(err.statusCode || 500).json({ 
      error: err.message || "Error al actualizar estilo de vida.",
      code: err.code || "LIFESTYLE_ERROR"
    });
  }
});

// 2.6 Validar o rectificar dato clínico reportado por llamada
app.put("/api/patients/:id/validate-field", requireReviewerAuth, async (req, res) => {
  try {
    const updated = await validateReportedField(req.params.id, req.body, req.reviewer);
    res.json({ success: true, patient: updated });
  } catch (err) {
    console.warn(`[Server] Error validando campo para ${req.params.id}:`, err.message);
    res.status(err.statusCode || 500).json({ 
      error: err.message || "Error al validar dato clínico.",
      code: err.code || "VALIDATION_ERROR"
    });
  }
});

// 2.7 Cálculo de requerimientos energéticos Mifflin–St Jeor (1990)
app.get("/api/patients/:id/energy-requirements", requireReviewerAuth, (req, res) => {
  try {
    const patient = getPatientById(req.params.id, req.reviewer?.id);
    if (!patient) {
      return res.status(404).json({ error: `Paciente con ID ${req.params.id} no encontrado.` });
    }

    const activityFactor = parseFloat(req.query.activityFactor) || 1.0;
    const latestMeasurement = patient.antropometria?.mediciones?.slice(-1)[0];

    const weightKg = latestMeasurement?.peso;
    const heightCm = latestMeasurement?.talla;
    const ageYears = patient.edad;
    const sex = patient.sexo;

    const result = calculateMifflinStJeor({
      weightKg,
      heightCm,
      ageYears,
      sex,
      activityFactor
    });

    res.json({
      ...result,
      fechaMedicionUtilizada: latestMeasurement?.fecha || null
    });
  } catch (err) {
    console.error(`[Server] Error calculando requerimientos energéticos para ${req.params.id}:`, err);
    res.status(500).json({ error: "Error al calcular requerimientos energéticos." });
  }
});

// ==========================================
// RUTAS DE TELEFONÍA Y LLAMADAS (LAZO V1)
// ==========================================

// 3. Contexto de llamada para paciente
app.get("/api/call/context", requireReviewerAuth, (req, res) => {
  const patientId = req.query.patientId || "LZ-0482";
  res.json({
    patientId,
    ready: true,
    protocol: "NOM-004-SSA3-2012 / Lazo V1",
    instructions: "Sesión lista para conectar vía WebSocket en /ws/live-call?patientId=" + patientId
  });
});

// 4. Obtener llamadas persistidas de un paciente
app.get("/api/calls", requireReviewerAuth, (req, res) => {
  const patientId = req.query.patientId;
  if (!patientId) {
    return res.json(getAllCalls(req.reviewer?.id));
  }
  const patientCalls = getCallsByPatientId(patientId, req.reviewer?.id);
  res.json(patientCalls);
});

// 4.1 Detalle de una llamada específica
app.get("/api/calls/:callId", requireReviewerAuth, (req, res) => {
  const call = getCallById(req.params.callId, req.reviewer?.id);
  if (!call) {
    return res.status(404).json({ error: "Llamada no encontrada", callId: req.params.callId });
  }
  res.json(call);
});

// 4.1 Reintento manual o automático de documentación clínica para llamadas con error o pendientes
app.post("/api/calls/:callId/retry-summary", async (req, res) => {
  const callId = req.params.callId;
  const call = getCallById(callId);
  if (!call) {
    return res.status(404).json({ error: "Llamada no encontrada", callId });
  }

  if (!call.transcripcionLiteral || call.transcripcionLiteral.length === 0) {
    return res.status(400).json({ error: "La llamada no cuenta con transcripción para procesar." });
  }

  try {
    call.resumenEstado = "processing";
    call.estado = "Procesando documentación";
    saveCallRecord(call);

    const summary = await generateClinicalSummary({
      transcript: call.transcripcionLiteral,
      patient: { id: call.patientId, nombre: "Roberto Méndez Silva" },
      callMetadata: {
        callId: call.id,
        durationSeconds: call.duracionSegundos,
        consentState: call.consentimiento?.grabacion ? "GRANTED" : "DENIED"
      }
    });

    call.resumenClinico = summary;
    call.resumenEstado = "completed";
    call.alertaGenerada = summary?.alertaGenerada || "Normal (Seguimiento rutinario)";
    call.estado = summary?.alertaGenerada?.includes("Emergencia") ? "Interrumpida por seguridad" : "Completada";
    saveCallRecord(call);

    res.json({ success: true, call });
  } catch (err) {
    call.resumenEstado = "error";
    call.estado = "Error de documentación (Reintentable)";
    call.errorDetalle = err.message;
    saveCallRecord(call);
    res.status(500).json({ error: "Error al reintentar resumen", detalle: err.message });
  }
});

// 5. Servir grabaciones de audio WAV protegidas y auditables con soporte de streaming
app.get("/api/recordings/:fileName", (req, res) => {
  const rawFileName = req.params.fileName;
  const safeFileName = path.basename(rawFileName).replace(/[^a-zA-Z0-9_.-]/g, "");
  
  if (!safeFileName.endsWith(".wav")) {
    return res.status(400).json({ error: "Formato de archivo no admitido" });
  }

  const callId = safeFileName.replace(/\.wav$/, "");
  const call = getCallById(callId);

  // Validación de seguridad y consentimiento: no servir si no existe la llamada o no se autorizó
  if (call && call.grabacionConservada === false) {
    return res.status(403).json({ 
      error: "Grabación no disponible", 
      motivo: "El paciente no autorizó la conservación de la grabación de esta llamada." 
    });
  }

  const recordingPath = recordingService.getRecordingPath(callId);
  if (!recordingPath || !fs.existsSync(recordingPath)) {
    return res.status(404).json({ 
      error: "Archivo de grabación no encontrado", 
      callId 
    });
  }

  const stat = fs.statSync(recordingPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Soporte para HTTP Range requests (scrubbing en reproductor HTML5)
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(recordingPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "audio/wav"
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "audio/wav",
      "Accept-Ranges": "bytes"
    };
    res.writeHead(200, head);
    fs.createReadStream(recordingPath).pipe(res);
  }
});

const server = http.createServer(app);

// 6. Servidor de WebSockets para audio bidireccional en vivo
const wss = new WebSocketServer({ 
  server, 
  path: "/ws/live-call" 
});

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const patientId = url.searchParams.get("patientId") || "LZ-0482";
  const session = getSessionFromRequest(req);
  const reviewer = session ? {
    id: session.sessionId,
    name: session.reviewerName
  } : {
    id: "local-dev-reviewer",
    name: "Evaluador Académico"
  };

  console.log(`[Server] Nueva conexión WebSocket para llamada en vivo (Paciente: ${patientId}, Revisor: ${reviewer.name})`);

  const patientRecord = getPatientById(patientId, reviewer.id);

  const sessionPatient = patientRecord ? {
    id: patientRecord.id,
    nombre: patientRecord.nombre,
    isBaseline: patientRecord.isBaseline,
    fechaNacimiento: patientRecord.fechaNacimiento || "14/05/1964",
    edad: patientRecord.edad || 62,
    sexo: patientRecord.sexo || "Masculino",
    diagnosticos: patientRecord.diagnosticoPrincipal + (patientRecord.diagnosticosSecundarios?.length ? `, ${patientRecord.diagnosticosSecundarios.join(", ")}` : ""),
    medicoTratante: patientRecord.medicoTratante || "Dra. Anamar Cordero Valle",
    medicacion: patientRecord.medicacion?.length ? patientRecord.medicacion : [
      { nombre: "Metformina", dosis: "850 mg", pauta: "1 tableta cada 12 horas con alimentos" },
      { nombre: "Insulina Glargina", dosis: "18 UI", pauta: "18 UI nocturna subcutánea al acostarse" }
    ],
    metasGlucosa: "Ayuno 80-130 mg/dL, Posprandial < 180 mg/dL, HbA1c < 7.0%"
  } : {
    id: patientId,
    nombre: patientId === "LZ-0195" ? "Carlos Salinas Morales" : "Roberto Méndez Silva",
    isBaseline: true,
    fechaNacimiento: patientId === "LZ-0195" ? "22/08/1958" : "14/05/1964",
    edad: patientId === "LZ-0195" ? 68 : 62,
    sexo: "Masculino",
    diagnosticos: "Diabetes Mellitus Tipo 2, Hipertensión Arterial Sistémica",
    medicoTratante: "Dra. Anamar Cordero Valle",
    medicacion: [
      { nombre: "Metformina", dosis: "850 mg", pauta: "1 tableta cada 12 horas con alimentos" },
      { nombre: "Insulina Glargina", dosis: "18 UI", pauta: "18 UI nocturna subcutánea al acostarse" }
    ],
    metasGlucosa: "Ayuno 80-130 mg/dL, Posprandial < 180 mg/dL, HbA1c < 7.0%"
  };

  new GeminiLiveSession(ws, { patient: sessionPatient, reviewer });
});

server.listen(config.port, () => {
  console.log("=======================================================");
  console.log("🩺 LAZO V1 — Backend Gateway & Gemini Live Server");
  console.log(`🚀 Servidor HTTP escuchando en: http://localhost:${config.port}`);
  console.log(`🎙️  WebSocket Live Call en:      ws://localhost:${config.port}/ws/live-call`);
  console.log(`📂 Endpoints de llamadas:       http://localhost:${config.port}/api/calls`);
  console.log(`🔑 Estado de GEMINI_API_KEY:    ${config.hasApiKey ? "✅ CONFIGURADA" : "⚠️  PENDIENTE"}`);
  console.log(`🤖 Modelo asignado:             ${config.geminiModel}`);
  console.log("=======================================================");
});
