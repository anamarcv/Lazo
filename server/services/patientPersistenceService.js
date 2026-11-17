import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MOCK_PATIENTS } from "../../src/data/mockPatients.js";
import { BASELINE_PATIENT_IDS } from "./authService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "../data");
const PATIENTS_FILE = path.join(DATA_DIR, "patients.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");

/**
 * Mutex simple en memoria para asegurar que las escrituras en disco
 * se ejecuten secuencialmente y sin condiciones de carrera.
 */
let writeLockPromise = Promise.resolve();

function withWriteLock(fn) {
  const nextLock = writeLockPromise.then(() => fn());
  writeLockPromise = nextLock.catch(() => {});
  return nextLock;
}

/**
 * Escritura atómica a disco: escribe primero en un archivo temporal (.tmp)
 * en el mismo sistema de archivos y luego renombra atómicamente a destino.
 */
function atomicWriteJsonSync(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempPath, jsonStr, "utf-8");
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (e) {}
    }
    console.error(`[PatientPersistence] Error en atomicWriteJsonSync para ${filePath}:`, err);
    throw err;
  }
}

/**
 * Cálculo determinista de IMC y clasificación según criterios OMS y NOM-008-SSA3-2017 (Talla Baja México)
 */
export function calculateBMI(weightKg, heightCm, sex = "Masculino") {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return null;
  }
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(2));

  const isFemale = sex.toLowerCase().startsWith("f");
  const isShortStature = isFemale ? heightCm < 150 : heightCm < 160;

  let categoria = "";
  let criterioNormativo = "";
  let fuenteNormativa = "";

  if (isShortStature) {
    criterioNormativo = `Criterio NOM-008-SSA3-2017 para Talla Baja en Adultos (${isFemale ? "Mujer < 1.50 m" : "Hombre < 1.60 m"})`;
    fuenteNormativa = "NOM-008-SSA3-2017 (Apartado 3.1.21) y NOM-015-SSA2-2010 (Apartado 3.32)";
    if (bmi < 18.5) {
      categoria = "Bajo peso";
    } else if (bmi <= 22.9) {
      categoria = "Peso normal (para talla baja)";
    } else if (bmi <= 24.9) {
      categoria = "Sobrepeso (para talla baja)";
    } else {
      categoria = "Obesidad (para talla baja)";
    }
  } else {
    criterioNormativo = "Criterio Estándar de la Organización Mundial de la Salud (OMS)";
    fuenteNormativa = "WHO Technical Report Series 894 (OMS 2000)";
    if (bmi < 18.5) {
      categoria = "Bajo peso";
    } else if (bmi <= 24.9) {
      categoria = "Peso normal";
    } else if (bmi <= 29.9) {
      categoria = "Sobrepeso";
    } else if (bmi <= 34.9) {
      categoria = "Obesidad Clase I (Leve)";
    } else if (bmi <= 39.9) {
      categoria = "Obesidad Clase II (Moderada)";
    } else {
      categoria = "Obesidad Clase III (Severa / Mórbida)";
    }
  }

  return {
    bmi,
    categoria,
    esTallaBaja: isShortStature,
    criterioNormativo,
    fuenteNormativa,
    notaInformativa: "Clasificación descriptiva de carácter orientativo; no constituye diagnóstico clínico independiente."
  };
}

/**
 * Cálculo de Relación Cintura/Cadera (ICC) según umbrales OMS y NOM-008
 */
export function calculateWHR(waistCm, hipCm, sex = "Masculino") {
  if (!waistCm || !hipCm || waistCm <= 0 || hipCm <= 0) {
    return null;
  }
  const whr = parseFloat((waistCm / hipCm).toFixed(2));
  const isFemale = sex.toLowerCase().startsWith("f");

  const cutoff = isFemale ? 0.85 : 0.90;
  const isHighRisk = whr >= cutoff;

  const waistThreshold = isFemale ? 80 : 90;
  const isWaistAtRisk = waistCm >= waistThreshold;

  return {
    whr,
    corteReferencia: cutoff,
    riesgoCardiometabolico: isHighRisk ? "Riesgo cardiometabólico aumentado (distribución androide / central)" : "Riesgo cardiometabólico bajo / normal",
    cinturaEnRiesgo: isWaistAtRisk,
    criterioNormativo: `Umbrales OMS (${isFemale ? "Mujeres ≥ 0.85" : "Hombres ≥ 0.90"}) y NOM-008-SSA3-2017 para cintura (${isFemale ? "≥ 80 cm" : "≥ 90 cm"})`,
    fuenteNormativa: "WHO Waist Circumference and Waist-Hip Ratio Report (2011) / NOM-008-SSA3-2017",
    notaInformativa: "Indicador antropométrico de distribución de tejido adiposo central. Requiere correlación con perfil lipídico y presión arterial."
  };
}

/**
 * Ecuación de Mifflin–St Jeor (1990) para Gasto Energético en Reposo (GER)
 */
