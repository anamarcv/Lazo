import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde server/.env si existe, o desde la raíz
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  geminiApiKey: (process.env.GEMINI_API_KEY || '').trim(),
  geminiModel: process.env.GEMINI_LIVE_MODEL || 'models/gemini-2.5-flash-native-audio-preview-12-2025',
  geminiVoice: process.env.GEMINI_VOICE || 'Aoede',

  // Gemini Live WebSocket URL base
  geminiLiveWsUrl: 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent',

  // Límites de duración de llamada clínica
  callMaxDurationSeconds: parseInt(process.env.CALL_MAX_DURATION_SECONDS, 10) || 300,
  callWarningDurationSeconds: parseInt(process.env.CALL_WARNING_DURATION_SECONDS, 10) || 270,

  // Control de concurrencia de llamadas en vivo
  maxConcurrentCalls: parseInt(process.env.MAX_CONCURRENT_CALLS, 10) || 3,

  // Seguridad y Acceso Académico (estrictamente por variables de entorno, sin secretos en código)
  academicPasskey: (process.env.ACADEMIC_PASSKEY || '').trim(),
  sessionSecret: (process.env.SESSION_SECRET || '').trim() || crypto.randomBytes(32).toString('hex'),
  sessionMaxAgeMs: 1000 * 60 * 60 * 24, // 24 horas

  // Base de datos y Almacenamiento
  databaseUrl: (process.env.DATABASE_URL || '').trim(),
  storageProvider: (process.env.STORAGE_PROVIDER || 'local').trim(),

  get hasApiKey() {
    return Boolean(this.geminiApiKey && this.geminiApiKey !== 'tu_clave_api_aqui' && this.geminiApiKey.trim().length > 10);
  },

  get hasAcademicPasskey() {
    return Boolean(this.academicPasskey && this.academicPasskey.length >= 8);
  }
};
