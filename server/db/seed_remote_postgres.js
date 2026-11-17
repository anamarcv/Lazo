/**
 * LAZO V2 — Script de Migración Independiente a PostgreSQL
 * 
 * Permite sembrar la base de datos remota de PostgreSQL (ej. Render Free PostgreSQL)
 * directamente desde los archivos JSON locales (server/data/patients.json y calls.json),
 * sin necesidad de que dichos archivos estén en el repositorio de Git.
 * 
 * Uso:
 *   DATABASE_URL="postgres://usuario:pass@host/lazo" node server/db/seed_remote_postgres.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ Error: Se requiere la variable DATABASE_URL para conectar con PostgreSQL.');
    console.error('Ejemplo: DATABASE_URL="postgresql://..." node server/db/seed_remote_postgres.js');
    process.exit(1);
  }

  let pg;
  try {
    pg = await import('pg');
  } catch (err) {
    console.error('❌ Error: El paquete "pg" no está instalado en el entorno local.');
    console.error('Instálalo temporalmente con: npm install pg --no-save (o npm install pg)');
    process.exit(1);
  }

  const { Pool } = pg.default || pg;
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  console.log('✅ Conexión establecida con PostgreSQL remoto.');

  try {
    await client.query('BEGIN');

    // 1. Crear tablas si no existen
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('📋 Aplicando schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(schemaSql);
      console.log('✅ Esquema verificado/creado.');
    }

    // 2. Sembrar Pacientes desde JSON local
    const patientsPath = path.join(__dirname, '../data/patients.json');
    if (!fs.existsSync(patientsPath)) {
      throw new Error(`Archivo no encontrado: ${patientsPath}`);
    }

    const patients = JSON.parse(fs.readFileSync(patientsPath, 'utf-8'));
    console.log(`📦 Sembrando ${patients.length} pacientes desde archivo local...`);

    let pCount = 0;
    for (const p of patients) {
      const isBaseline = Boolean(p.isBaseline || ['LZ-0482', 'LZ-0319', 'LZ-0195', 'LZ-0512', 'LZ-0513', 'LZ-0514'].includes(p.id));
      await client.query(
        `INSERT INTO patients (id, nombre, curp, telefono, is_baseline, revisor_id, revisor_nombre, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (id) DO UPDATE SET
           nombre = EXCLUDED.nombre,
           is_baseline = EXCLUDED.is_baseline,
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
      pCount++;
    }
    console.log(`✅ ${pCount} pacientes sembrados en PostgreSQL.`);

    // 3. Sembrar Llamadas desde JSON local
    const callsPath = path.join(__dirname, '../data/calls.json');
    let cCount = 0;
    if (fs.existsSync(callsPath)) {
      const calls = JSON.parse(fs.readFileSync(callsPath, 'utf-8'));
      console.log(`📦 Sembrando ${calls.length} llamadas desde archivo local...`);

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
        cCount++;
      }
      console.log(`✅ ${cCount} llamadas sembradas en PostgreSQL.`);
    }

    await client.query('COMMIT');
    console.log(`\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE:`);
    console.log(`   - Pacientes: ${pCount}`);
    console.log(`   - Llamadas:  ${cCount}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante la migración:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