export function calculateMifflinStJeor({ weightKg, heightCm, ageYears, sex = "Masculino", activityFactor = 1.0 }) {
  if (!weightKg || !heightCm || !ageYears || weightKg <= 0 || heightCm <= 0 || ageYears <= 0) {
    return {
      calculable: false,
      motivo: "Datos insuficientes para calcular: se requiere peso (kg), talla (cm), edad (años) y sexo biológico."
    };
  }

  const isFemale = sex.toLowerCase().startsWith("f");
  // Fórmula Mifflin-St Jeor:
  // Hombres: 10 * peso + 6.25 * talla - 5 * edad + 5
  // Mujeres: 10 * peso + 6.25 * talla - 5 * edad - 161
  const baseTerm = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);
  const ger = Math.round(isFemale ? baseTerm - 161 : baseTerm + 5);

  const factor = (typeof activityFactor === "number" && activityFactor >= 1.0 && activityFactor <= 2.5) ? activityFactor : 1.0;
  const ged = Math.round(ger * factor);

  const activityLabels = {
    1.0: "En reposo absoluto (GER basal sin factor de actividad)",
    1.2: "Sedentario (poco o ningún ejercicio estructurado)",
    1.375: "Actividad ligera (ejercicio suave 1–3 días por semana)",
    1.55: "Actividad moderada (ejercicio regular 3–5 días por semana)",
    1.725: "Actividad intensa (entrenamiento vigoroso 6–7 días por semana)"
  };

  return {
    calculable: true,
    nombreEcuacion: "Mifflin–St Jeor (1990)",
    formulaVisible: isFemale
      ? "GER (kcal/día) = (10 × peso en kg) + (6.25 × talla en cm) − (5 × edad en años) − 161"
      : "GER (kcal/día) = (10 × peso en kg) + (6.25 × talla en cm) − (5 × edad en años) + 5",
    variablesUtilizadas: {
      pesoKg: weightKg,
      tallaCm: heightCm,
      edadAnios: ageYears,
      sexoEcuacion: isFemale ? "Femenino" : "Masculino"
    },
    gerKcalDia: ger,
    factorActividadSeleccionado: factor,
    justificacionFactor: activityLabels[factor] || `Factor personalizado de ${factor}`,
    gedKcalDia: ged,
    advertenciaClinica: "Estimación matemática referencial del gasto metabólico. No constituye prescripción médica ni plan dietético individualizado."
  };
}

/**
 * Sembrado inicial con enriquecimiento V2 para los pacientes mock existentes
 */
function seedInitialPatients() {
  console.log("[PatientPersistence] 🌱 Generando sembrado inicial de pacientes V2...");

  const enrichedPatients = MOCK_PATIENTS.map((p) => {
    // Si es Roberto Méndez Silva (LZ-0482), agregamos historial antropométrico y estilo de vida
    if (p.id === "LZ-0482") {
      return {
        ...p,
        estadoAlta: "completo",
        antropometria: {
          mediciones: [
            {
              id: "ant-0482-1",
              fecha: "2026-06-12",
              tipo: "basal",
              peso: 86.5,
              talla: 172,
              cintura: 102,
              cadera: 106,
              imc: 29.24,
              imcDetalle: calculateBMI(86.5, 172, "Masculino"),
              icc: 0.96,
              iccDetalle: calculateWHR(102, 106, "Masculino"),
              fuente: "medico",
              estadoValidacion: "validado",
              notas: "Toma basal al ingreso al programa Lazo"
            },
            {
              id: "ant-0482-2",
              fecha: "2026-08-15",
              tipo: "seguimiento",
              peso: 84.8,
              talla: 172,
              cintura: 99.5,
              cadera: 105,
              imc: 28.66,
              imcDetalle: calculateBMI(84.8, 172, "Masculino"),
              icc: 0.95,
              iccDetalle: calculateWHR(99.5, 105, "Masculino"),
              fuente: "medico",
              estadoValidacion: "validado",
              notas: "Control de consulta bimestral"
            },
            {
              id: "ant-0482-3",
              fecha: "2026-10-20",
              tipo: "seguimiento",
              peso: 83.2,
              talla: 172,
              cintura: 98.0,
              cadera: 104,
              imc: 28.12,
              imcDetalle: calculateBMI(83.2, 172, "Masculino"),
              icc: 0.94,
              iccDetalle: calculateWHR(98.0, 104, "Masculino"),
              fuente: "medico",
              estadoValidacion: "validado",
              notas: "Última valoración médica presencial"
            }
          ]
        },
        estiloVida: {
          actividadFisica: {
            tipoActividad: "Caminata y bicicleta fija",
            diasSemana: 3,
            minutosSesion: 30,
            intensidad: "Moderada",
            ejercicioFuerza: "Sí (mancuernas ligeras en casa 1 vez por semana)",
            limitaciones: "Dolor en rodilla derecha al caminar más de 40 minutos",
            fechaActualizacion: "2026-10-20",
            fuente: "medico",
            estadoValidacion: "validado"
          },
          alimentacion: {
            habitosGenerales: "3 comidas al día preparadas en casa con su hija.",
            alergiasAlimentarias: "Nueces (reacción anafiláctica documentada, cuenta con EpiPen®)",
            intolerancias: "Intolerancia leve a lácteos enteros",
            preferenciasRestricciones: "Preferencia por comida tradicional mexicana; baja ingesta de sal",
            bebidasAzucaradas: "1 vaso de refresco normal ocasional (1–2 veces/sem); café con 1 cucharadita de azúcar",
            alimentosContextoMexicano: "3 a 4 tortillas de maíz al día; frijoles de la olla 4 días a la semana; 1 pieza de pan dulce el domingo",
            fechaActualizacion: "2026-10-20",
            fuente: "medico",
            estadoValidacion: "validado"
          }
        }
      };
    }

    // Si es Elena Garza Villarreal (LZ-0319, mujer, talla 154 cm)
    if (p.id === "LZ-0319") {
      return {
        ...p,
        estadoAlta: "completo",
        antropometria: {
          mediciones: [
            {
              id: "ant-0319-1",
              fecha: "2026-05-10",
              tipo: "basal",
              peso: 68.0,
              talla: 154,
              cintura: 88,
              cadera: 102,
              imc: 28.67,
              imcDetalle: calculateBMI(68.0, 154, "Femenino"),
              icc: 0.86,
              iccDetalle: calculateWHR(88, 102, "Femenino"),
              fuente: "medico",
              estadoValidacion: "validado",
              notas: "Ingreso programa"
            },
            {
              id: "ant-0319-2",
              fecha: "2026-09-02",
              tipo: "seguimiento",
              peso: 66.5,
              talla: 154,
              cintura: 86,
              cadera: 101,
              imc: 28.04,
              imcDetalle: calculateBMI(66.5, 154, "Femenino"),
              icc: 0.85,
              iccDetalle: calculateWHR(86, 101, "Femenino"),
              fuente: "medico",
              estadoValidacion: "validado",
              notas: "Control consulta"
            }
          ]
        },
        estiloVida: {
          actividadFisica: {
            tipoActividad: "Caminata suave en parque",
            diasSemana: 4,
            minutosSesion: 25,
            intensidad: "Ligera",
            ejercicioFuerza: "No realiza",
            limitaciones: "Molestias visuales intermitentes",
            fechaActualizacion: "2026-09-02",
            fuente: "medico",
            estadoValidacion: "validado"
          },
          alimentacion: {
            habitosGenerales: "3 comidas regulares y colación matutina de fruta",
            alergiasAlimentarias: "Niega",
            intolerancias: "Niega",
            preferenciasRestricciones: "Dieta variada con verduras de temporada",
            bebidasAzucaradas: "Agua de fruta natural con poca azúcar (1 vaso/día)",
            alimentosContextoMexicano: "2 tortillas de maíz por comida; frijoles 3 veces por semana",
            fechaActualizacion: "2026-09-02",
            fuente: "medico",
            estadoValidacion: "validado"
          }
        }
      };
    }

    // Default para otros pacientes mock
    return {
      ...p,
      estadoAlta: "completo",
      antropometria: { mediciones: [] },
      estiloVida: {
        actividadFisica: {
          tipoActividad: "Sin registro formal",
          diasSemana: 0,
          minutosSesion: 0,
          intensidad: "Ligera",
          ejercicioFuerza: "No",
          limitaciones: "Ninguna referida",
          fechaActualizacion: p.fechaRegistro || "2026-01-01",
          fuente: "medico",
          estadoValidacion: "validado"
        },
        alimentacion: {
          habitosGenerales: "Alimentación habitual casera",
          alergiasAlimentarias: "Niega",
          intolerancias: "Niega",
          preferenciasRestricciones: "Ninguna",
          bebidasAzucaradas: "No especificado",
          alimentosContextoMexicano: "Alimentos tradicionales",
          fechaActualizacion: p.fechaRegistro || "2026-01-01",
          fuente: "medico",
          estadoValidacion: "validado"
        }
      }
    };
  });

  atomicWriteJsonSync(PATIENTS_FILE, enrichedPatients);
  console.log(`[PatientPersistence] ✅ Sembrado inicial completado con ${enrichedPatients.length} pacientes.`);
  return enrichedPatients;
}

