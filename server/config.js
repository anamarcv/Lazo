import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde server/.env si existe, o desde la raíz
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_LIVE_MODEL || 'models/gemini-2.5-flash-native-audio-preview-12-2025',
  geminiVoice: process.env.GEMINI_VOICE || 'Aoede',

  // Gemini Live WebSocket URL base
  geminiLiveWsUrl: 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent',

  get hasApiKey() {
    return Boolean(this.geminiApiKey && this.geminiApiKey !== 'tu_clave_api_aqui' && this.geminiApiKey.trim().length > 10);
  }
};
