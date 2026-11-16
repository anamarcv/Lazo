import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
 * Lee todas las llamadas persistidas en server/data/calls.json
 */
export function getAllCalls() {
  try {
    if (!fs.existsSync(CALLS_FILE)) return [];
    const content = fs.readFileSync(CALLS_FILE, "utf-8");
    return JSON.parse(content || "[]");
  } catch (err) {
    console.error("[CallPersistence] Error leyendo calls.json:", err);
    return [];
  }
}

/**
 * Obtiene las llamadas de un paciente específico (ordenadas de más reciente a más antigua)
 */
export function getCallsByPatientId(patientId) {
  const calls = getAllCalls();
  return calls.filter(c => c.patientId === patientId);
}

/**
 * Guarda una nueva llamada o actualiza una existente en calls.json de forma atómica y segura
 */
export function saveCallRecord(callRecord) {
  try {
    const calls = getAllCalls();
    const existingIndex = calls.findIndex(c => c.id === callRecord.id);

    if (existingIndex >= 0) {
      calls[existingIndex] = { ...calls[existingIndex], ...callRecord, updatedAt: new Date().toISOString() };
    } else {
      calls.unshift({ ...callRecord, createdAt: new Date().toISOString() });
    }

    // Escritura atómica mediante archivo temporal para evitar corrupción
    const tempFile = CALLS_FILE + ".tmp." + Date.now();
    fs.writeFileSync(tempFile, JSON.stringify(calls, null, 2), "utf-8");
    fs.renameSync(tempFile, CALLS_FILE);

    console.log("[CallPersistence] ✅ Llamada guardada exitosamente:", callRecord.id, "(Paciente:", callRecord.patientId, ")");
    return true;
  } catch (err) {
    console.error("[CallPersistence] ❌ Error guardando llamada en calls.json:", err);
    return false;
  }
}

export function getCallById(callId) {
  const calls = getAllCalls();
  return calls.find(c => c.id === callId) || null;
}