/**
 * Normaliza cualquier formato previo o variante de notas clínicas para garantizar
 * que los componentes del expediente siempre reciban un arreglo seguro de objetos NOM-004.
 */
export function normalizeNotes(notas, fallbackData = {}) {
  if (!notas) return [];
  if (Array.isArray(notas)) {
    return notas.map((n, idx) => {
      if (typeof n === "string") {
        return {
          id: `nota-norm-${idx + 1}`,
          tipo: "Nota clínica",
          fechaHora: fallbackData.fechaRegistro || "Fecha no registrada",
          autor: fallbackData.medicoTratante || "Personal médico",
          contenido: n,
          estado: "Registrada",
          vinculadaLlamada: null
        };
      }
      if (n && typeof n === "object") {
        return {
          id: n.id || `nota-norm-${idx + 1}`,
          tipo: n.tipo || "Nota clínica",
          fechaHora: n.fechaHora || n.fecha || "Fecha no registrada",
          autor: n.autor || fallbackData.medicoTratante || "Personal médico",
          contenido: n.contenido || n.texto || "",
          estado: n.estado || "Firmada",
          vinculadaLlamada: n.vinculadaLlamada || null
        };
      }
      return null;
    }).filter(Boolean);
  }
  if (typeof notas === "string") {
    const trimmed = notas.trim();
    if (!trimmed) return [];
    return [{
      id: "nota-norm-1",
      tipo: "Nota clínica",
      fechaHora: fallbackData.fechaRegistro || "Fecha no registrada",
      autor: fallbackData.medicoTratante || "Personal médico",
      contenido: trimmed,
      estado: "Registrada",
      vinculadaLlamada: null
    }];
  }
  if (typeof notas === "object") {
    return [{
      id: notas.id || "nota-norm-1",
      tipo: notas.tipo || "Nota clínica",
      fechaHora: notas.fechaHora || notas.fecha || "Fecha no registrada",
      autor: notas.autor || fallbackData.medicoTratante || "Personal médico",
      contenido: notas.contenido || notas.texto || JSON.stringify(notas),
      estado: notas.estado || "Firmada",
      vinculadaLlamada: notas.vinculadaLlamada || null
    }];
  }
  return [];
}

/**
 * Normaliza un expediente asegurando tipos y colecciones correctas en todas las secciones
 */
