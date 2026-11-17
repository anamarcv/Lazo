import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BASELINE_PATIENT_IDS } from "./authService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data");
const CALLS_FILE = path.join(DATA_DIR, "calls.json");

// Asegurar que server/data existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inicializar calls.json si no existe
if (!fs.existsSync(CALLS_FILE)) {
  fs.writeFileSync(CALLS_FILE, JSON.stringify([], null, 2), "utf-8");
}

/**
 * Lee todas las llamadas persistidas en server/data/calls.json con aislamiento opcional por evaluador
 */
export function getAllCalls(reviewerId = null) {
  try {
    if (!fs.existsSync(CALLS_FILE)) return [];
    const content = fs.readFileSync(CALLS_FILE, "utf-8");
    const calls = JSON.parse(content || "[]");

    if (reviewerId !== null && reviewerId !== undefined) {
      return calls.filter(c => 
        !c.revisorId || 
        c.revisorId === reviewerId || 
        BASELINE_PATIENT_IDS.has(c.patientId)
      );
    }
    return calls;
  } catch (err) {
    console.error("[CallPersistence] Error leyendo calls.json:", err);
    return [];
  }
}

/**
 * Obtiene las llamadas de un paciente específico (ordenadas de más reciente a más antigua)
 */
export function getCallsByPatientId(patientId, reviewerId = null) {
  const calls = getAllCalls(reviewerId);
  return calls.filter(c => c.patientId === patientId);
}

/**
 * Guarda una nueva llamada o actualiza una existente en calls.json de forma atómica y segura
 */
export function saveCallRecord(callRecord, reviewerId = null) {
  try {
    const calls = getAllCalls(null); // leer todas para no perder las de otros evaluadores
    const existingIndex = calls.findIndex(c => c.id === callRecord.id);

    const recordToSave = {
      ...callRecord,
      revisorId: callRecord.revisorId || reviewerId || null
    };

    if (existingIndex >= 0) {
      calls[existingIndex] = { ...calls[existingIndex], ...recordToSave, updatedAt: new Date().toISOString() };
    } else {
      calls.unshift({ ...recordToSave, createdAt: new Date().toISOString() });
    }

    // Escritura atómica mediante archivo temporal para evitar corrupción
    const tempFile = CALLS_FILE + ".tmp." + Date.now();
    fs.writeFileSync(tempFile, JSON.stringify(calls, null, 2), "utf-8");
    fs.renameSync(tempFile, CALLS_FILE);

    console.log("[CallPersistence] ✅ Llamada guardada exitosamente:", recordToSave.id, "(Paciente:", recordToSave.patientId, ")");
    return true;
  } catch (err) {
    console.error("[CallPersistence] ❌ Error guardando llamada en calls.json:", err);
    return false;
  }
}

export function getCallById(callId, reviewerId = null) {
  const calls = getAllCalls(reviewerId);
  return calls.find(c => c.id === callId) || null;
}

