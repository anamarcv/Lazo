/**
 * LAZO V2 — Capa de Abstracción de Base de Datos
 * Permite transición transparente entre almacenamiento JSON en disco (local)
 * y PostgreSQL en la nube (Render Free PostgreSQL).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const isPostgresEnabled = Boolean(process.env.DATABASE_URL);
export let pgPool = null;

if (isPostgresEnabled) {
  try {
    const { Pool } = await import('pg');
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
    });
    console.log('[Database] PostgreSQL Pool configurado con DATABASE_URL.');
  } catch (err) {
    console.warn('[Database] Módulo "pg" no disponible o error al configurar pool. Usando almacenamiento JSON.', err.message);
  }
}

/**
 * Obtiene el estado actual del backend de persistencia
 */
export function getStorageStatus() {
  return {
    provider: pgPool ? 'postgresql' : 'json_disk',
    isPostgres: Boolean(pgPool),
    patientsFilePath: config.patientDataFilePath,
    callsFilePath: config.callDataFilePath,
    recordingsDirPath: config.recordingsDir
  };
}

/**
 * Migra los pacientes y llamadas desde los archivos JSON locales a PostgreSQL
 * @param {object} pool - Pool de conexiones de PostgreSQL
 */
export async function migrateJsonToPostgres(pool = pgPool) {
  if (!pool) {
    throw new Error('No hay conexión PostgreSQL configurada para ejecutar la migración.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Ejecutar esquema si no existe
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSql);

    // 2. Migrar Pacientes
    const patientsRaw = fs.readFileSync(config.patientDataFilePath, 'utf-8');
    const patients = JSON.parse(patientsRaw);
    let patientsInserted = 0;

    for (const p of patients) {
      const isBaseline = Boolean(p.isBaseline || ['LZ-0482', 'LZ-0319', 'LZ-0195', 'LZ-0512', 'LZ-0513', 'LZ-0514'].includes(p.id));
      await client.query(
        `INSERT INTO patients (id, nombre, curp, telefono, is_baseline, revisor_id, revisor_nombre, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (id) DO UPDATE SET
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [
          p.id,
          p.nombre || 'Sin nombre',
          p.curp || null,
          p.telefono || null,
          isBaseline,
          p.revisorId || null,
          p.revisorNombre || null,
          JSON.stringify(p)
        ]
      );
      patientsInserted++;
    }

    // 3. Migrar Llamadas
    let callsInserted = 0;
    if (fs.existsSync(config.callDataFilePath)) {
      const callsRaw = fs.readFileSync(config.callDataFilePath, 'utf-8');
      const calls = JSON.parse(callsRaw);

      for (const c of calls) {
        const isBaseline = Boolean(c.isBaseline || ['LZ-0482', 'LZ-0319', 'LZ-0195', 'LZ-0512', 'LZ-0513', 'LZ-0514'].includes(c.patientId));
        await client.query(
          `INSERT INTO calls (id, patient_id, revisor_id, is_baseline, fecha_hora, duracion_segundos, clasificacion_riesgo, recording_file, data)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             data = EXCLUDED.data;`,
          [
            c.id,
            c.patientId,
            c.revisorId || null,
            isBaseline,
            c.fechaHora || new Date().toISOString(),
            c.duracionSegundos || 0,
            c.clasificacionRiesgo || 'Riesgo Bajo',
            c.recordingFile || null,
            JSON.stringify(c)
          ]
        );
        callsInserted++;
      }
    }

    await client.query('COMMIT');
    console.log(`[Database] Migración completada exitosamente: ${patientsInserted} pacientes, ${callsInserted} llamadas.`);
    return {
      success: true,
      patientsInserted,
      callsInserted
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Database] Error en migración PostgreSQL:', err);
    throw err;
  } finally {
    client.release();
  }
}