export function normalizePatient(p) {
  if (!p || typeof p !== "object") return p;

  const isBaseline = BASELINE_PATIENT_IDS.has(p.id) || p.isBaseline === true;
  const notas = normalizeNotes(p.notas, p);
  const medicacion = Array.isArray(p.medicacion) ? p.medicacion : [];
  const laboratorios = Array.isArray(p.laboratorios)
    ? p.laboratorios
    : (p.laboratorios && typeof p.laboratorios === "object" ? p.laboratorios : []);
  const llamadas = Array.isArray(p.llamadas) ? p.llamadas : [];
  const lecturasGlucosa = Array.isArray(p.lecturasGlucosa) ? p.lecturasGlucosa : [];
  const mediciones = Array.isArray(p.antropometria?.mediciones) ? p.antropometria.mediciones : [];

  return {
    ...p,
    isBaseline,
    revisorId: isBaseline ? null : (p.revisorId || null),
    revisorNombre: isBaseline ? "LAZO Referencia Clínica" : (p.revisorNombre || null),
    notas,
    medicacion,
    laboratorios,
    llamadas,
    lecturasGlucosa,
    antropometria: {
      ...(p.antropometria || {}),
      mediciones
    }
  };
}

/**
 * Carga segura de pacientes desde archivo con inicialización resiliente y aislamiento por evaluador
 */
export function getAllPatients(filters = {}, reviewerId = null) {
  try {
    if (!fs.existsSync(PATIENTS_FILE)) {
      return seedInitialPatients();
    }
    const raw = fs.readFileSync(PATIENTS_FILE, "utf-8");
    if (!raw || !raw.trim()) {
      return seedInitialPatients();
    }
    const patients = JSON.parse(raw);
    if (!Array.isArray(patients)) {
      console.warn("[PatientPersistence] Corrupción detectada en patients.json. Restaurando sembrado...");
      return seedInitialPatients();
    }

    let result = patients.map(normalizePatient);

    // Aislamiento de evaluadores: solo pacientes basales + pacientes propios del evaluador
    if (reviewerId !== null && reviewerId !== undefined) {
      result = result.filter(p => p.isBaseline === true || BASELINE_PATIENT_IDS.has(p.id) || p.revisorId === reviewerId);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p => 
        (p.nombre && p.nombre.toLowerCase().includes(q)) || 
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.curp && p.curp.toLowerCase().includes(q))
      );
    }

    if (filters.priority && filters.priority !== "todos") {
      result = result.filter(p => p.prioridadClinica?.toLowerCase() === filters.priority.toLowerCase());
    }

    if (filters.status && filters.status !== "todos") {
      result = result.filter(p => p.estadoAlta?.toLowerCase() === filters.status.toLowerCase());
    }

    return result;
  } catch (err) {
    console.error("[PatientPersistence] Error leyendo patients.json:", err);
    return seedInitialPatients();
  }
}

/**
 * Obtener un paciente específico por su ID con verificación de pertenencia por evaluador
 */
export function getPatientById(patientId, reviewerId = null) {
  if (!patientId) return null;
  const patients = getAllPatients({}, null);
  const patient = patients.find(p => p.id === patientId) || null;
  if (!patient) return null;

  if (reviewerId !== null && reviewerId !== undefined) {
    const isAllowed = patient.isBaseline === true || BASELINE_PATIENT_IDS.has(patient.id) || patient.revisorId === reviewerId;
    if (!isAllowed) {
      return null;
    }
  }

  return patient;
}

/**
 * Genera el siguiente ID secuencial de paciente (formato LZ-XXXX)
 */
