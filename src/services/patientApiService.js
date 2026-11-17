/**
 * LAZO V2 — Patient API Service
 * Cliente HTTP para gestión de pacientes, antropometría y estilo de vida
 * Con soporte para normalización robusta y cálculos deterministas
 */

const BASE_URL = '/api/patients';

/**
 * Normaliza cualquier formato previo o variante de notas clínicas para garantizar
 * que los componentes del expediente siempre reciban un arreglo seguro de objetos NOM-004.
 */
export function normalizeNotes(notas, fallbackData = {}) {
  if (!notas) return [];
  if (Array.isArray(notas)) {
    return notas.map((n, idx) => {
      if (typeof n === 'string') {
        return {
          id: `nota-norm-${idx + 1}`,
          tipo: 'Nota clínica',
          fechaHora: fallbackData.fechaRegistro || 'Fecha no registrada',
          autor: fallbackData.medicoTratante || 'Personal médico',
          contenido: n,
          estado: 'Registrada',
          vinculadaLlamada: null
        };
      }
      if (n && typeof n === 'object') {
        return {
          id: n.id || `nota-norm-${idx + 1}`,
          tipo: n.tipo || 'Nota clínica',
          fechaHora: n.fechaHora || n.fecha || 'Fecha no registrada',
          autor: n.autor || fallbackData.medicoTratante || 'Personal médico',
          contenido: n.contenido || n.texto || '',
          estado: n.estado || 'Firmada',
          vinculadaLlamada: n.vinculadaLlamada || null
        };
      }
      return null;
    }).filter(Boolean);
  }
  if (typeof notas === 'string') {
    const trimmed = notas.trim();
    if (!trimmed) return [];
    return [{
      id: 'nota-norm-1',
      tipo: 'Nota clínica',
      fechaHora: fallbackData.fechaRegistro || 'Fecha no registrada',
      autor: fallbackData.medicoTratante || 'Personal médico',
      contenido: trimmed,
      estado: 'Registrada',
      vinculadaLlamada: null
    }];
  }
  if (typeof notas === 'object') {
    return [{
      id: notas.id || 'nota-norm-1',
      tipo: notas.tipo || 'Nota clínica',
      fechaHora: notas.fechaHora || notas.fecha || 'Fecha no registrada',
      autor: notas.autor || fallbackData.medicoTratante || 'Personal médico',
      contenido: notas.contenido || notas.texto || JSON.stringify(notas),
      estado: notas.estado || 'Firmada',
      vinculadaLlamada: notas.vinculadaLlamada || null
    }];
  }
  return [];
}

/**
 * Normaliza un paciente asegurando colecciones válidas en todas las secciones
 */
export function normalizePatientData(patient) {
  if (!patient || typeof patient !== 'object') return patient;
  return {
    ...patient,
    notas: normalizeNotes(patient.notas, patient),
    medicacion: Array.isArray(patient.medicacion) ? patient.medicacion : [],
    laboratorios: Array.isArray(patient.laboratorios) 
      ? patient.laboratorios 
      : (patient.laboratorios && typeof patient.laboratorios === 'object' ? patient.laboratorios : []),
    llamadas: Array.isArray(patient.llamadas) ? patient.llamadas : [],
    lecturasGlucosa: Array.isArray(patient.lecturasGlucosa) ? patient.lecturasGlucosa : [],
    antropometria: {
      mediciones: Array.isArray(patient.antropometria?.mediciones) ? patient.antropometria.mediciones : []
    }
  };
}

