/**
 * LAZO — Servicio de Autenticación y Sesión de Evaluación Académica
 * 
 * Implementa control de acceso mediante clave académica compartida (passkey),
 * generación de sesiones independientes con cookies HttpOnly/SameSite firmadas con HMAC SHA-256,
 * y reglas de pertenencia por recurso en el backend.
 */

import crypto from "crypto";
import { config } from "../config.js";

// Conjunto inmutable de los 6 pacientes originales de referencia clínica
export const BASELINE_PATIENT_IDS = new Set([
  "LZ-0482", // Roberto Méndez Silva
  "LZ-0319", // Elena Garza Villarreal
  "LZ-0195", // Carlos Salinas Morales
  "LZ-0512", // Martha Sánchez Treviño
  "LZ-0513", // Alejandro Pérez
  "LZ-0514"  // María López
]);

const COOKIE_NAME = "lazo_session";

/**
 * Almacén en memoria de sesiones activas (persistible en PostgreSQL al migrar)
 */
const activeSessions = new Map();

/**
 * Firma un valor mediante HMAC SHA-256
 */
function signToken(value) {
  const hmac = crypto.createHmac("sha256", config.sessionSecret);
  hmac.update(value);
  const signature = hmac.digest("base64url");
  return `${value}.${signature}`;
}

/**
 * Verifica y extrae el valor de un token firmado
 */
function verifyToken(signedToken) {
  if (!signedToken || typeof signedToken !== "string") return null;
  const lastDot = signedToken.lastIndexOf(".");
  if (lastDot === -1) return null;

  const value = signedToken.substring(0, lastDot);
  const signature = signedToken.substring(lastDot + 1);

  const expectedHmac = crypto.createHmac("sha256", config.sessionSecret);
  expectedHmac.update(value);
  const expectedSignature = expectedHmac.digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  return value;
}

/**
 * Parsea cookies desde el encabezado raw de la petición
 */
export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;

  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx < 0) continue;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  }
  return cookies;
}

/**
 * Crea una nueva sesión académica
 */
export function createReviewerSession(reviewerName = "Evaluador Académico") {
  const sessionId = crypto.randomUUID();
  const sessionData = {
    sessionId,
    reviewerName: (reviewerName || "Evaluador Académico").trim().slice(0, 100),
    createdAt: Date.now(),
    expiresAt: Date.now() + config.sessionMaxAgeMs
  };

  activeSessions.set(sessionId, sessionData);

  const payloadStr = JSON.stringify({
    sid: sessionId,
    name: sessionData.reviewerName,
    exp: sessionData.expiresAt
  });

  const signedCookie = signToken(Buffer.from(payloadStr).toString("base64url"));

  return {
    sessionId,
    reviewerName: sessionData.reviewerName,
    cookieName: COOKIE_NAME,
    cookieValue: signedCookie,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: config.sessionMaxAgeMs,
      path: "/"
    }
  };
}

/**
 * Valida la sesión desde la petición HTTP
 */
export function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const rawCookie = cookies[COOKIE_NAME];
  if (!rawCookie) return null;

  const verifiedPayload = verifyToken(rawCookie);
  if (!verifiedPayload) return null;

  try {
    const jsonStr = Buffer.from(verifiedPayload, "base64url").toString("utf-8");
    const data = JSON.parse(jsonStr);

    if (!data.sid || !data.exp || data.exp < Date.now()) {
      return null;
    }

    return {
      sessionId: data.sid,
      reviewerName: data.name || "Evaluador Académico",
      expiresAt: data.exp
    };
  } catch (err) {
    return null;
  }
}

/**
 * Middleware para rutas protegidas del API
 */
export function requireReviewerAuth(req, res, next) {
  const session = getSessionFromRequest(req);

  if (session) {
    req.reviewer = {
      id: session.sessionId,
      name: session.reviewerName
    };
    return next();
  }

  // Si no hay sesión válida, comprobar si se envió el token en encabezado Authorization (Bearer)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const verified = verifyToken(token);
    if (verified) {
      try {
        const jsonStr = Buffer.from(verified, "base64url").toString("utf-8");
        const data = JSON.parse(jsonStr);
        if (data.sid && data.exp > Date.now()) {
          req.reviewer = { id: data.sid, name: data.name || "Evaluador Académico" };
          return next();
        }
      } catch {}
    }
  }

  // En entorno local de pruebas/desarrollo, si no se exige passkey estricto, asignamos sesión local por defecto
  if (process.env.NODE_ENV !== "production" && !process.env.ENFORCE_ACADEMIC_PASSKEY) {
    req.reviewer = {
      id: "local-dev-reviewer",
      name: "Dra. Anamar Cordero Valle (Desarrollo Local)"
    };
    return next();
  }

  return res.status(401).json({
    error: "Acceso no autorizado",
    code: "SESSION_REQUIRED",
    message: "Debe ingresar con la clave de acceso de evaluación académica para consultar o crear expedientes."
  });
}

/**
 * Valida la clave de paso académica
 */
export function validateAcademicPasskey(passkey) {
  if (!passkey || typeof passkey !== "string") return false;
  const configuredKey = (config.academicPasskey || "").trim();
  if (configuredKey.length === 0) {
    console.error("[Security] Intento de login académico pero ACADEMIC_PASSKEY no está configurada en variables de entorno.");
    return false;
  }
  const inputBuf = Buffer.from(passkey.trim());
  const expectedBuf = Buffer.from(configuredKey);

  if (inputBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputBuf, expectedBuf);
}