function generateNextPatientId(patients) {
  let maxNum = 482;
  for (const p of patients) {
    if (p.id && p.id.startsWith("LZ-")) {
      const numPart = parseInt(p.id.replace("LZ-", ""), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }
  const nextNum = maxNum + 1;
  return `LZ-${String(nextNum).padStart(4, "0")}`;
}

/**
 * Validar si un paciente ya existe para prevenir duplicados
 */
export function checkDuplicatePatient(patientData, existingPatients, ignoreId = null) {
  const normName = (patientData.nombre || "").trim().toLowerCase();
  const dob = (patientData.fechaNacimiento || "").trim();
  const curp = (patientData.curp || "").trim().toUpperCase();
  const id = (patientData.id || "").trim().toUpperCase();

  for (const p of existingPatients) {
    if (ignoreId && p.id === ignoreId) continue;

    // Duplicado por ID explícito
    if (id && p.id?.toUpperCase() === id) {
      return { duplicate: true, reason: `Ya existe un paciente con el identificador ${p.id} (${p.nombre}).` };
    }

    // Duplicado por CURP
    if (curp && p.curp && p.curp.toUpperCase() === curp) {
      return { duplicate: true, reason: `Ya existe un paciente registrado con la CURP ${curp} (${p.nombre}, ID: ${p.id}).` };
    }

    // Duplicado por Nombre exacto y Fecha de Nacimiento
    const pNormName = (p.nombre || "").trim().toLowerCase();
    const pDob = (p.fechaNacimiento || "").trim();
    if (normName && pNormName === normName && dob && pDob === dob) {
      return { duplicate: true, reason: `Ya existe un paciente con el nombre "${p.nombre}" y fecha de nacimiento ${dob} (ID: ${p.id}).` };
    }
  }

  return { duplicate: false };
}

/**
 * Crear un nuevo paciente (completo o borrador) con aislamiento por evaluador
 */
export async function createPatient(patientData, reviewer = null) {
  return withWriteLock(async () => {
    const patients = getAllPatients({}, null);

    // 1. Verificación de duplicados
    const dupCheck = checkDuplicatePatient(patientData, patients);
    if (dupCheck.duplicate) {
      const err = new Error(dupCheck.reason);
      err.statusCode = 409;
      throw err;
    }

    // 2. Asignación de ID
    const assignedId = (patientData.id && patientData.id.trim()) 
      ? patientData.id.trim().toUpperCase() 
      : generateNextPatientId(patients);

    if (BASELINE_PATIENT_IDS.has(assignedId)) {
      const err = new Error(`El identificador ${assignedId} está reservado para pacientes basales de referencia clínica.`);
      err.statusCode = 409;
      err.code = "BASELINE_ID_RESERVED";
      throw err;
    }

    // 3. Cálculo de edad a partir de fecha de nacimiento si aplica
    let edad = patientData.edad;
    if (patientData.fechaNacimiento) {
      const dob = new Date(patientData.fechaNacimiento);
      if (!isNaN(dob.getTime())) {
        const today = new Date();
        edad = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          edad--;
        }
      }
    }

    const estadoAlta = patientData.esBorrador ? "borrador" : "completo";

    // 4. Estructura estándar del expediente clínico
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split("T")[0];

    const newPatient = {
      id: assignedId,
      nombre: (patientData.nombre || "").trim(),
      edad: edad || null,
      sexo: patientData.sexo || "Masculino",
      fechaNacimiento: patientData.fechaNacimiento || "",
      curp: (patientData.curp || "").trim().toUpperCase(),
      telefono: (patientData.telefono || "").trim(),
      telefonoSecundario: (patientData.telefonoSecundario || "").trim(),
      cuidador: (patientData.cuidador || "").trim(),
      direccion: (patientData.direccion || "").trim(),
      medicoTratante: patientData.medicoTratante || "Dra. Anamar Cordero Valle",
      fechaRegistro: todayStr,
      fechaIngresoLazo: todayStr,
      estadoAlta,
      isBaseline: false,
      revisorId: reviewer?.id || "local-dev-reviewer",
      revisorNombre: reviewer?.name || "Evaluador Académico",
      estadoSeguimiento: patientData.estadoSeguimiento || "Activo (2x/semana)",
      prioridadClinica: patientData.prioridadClinica || "Rutina",
      diagnosticoPrincipal: (patientData.diagnosticoPrincipal || "Diabetes Mellitus Tipo 2").trim(),
      diagnosticosSecundarios: Array.isArray(patientData.diagnosticosSecundarios) ? patientData.diagnosticosSecundarios : [],
      
      metasIndividuales: patientData.metasIndividuales || {
        ayunoMin: 80,
        ayunoMax: 130,
        postMax: 180,
        hba1cMeta: 7.0
      },

      kpisSeguimiento: {
        adherenciaDosis: { tomadas: 0, total: 0, porcentaje: 100, detalle: "Sin llamadas registradas aún" },
        glucosaEnMeta: { enMeta: 0, total: 0, porcentaje: 100, detalle: "Sin lecturas capilares aún" },
        bitacorasDias: { conRegistro: 0, totalDias: 0, detalle: "Sin registros" },
        presionDomiciliaria: { sistolica: null, diastolica: null, lecturas: 0, fuente: "Sin registro", estado: "Normal" }
      },

      lecturasGlucosa: [],
      sintomasReportados: { estadoActual: "Sin síntomas de alarma reportados", episodiosPrevios: "Ninguno", alertasHistoricas: "Ninguna" },
      efectosAdversos: [],
      medicacion: Array.isArray(patientData.medicacion) ? patientData.medicacion : [],
      laboratorios: Array.isArray(patientData.laboratorios) ? patientData.laboratorios : [],
      llamadas: [],
      notas: patientData.notaInicial ? [
        {
          id: `nota-${Date.now()}`,
          fecha: todayStr,
          autor: patientData.medicoTratante || "Dra. Anamar Cordero Valle",
          tipo: "Nota de ingreso / Primera consulta",
          contenido: patientData.notaInicial
        }
      ] : normalizeNotes(patientData.notas, { medicoTratante: patientData.medicoTratante, fechaRegistro: todayStr }),
      notasInternas: (patientData.notasInternas || (typeof patientData.notas === "string" ? patientData.notas : "") || "").trim(),

      antecedentes: patientData.antecedentes || {
        cronicos: [{ condicion: patientData.diagnosticoPrincipal || "Diabetes Mellitus Tipo 2", estado: "Bajo control inicial", anio: new Date().getFullYear() }],
        alergias: [],
        familiares: [],
        quirurgicos: [],
        apnp: {
          datosGenerales: { 
            originario: patientData.originario || patientData.originaria || "",
            originaria: patientData.originaria || patientData.originario || "", 
            residencia: patientData.direccion || "", 
            escolaridad: "", 
            ocupacion: "", 
            religion: "", 
            estadoCivil: "", 
            tipoSanguineo: "", 
            zoonosis: "Niega", 
            biomasa: "Niega" 
          },
          habitosVida: { alimentacion: "3 comidas al día", consumoAgua: "~1.5 L/día", actividadFisica: "Sin actividad física estructurada", habitosHigienicos: "Adecuados" },
          sustancias: { tabaco: "Niega", alcohol: "Niega", otrasSustancias: "Niega" }
        }
      },

      // Antropometría V2
      antropometria: {
        mediciones: []
      },

      // Estilo de vida V2
      estiloVida: {
        actividadFisica: {
          tipoActividad: patientData.actividadFisicaTipo || "Sin actividad física estructurada",
          diasSemana: parseInt(patientData.actividadFisicaDias, 10) || 0,
          minutosSesion: parseInt(patientData.actividadFisicaMinutos, 10) || 0,
          intensidad: patientData.actividadFisicaIntensidad || "Ligera",
          ejercicioFuerza: patientData.actividadFisicaFuerza || "No",
          limitaciones: patientData.actividadFisicaLimitaciones || "Ninguna referida",
          fechaActualizacion: todayStr,
          fuente: "medico",
          estadoValidacion: "validado"
        },
        alimentacion: {
          habitosGenerales: patientData.alimentacionHabitos || "Alimentación habitual",
          alergiasAlimentarias: patientData.alergiasAlimentarias || "Ninguna",
          intolerancias: patientData.intolerancias || "Ninguna",
          preferenciasRestricciones: patientData.preferenciasRestricciones || "Ninguna",
          bebidasAzucaradas: patientData.bebidasAzucaradas || "Niega consumo habitual",
          alimentosContextoMexicano: patientData.alimentosContextoMexicano || "Tortilla de maíz, frijoles",
          fechaActualizacion: todayStr,
          fuente: "medico",
          estadoValidacion: "validado"
        }
      }
    };

    // Si incluyó medición antropométrica inicial en el alta
    if (patientData.peso && patientData.talla) {
      const peso = parseFloat(patientData.peso);
      const talla = parseFloat(patientData.talla);
      const cintura = patientData.cintura ? parseFloat(patientData.cintura) : null;
      const cadera = patientData.cadera ? parseFloat(patientData.cadera) : null;

      const bmiResult = calculateBMI(peso, talla, newPatient.sexo);
      const whrResult = calculateWHR(cintura, cadera, newPatient.sexo);

      newPatient.antropometria.mediciones.push({
        id: `ant-${newPatient.id}-1`,
        fecha: todayStr,
        tipo: "basal",
        peso,
        talla,
        cintura,
        cadera,
        imc: bmiResult?.bmi || null,
        imcDetalle: bmiResult,
        icc: whrResult?.whr || null,
        iccDetalle: whrResult,
        fuente: "medico",
        estadoValidacion: "validado",
        notas: "Medición basal de ingreso"
      });
    }

    const normalizedNewPatient = normalizePatient(newPatient);
    patients.unshift(normalizedNewPatient);
    atomicWriteJsonSync(PATIENTS_FILE, patients);
    console.log(`[PatientPersistence] 💾 Paciente creado con éxito: ${normalizedNewPatient.id} (${normalizedNewPatient.nombre})`);
    return normalizedNewPatient;
  });
}

/**
 * Editar datos generales o clínicos de un paciente existente
 */
export async function updatePatient(patientId, updateData, reviewer = null) {
  return withWriteLock(async () => {
    // 1. Inmutabilidad estricta de pacientes basales de referencia (HTTP 403)
    if (BASELINE_PATIENT_IDS.has(patientId)) {
      const err = new Error(`El expediente ${patientId} es un paciente de referencia clínica de solo lectura y no puede modificarse.`);
      err.statusCode = 403;
      err.code = "BASELINE_PATIENT_PROTECTED";
      throw err;
    }

    const patients = getAllPatients({}, null);
    const idx = patients.findIndex(p => p.id === patientId);
    if (idx === -1) {
      const err = new Error(`Paciente con ID ${patientId} no encontrado.`);
      err.statusCode = 404;
      throw err;
    }

    const currentPatient = patients[idx];

    if (currentPatient.isBaseline) {
      const err = new Error(`El expediente ${patientId} es un paciente de referencia clínica de solo lectura y no puede modificarse.`);
      err.statusCode = 403;
      err.code = "BASELINE_PATIENT_PROTECTED";
      throw err;
    }

    if (reviewer && currentPatient.revisorId && currentPatient.revisorId !== reviewer.id) {
      const err = new Error(`No tiene permisos para modificar el expediente ${patientId}.`);
      err.statusCode = 403;
      err.code = "FORBIDDEN_REVIEWER_MISMATCH";
      throw err;
    }

    // Verificación de duplicados si cambió el nombre o la CURP
    if (updateData.nombre || updateData.fechaNacimiento || updateData.curp) {
      const dupCheck = checkDuplicatePatient({
        ...currentPatient,
        ...updateData
      }, patients, patientId);
      if (dupCheck.duplicate) {
        const err = new Error(dupCheck.reason);
        err.statusCode = 409;
        throw err;
      }
    }

    // Cálculo dinámico de edad si cambió fecha de nacimiento
    let edad = updateData.edad !== undefined ? updateData.edad : currentPatient.edad;
    if (updateData.fechaNacimiento && updateData.fechaNacimiento !== currentPatient.fechaNacimiento) {
      const dob = new Date(updateData.fechaNacimiento);
      if (!isNaN(dob.getTime())) {
        const today = new Date();
        edad = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          edad--;
        }
      }
    }

    // Manejo defensivo de notas: nunca sobrescribir array de notas con un string o valor inválido
    let safeNotas = currentPatient.notas;
    if (Array.isArray(updateData.notas)) {
      safeNotas = updateData.notas;
    } else if (typeof updateData.notas === "string" && updateData.notas.trim()) {
      safeNotas = [...(normalizeNotes(currentPatient.notas, currentPatient)), ...normalizeNotes(updateData.notas, currentPatient)];
    }
    safeNotas = normalizeNotes(safeNotas, currentPatient);

    const safeNotasInternas = updateData.notasInternas !== undefined 
      ? updateData.notasInternas 
      : (currentPatient.notasInternas || "");

    // Fusión cuidadosa respetando objetos anidados y preservando tipos
    const merged = {
      ...currentPatient,
      ...updateData,
      edad,
      notas: safeNotas,
      notasInternas: safeNotasInternas,
      antecedentes: updateData.antecedentes ? { ...currentPatient.antecedentes, ...updateData.antecedentes } : currentPatient.antecedentes,
      antropometria: updateData.antropometria ? { ...currentPatient.antropometria, ...updateData.antropometria } : (currentPatient.antropometria || { mediciones: [] }),
      estiloVida: updateData.estiloVida ? { ...currentPatient.estiloVida, ...updateData.estiloVida } : (currentPatient.estiloVida || {})
    };

    const updatedPatient = normalizePatient(merged);
    patients[idx] = updatedPatient;
    atomicWriteJsonSync(PATIENTS_FILE, patients);
    console.log(`[PatientPersistence] ✏️ Paciente ${patientId} actualizado correctamente.`);
    return updatedPatient;
  });
}