export async function fetchAllPatients() {
  const res = await fetch(BASE_URL, { credentials: 'include' });
  if (!res.ok) {
    throw new Error(`Error al obtener pacientes: ${res.statusText}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizePatientData) : [];
}

export async function fetchPatientById(patientId) {
  const res = await fetch(`${BASE_URL}/${patientId}`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error(`Error al obtener paciente ${patientId}: ${res.statusText}`);
  }
  const data = await res.json();
  return normalizePatientData(data);
}

export async function createPatientApi(patientData) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(patientData)
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.message || data.error || 'Error al crear paciente';
    const err = new Error(errorMsg);
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return normalizePatientData(data);
}

export async function updatePatientApi(patientId, updateData) {
  const res = await fetch(`${BASE_URL}/${patientId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updateData)
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.message || data.error || 'Error al actualizar paciente';
    const err = new Error(errorMsg);
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return normalizePatientData(data);
}

export async function addAnthropometryApi(patientId, measurementData) {
  const res = await fetch(`${BASE_URL}/${patientId}/anthropometry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(measurementData)
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Error al registrar medición antropométrica');
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return {
    ...data,
    patient: normalizePatientData(data.patient)
  };
}

export async function updateLifestyleApi(patientId, lifestyleData) {
  const res = await fetch(`${BASE_URL}/${patientId}/lifestyle`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(lifestyleData)
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Error al actualizar estilo de vida');
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return {
    ...data,
    patient: normalizePatientData(data.patient)
  };
}

export async function validateFieldApi(patientId, validationData) {
  const res = await fetch(`${BASE_URL}/${patientId}/validate-field`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(validationData)
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Error al validar campo reportado');
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return {
    ...data,
    patient: normalizePatientData(data.patient)
  };
}

export async function fetchEnergyRequirementsApi(patientId, activityFactor = 1.2) {
  const res = await fetch(`${BASE_URL}/${patientId}/energy-requirements?activityFactor=${activityFactor}`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Error al obtener requerimientos energéticos');
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data;
}

// ==========================================
// CÁLCULOS DETERMINISTAS CLIENT-SIDE
// (Con evaluación de sexo precisa y estricta)
// ==========================================

export function calculateClientBMI(pesoKg, tallaCm, sexo = 'Masculino') {
  const peso = parseFloat(pesoKg);
  const talla = parseFloat(tallaCm);

  if (!peso || !talla || peso <= 0 || talla <= 0) return null;

  const tallaM = talla / 100.0;
  const bmi = +(peso / (tallaM * tallaM)).toFixed(2);

  // Verificación estricta de sexo: 'f'/'femenino'/'mujer' vs 'm'/'masculino'/'hombre'
  const sexNorm = String(sexo || '').trim().toLowerCase();
  const esMujer = sexNorm.startsWith('f') || sexNorm === 'mujer';
  const esTallaBaja = (esMujer && talla < 150) || (!esMujer && talla < 160);

  let clasificacion = '';
  let riesgo = '';
  let criterioNormativo = esTallaBaja 
    ? 'NOM-008-SSA3-2017 / NOM-015-SSA2-2010 (Talla baja población mexicana)'
    : 'Criterios estándar OMS';

  if (esTallaBaja) {
    if (bmi < 18.5) {
      clasificacion = 'Bajo peso';
      riesgo = 'Riesgo de desnutrición';
    } else if (bmi < 23.0) {
      clasificacion = 'Peso normal (talla baja)';
      riesgo = 'Bajo riesgo cardiovascular';
    } else if (bmi < 25.0) {
      clasificacion = 'Sobrepeso (talla baja)';
      riesgo = 'Riesgo moderado aumentado';
    } else {
      clasificacion = 'Obesidad (talla baja)';
      riesgo = 'Riesgo metabólico y cardiovascular alto';
    }
  } else {
    if (bmi < 18.5) {
      clasificacion = 'Bajo peso';
      riesgo = 'Riesgo de desnutrición';
    } else if (bmi < 25.0) {
      clasificacion = 'Peso normal';
      riesgo = 'Bajo riesgo';
    } else if (bmi < 30.0) {
      clasificacion = 'Sobrepeso';
      riesgo = 'Riesgo incrementado';
    } else if (bmi < 35.0) {
      clasificacion = 'Obesidad grado I';
      riesgo = 'Riesgo moderado';
    } else if (bmi < 40.0) {
      clasificacion = 'Obesidad grado II';
      riesgo = 'Riesgo severo';
    } else {
      clasificacion = 'Obesidad grado III (Mórbida)';
      riesgo = 'Riesgo muy severo';
    }
  }

  return {
    bmi,
    clasificacion,
    riesgo,
    esTallaBaja,
    criterioNormativo,
    peso,
    talla
  };
}

export function calculateClientWHR(cinturaCm, caderaCm, sexo = 'Masculino') {
  const cintura = parseFloat(cinturaCm);
  const cadera = parseFloat(caderaCm);

  if (!cintura || !cadera || cintura <= 0 || cadera <= 0) return null;

  const whr = +(cintura / cadera).toFixed(2);
  const sexNorm = String(sexo || '').trim().toLowerCase();
  const esMujer = sexNorm.startsWith('f') || sexNorm === 'mujer';

  const umbralCintura = esMujer ? 80 : 90;
  const riesgoCintura = cintura >= umbralCintura;

  const umbralICC = esMujer ? 0.85 : 0.90;
  const riesgoICC = whr >= umbralICC;

  let interpretacion = '';
  if (riesgoICC || riesgoCintura) {
    interpretacion = `Riesgo cardiovascular aumentado (Grasa visceral central)`;
  } else {
    interpretacion = 'Distribución de grasa androide/ginoide dentro de parámetros normales';
  }

  return {
    whr,
    cintura,
    cadera,
    riesgoCintura,
    riesgoICC,
    umbralCintura,
    umbralICC,
    interpretacion,
    fuenteCriterio: 'OMS 2011 / Límites cintura México: ≥90 cm hombres, ≥80 cm mujeres'
  };
}

export function calculateClientMifflin(pesoKg, tallaCm, edadAños, sexo = 'Masculino', factorActividad = 1.2) {
  const peso = parseFloat(pesoKg);
  const talla = parseFloat(tallaCm);
  const edad = parseInt(edadAños, 10);
  const factor = parseFloat(factorActividad) || 1.2;

  if (!peso || !talla || !edad || peso <= 0 || talla <= 0 || edad <= 0) {
    return {
      calculable: false,
      mensaje: 'Datos insuficientes para calcular requerimientos energéticos. Se requiere peso actual (kg), talla (cm), edad (años) y sexo.'
    };
  }

  const sexNorm = String(sexo || '').trim().toLowerCase();
  const esMujer = sexNorm.startsWith('f') || sexNorm === 'mujer';
  const constanteSexo = esMujer ? -161 : 5;
  const formulaDesc = esMujer
    ? 'GER = (10 × peso) + (6.25 × talla) - (5 × edad) - 161'
    : 'GER = (10 × peso) + (6.25 × talla) - (5 × edad) + 5';

  const ger = Math.round((10 * peso) + (6.25 * talla) - (5 * edad) + constanteSexo);
  const get = Math.round(ger * factor);

  const factoresDesc = {
    1.2: 'Sedentario (poco o ningún ejercicio regular)',
    1.375: 'Ligero (ejercicio ligero 1 a 3 días por semana)',
    1.55: 'Moderado (ejercicio moderado 3 a 5 días por semana)',
    1.725: 'Intenso (ejercicio intenso 6 a 7 días por semana)'
  };

  return {
    calculable: true,
    formula: 'Mifflin–St Jeor (1990)',
    formulaEcuacion: formulaDesc,
    gerKcal: ger,
    getKcal: get,
    variablesUtilizadas: {
      pesoKg: peso,
      tallaCm: talla,
      edadAños: edad,
      sexo: esMujer ? 'Femenino' : 'Masculino',
      factorActividad: factor,
      descripcionFactor: factoresDesc[factor] || `Factor personalizado (${factor})`
    },
    avisoClinico: 'Nota clínica: Estimación matemática referencial basada en la fórmula de Mifflin–St Jeor (1990). No constituye una prescripción dietética automatizada ni sustituye la valoración individualizada por el profesional médico o nutriólogo tratante.'
  };
}
