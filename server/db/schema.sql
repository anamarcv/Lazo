-- =====================================================================
-- LAZO V2 — ESQUEMA POSTGRESQL PARA DESPLIEGUE ACADÉMICO EN RENDER
-- Diseñado para Render Free PostgreSQL (30 días)
-- Preserva partición estricta de revisores y expedientes basales
-- =====================================================================

-- Extensión para generación de UUIDs si es requerida
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Evaluadores / Revisores de la evaluación académica
CREATE TABLE IF NOT EXISTS reviewers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Pacientes y Expedientes Clínicos (NOM-004-SSA3-2012)
-- El campo data almacena el documento clínico completo (demografía, antropometría, estilo de vida, notas)
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(32) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    curp VARCHAR(18),
    telefono VARCHAR(20),
    is_baseline BOOLEAN NOT NULL DEFAULT FALSE,
    revisor_id VARCHAR(64) REFERENCES reviewers(id) ON DELETE CASCADE,
    revisor_nombre VARCHAR(255),
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patients_baseline ON patients(is_baseline);
CREATE INDEX IF NOT EXISTS idx_patients_revisor ON patients(revisor_id);
CREATE INDEX IF NOT EXISTS idx_patients_curp ON patients(curp);

-- 3. Tabla de Llamadas de Seguimiento y Clasificación Clínica
CREATE TABLE IF NOT EXISTS calls (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(32) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    revisor_id VARCHAR(64) REFERENCES reviewers(id) ON DELETE CASCADE,
    is_baseline BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    duracion_segundos INTEGER NOT NULL DEFAULT 0,
    clasificacion_riesgo VARCHAR(32) NOT NULL DEFAULT 'Riesgo Bajo',
    recording_file VARCHAR(255),
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calls_patient ON calls(patient_id);
CREATE INDEX IF NOT EXISTS idx_calls_revisor ON calls(revisor_id);
CREATE INDEX IF NOT EXISTS idx_calls_baseline ON calls(is_baseline);

-- 4. Metadatos de Grabaciones de Audio (WAV / Object Storage)
CREATE TABLE IF NOT EXISTS recordings_metadata (
    id VARCHAR(64) PRIMARY KEY,
    call_id VARCHAR(64) REFERENCES calls(id) ON DELETE CASCADE,
    storage_provider VARCHAR(32) NOT NULL DEFAULT 'local', -- 'local', 'supabase', 'cloudinary'
    storage_path_or_url TEXT NOT NULL,
    mime_type VARCHAR(64) NOT NULL DEFAULT 'audio/wav',
    size_bytes BIGINT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recordings_call ON recordings_metadata(call_id);