/**
 * Agregar una nueva toma antropométrica con cálculo determinista de IMC e ICC
 */
export async function addAnthropometryMeasurement(patientId, measurementData, reviewer = null) {
  return withWriteLock(async () => {
    if (BASELINE_PATIENT_IDS.has(patientId)) {
      const err = new Error(`El expediente ${patientId} es un paciente de referencia clínica de solo lectura y no admite nuevas mediciones.`);
      err.statusCode = 403;
      err.code = "BASELINE_PATIENT_PROTECTED";
      throw err;
    }

    const patients = getAllPatients({}, null);
    const idx = patients.findIndex(p => p.id === patientId);
    if (idx === -1) {
      const err = new Error(`Paciente con ID ${patientId} no encontrado.`);
      err.statusCode = 404;
      throw err;
    }

    const patient = patients[idx];
    if (patient.isBaseline) {
      const err = new Error(`El expediente ${patientId} es un paciente de referencia clínica de solo lectura y no admite nuevas mediciones.`);
      err.statusCode = 403;
      err.code = "BASELINE_PATIENT_PROTECTED";
      throw err;
    }
    if (reviewer && patient.revisorId && patient.revisorId !== reviewer.id) {
      const err = new Error(`No tiene permisos para modificar el expediente ${patientId}.`);
      err.statusCode = 403;
      err.code = "FORBIDDEN_REVIEWER_MISMATCH";
      throw err;
    }

    if (!patient.antropometria) {
      patient.antropometria = { mediciones: [] };
    }

    const peso = parseFloat(measurementData.peso);
    const talla = parseFloat(measurementData.talla);
    const cintura = measurementData.cintura ? parseFloat(measurementData.cintura) : null;
    const cadera = measurementData.cadera ? parseFloat(measurementData.cadera) : null;

    if (!peso || !talla || peso <= 0 || talla <= 0) {
      const err = new Error("Peso (kg) y talla (cm) deben ser números válidos mayores a 0.");
      err.statusCode = 400;
      throw err;
    }

    const bmiDetalle = calculateBMI(peso, talla, patient.sexo);
    const whrDetalle = calculateWHR(cintura, cadera, patient.sexo);

    const isFirst = patient.antropometria.mediciones.length === 0;
    const tipoMedicion = measurementData.tipo || (isFirst ? "basal" : "seguimiento");

    const newMeasurement = {
      id: `ant-${patientId}-${Date.now()}`,
      fecha: measurementData.fecha || new Date().toISOString().split("T")[0],
      tipo: tipoMedicion,
      peso,
      talla,
      cintura,
      cadera,
      imc: bmiDetalle?.bmi || null,
      imcDetalle: bmiDetalle,
      icc: whrDetalle?.whr || null,
      iccDetalle: whrDetalle,
      fuente: measurementData.fuente || "medico", // 'medico' | 'llamada'
      estadoValidacion: measurementData.fuente === "llamada" ? "reportado_paciente" : "validado",
      notas: (measurementData.notas || "").trim()
    };

    patient.antropometria.mediciones.push(newMeasurement);

    // Ordenar cronológicamente ascendente para gráficas
    patient.antropometria.mediciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    patients[idx] = patient;
    atomicWriteJsonSync(PATIENTS_FILE, patients);
    console.log(`[PatientPersistence] 📏 Medición antropométrica agregada a ${patientId} (${newMeasurement.peso}kg, IMC: ${newMeasurement.imc}).`);
    return { patient, measurement: newMeasurement };
  });
}

/**
 * Actualizar estilo de vida (actividad física o alimentación) conservando procedencia
 */
export async function updateLifestyle(patientId, { actividadFisica, alimentacion, fuente = "medico" }, reviewer = null) {
  return withWriteLock(async () => {
    if (BASELINE_PATIENT_IDS.has(patientId)) {
      const err = new Error(`El expediente ${patientId} es un paciente de referencia clínica de solo lectura y no admite modificaciones.`);
      err.statusCode = 403;
      err.code = "BASELINE_PATIENT_PROTECTED";
      throw err;
    }

    const patients = getAllPatients({}, null);
    const idx = patients.findIndex(p => p.id === patientId);
    if (idx === -1) {
      const err = new Error(`Paciente con ID ${patientId} no encontrado.`);
      err.statusCode = 404;
      throw err;
    }

    const patient = patients[idx];
    if (patient.isBaseline) {
      const err = new Error(`El expediente ${patientId} es un paciente de referencia clínica de solo lectura y no admite modificaciones.`);
      err.statusCode = 403;
      err.code = "BASELINE_PATIENT_PROTECTED";
      throw err;
    }
    if (reviewer && patient.revisorId && patient.revisorId !== reviewer.id) {
      const err = new Error(`No tiene permisos para modificar el expediente ${patientId}.`);
      err.statusCode = 403;
      err.code = "FORBIDDEN_REVIEWER_MISMATCH";
      throw err;
    }

    if (!patient.estiloVida) {
      patient.estiloVida = {};
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const estadoValidacion = fuente === "medico" ? "validado" : "reportado_paciente";

    if (actividadFisica) {
      patient.estiloVida.actividadFisica = {
        ...(patient.estiloVida.actividadFisica || {}),
        ...actividadFisica,
        fechaActualizacion: todayStr,
        fuente,
        estadoValidacion
      };
    }

    if (alimentacion) {
      patient.estiloVida.alimentacion = {
        ...(patient.estiloVida.alimentacion || {}),
        ...alimentacion,
        fechaActualizacion: todayStr,
        fuente,
        estadoValidacion
      };
    }

    patients[idx] = patient;
    atomicWriteJsonSync(PATIENTS_FILE, patients);
    console.log(`[PatientPersistence] 🥗 Estilo de vida actualizado para ${patientId} (Fuente: ${fuente}).`);
    return patient;
  });
}

/**
 * Validar o rectificar un dato clínico reportado por llamada telefónica
 */
export async function validateReportedField(patientId, { section, fieldId, valorAprobado, notas = "" }, reviewer = null) {
  return withWriteLock(async () => {
    if (BASELINE_PATIENT_IDS.has(patientId)) {
      const err = new Error(`El expediente ${patientId} es un paciente de referencia clínica de solo lectura y no admite validación de campos.`);
      err.statusCode = 403;
      err.code = "BASELINE_PATIENT_PROTECTED";
      throw err;
    }

    const patients = getAllPatients({}, null);
    const idx = patients.findIndex(p => p.id === patientId);
    if (idx === -1) {
      const err = new Error(`Paciente con ID ${patientId} no encontrado.`);
      err.statusCode = 404;
      throw err;
    }

    const patient = patients[idx];
    if (patient.isBaseline) {
      const err = new Error(`El expediente ${patientId} es un paciente de referencia clínica de solo lectura y no admite validación de campos.`);
      err.statusCode = 403;
      err.code = "BASELINE_PATIENT_PROTECTED";
      throw err;
    }
    if (reviewer && patient.revisorId && patient.revisorId !== reviewer.id) {
      const err = new Error(`No tiene permisos para modificar el expediente ${patientId}.`);
      err.statusCode = 403;
      err.code = "FORBIDDEN_REVIEWER_MISMATCH";
      throw err;
    }
    const todayStr = new Date().toISOString().split("T")[0];

    if (section === "antropometria") {
      const med = patient.antropometria?.mediciones?.find(m => m.id === fieldId);
      if (med) {
        med.estadoValidacion = "validado";
        med.validadoPor = "Dra. Anamar Cordero Valle";
        med.fechaValidacion = todayStr;
        if (valorAprobado && typeof valorAprobado === "object") {
          if (valorAprobado.peso) med.peso = parseFloat(valorAprobado.peso);
          if (valorAprobado.talla) med.talla = parseFloat(valorAprobado.talla);
          if (valorAprobado.cintura !== undefined) med.cintura = valorAprobado.cintura ? parseFloat(valorAprobado.cintura) : null;
          if (valorAprobado.cadera !== undefined) med.cadera = valorAprobado.cadera ? parseFloat(valorAprobado.cadera) : null;
          med.imcDetalle = calculateBMI(med.peso, med.talla, patient.sexo);
          med.imc = med.imcDetalle?.bmi || null;
          med.iccDetalle = calculateWHR(med.cintura, med.cadera, patient.sexo);
          med.icc = med.iccDetalle?.whr || null;
        }
        if (notas) med.notasValidacion = notas;
      }
    } else if (section === "actividadFisica" && patient.estiloVida?.actividadFisica) {
      patient.estiloVida.actividadFisica.estadoValidacion = "validado";
      patient.estiloVida.actividadFisica.validadoPor = "Dra. Anamar Cordero Valle";
      patient.estiloVida.actividadFisica.fechaValidacion = todayStr;
      if (valorAprobado && typeof valorAprobado === "object") {
        Object.assign(patient.estiloVida.actividadFisica, valorAprobado);
      }
    } else if (section === "alimentacion" && patient.estiloVida?.alimentacion) {
      patient.estiloVida.alimentacion.estadoValidacion = "validado";
      patient.estiloVida.alimentacion.validadoPor = "Dra. Anamar Cordero Valle";
      patient.estiloVida.alimentacion.fechaValidacion = todayStr;
      if (valorAprobado && typeof valorAprobado === "object") {
        Object.assign(patient.estiloVida.alimentacion, valorAprobado);
      }
    } else if (section === "antecedentes") {
      if (patient.antecedentes) {
        patient.antecedentes.estadoValidacion = "validado";
        patient.antecedentes.fechaValidacion = todayStr;
      }
    }

    patients[idx] = patient;
    atomicWriteJsonSync(PATIENTS_FILE, patients);
    console.log(`[PatientPersistence] 🩺 Dato validado por médico en ${patientId} (Sección: ${section}).`);
    return patient;
  });
}

/**
 * Eliminación protegida de paciente (bloqueo absoluto de basales y aislamiento por revisor)
 */
export async function deletePatient(patientId, reviewer = null) {
  return withWriteLock(async () => {
    if (BASELINE_PATIENT_IDS.has(patientId)) {
      const err = new Error("Los pacientes basales de demostración clínica son de solo lectura y no pueden eliminarse.");
      err.statusCode = 403;
      err.code = "BASELINE_PATIENT_PROTECTED";
      throw err;
    }

    const patients = getAllPatients({}, null);
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
      const err = new Error(`Paciente con ID ${patientId} no encontrado.`);
      err.statusCode = 404;
      throw err;
    }

    if (patient.revisorId && reviewer && patient.revisorId !== reviewer.id) {
      const err = new Error("No tiene permisos para eliminar expedientes creados por otro evaluador.");
      err.statusCode = 403;
      err.code = "REVIEWER_MISMATCH";
      throw err;
    }

    const filtered = patients.filter(p => p.id !== patientId);
    atomicWriteJsonSync(PATIENTS_FILE, filtered);
    console.log(`[PatientPersistence] 🗑️ Paciente ${patientId} eliminado.`);
    return { success: true, message: `Paciente ${patientId} eliminado.` };
  });
}
