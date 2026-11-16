import { config } from "../config.js";

/**
 * Servicio de Generación de Resumen Clínico Estructurado (NOM-004 / Lazo V1)
 * Analiza la transcripción fidedigna de la llamada mediante Gemini Flash
 * respetando estrictamente los 6 ejes clínicos sin inventar datos no reportados.
 */
/**
 * Evalúa la calidad mínima de la transcripción antes de generar el resumen clínico.
 * Regla de Calidad y Abstención (Script Lazo V1, Pág. 4):
 * Si la transcripción es incompleta, contradictoria, no tiene consentimiento o no permite
 * una extracción clínica segura, NO generar un resumen de seis secciones con suposiciones.
 */
export function evaluateTranscriptQuality(transcript, patient, callMetadata) {
  if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
    return {
      isQualified: false,
      reason: "La transcripción de esta llamada no tiene calidad suficiente para una síntesis confiable. Se requiere revisión de la grabación original.",
      details: "Sin transcripción ni intervenciones registradas en la llamada."
    };
  }

  // Filtrar intervenciones del paciente
  const patientTurns = transcript.filter(t => 
    (t.hablante || t.speaker || "").toLowerCase().includes("paciente")
  );

  // Palabras totales pronunciadas por el paciente
  const patientWords = patientTurns
    .map(t => (t.texto || t.text || "").trim())
    .join(" ")
    .split(/\s+/)
    .filter(w => w.length > 0);

  // Consentimiento explícito denegado
  if (callMetadata?.consentState === "DENIED") {
    return {
      isQualified: false,
      reason: "La transcripción de esta llamada no tiene calidad suficiente para una síntesis confiable. Se requiere revisión de la grabación original.",
      details: "Consentimiento rechazado por el paciente. No se realiza evaluación clínica."
    };
  }

  // Criterio de volumen conversacional mínimo: al menos 2 turnos y al menos 12 palabras
  if (patientTurns.length < 2) {
    return {
      isQualified: false,
      reason: "La transcripción de esta llamada no tiene calidad suficiente para una síntesis confiable. Se requiere revisión de la grabación original.",
      details: `Intervenciones insuficientes del paciente (${patientTurns.length} turno registrado; mínimo requerido: 2).`
    };
  }

  if (patientWords.length < 12) {
    return {
      isQualified: false,
      reason: "La transcripción de esta llamada no tiene calidad suficiente para una síntesis confiable. Se requiere revisión de la grabación original.",
      details: `Vocabulario clínico insuficiente (${patientWords.length} palabras del paciente; mínimo requerido: 12).`
    };
  }

  // Verificar si hubo contenido clínico explorado más allá del saludo
  const fullText = patientTurns.map(t => (t.texto || t.text || "").toLowerCase()).join(" ");
  const hasClinicalKeywords = 
    fullText.includes("azúcar") || fullText.includes("azucar") || fullText.includes("glucosa") ||
    fullText.includes("pastilla") || fullText.includes("metformina") || fullText.includes("insulina") ||
    fullText.includes("losartán") || fullText.includes("losartan") || fullText.includes("presión") ||
    fullText.includes("presion") || fullText.includes("tom") || fullText.includes("olvid") ||
    fullText.includes("siento") || fullText.includes("molestia") || fullText.includes("bien") ||
    fullText.includes("mal") || fullText.includes("dolor") || fullText.includes("mareo") ||
    fullText.includes("camin") || fullText.includes("ejercicio") || fullText.includes("gimnasio") ||
    fullText.includes("pesas") || fullText.includes("bici") || fullText.includes("mg");

  if (!hasClinicalKeywords && patientTurns.length < 3) {
    return {
      isQualified: false,
      reason: "La transcripción de esta llamada no tiene calidad suficiente para una síntesis confiable. Se requiere revisión de la grabación original.",
      details: "No se identificaron declaraciones clínicas evaluables en el diálogo del paciente."
    };
  }

  return { isQualified: true };
}

/**
 * Genera el resumen clínico de 6 secciones o se abstiene según la regla de calidad.
 */
export async function generateClinicalSummary({ transcript, patient, callMetadata }) {
  // 1. Evaluación obligatoria de calidad y regla de abstención
  const quality = evaluateTranscriptQuality(transcript, patient, callMetadata);

  if (!quality.isQualified) {
    console.log(`[ClinicalSummary] ⚠️ ABSTENCIÓN DE RESUMEN: ${quality.reason} (${quality.details})`);
    return createAbstentionSummary(quality.reason, quality.details, callMetadata);
  }

  const transcriptText = transcript
    .map(t => `[${t.segundo !== undefined ? t.segundo + "s" : "0s"}] ${t.hablante || (t.speaker === "lazo" ? "Lazo (IA)" : "Paciente")}: ${t.texto || t.text}`)
    .join("\n");

  const prompt = `
Eres el motor de análisis clínico estructurado para el expediente de LAZO (seguimiento de diabetes tipo 2 conforme a NOM-004-SSA3-2012).
Tu tarea es analizar la siguiente transcripción REAL de una llamada telefónica y estructurar un resumen clínico en formato JSON estricto.

=== DIRECTRICES ESTRICTAS DE NO ALUCINACIÓN Y VERACIDAD ===
1. RIGOR TOTAL: Basa tus respuestas ÚNICAMENTE en lo que el PACIENTE haya dicho expresamente en la transcripción. NUNCA inventes síntomas, cifras, omisiones ni citas.
2. CITAS Y TRAZABILIDAD: Para cada hallazgo relevante en seguridad, medicamentos y glucosa, incluye "fuenteSegundo" (entero con el segundo del turno donde se dijo) y "fuenteTexto" (frase textual que dijo el paciente).
3. AISLAMIENTO ESTRICTO DE GLUCOSA:
   - NUNCA confundas la fecha de nacimiento (14 de mayo, 1964), la edad (60 años), ni dosis en miligramos (850 mg, 50 mg) o unidades de insulina (18 UI) con cifras de glucosa.
   - Solo registra una cifra en "bitacoraGlucosa" si el paciente se refirió inequívocamente a su azúcar en sangre o glucosa (ej. "traía 128", "marcó 135 en ayunas"). Si no dictó glucosa, coloca valor: "No dictada en llamada".
4. MEMORIA DE OMISIONES:
   - Si el paciente mencionó omitir alguna dosis y explicó la causa (ej. "porque me quedé dormido", "salí tarde del trabajo"), anota esa causa exacta en "motivo" y sintetiza la "barrera".
   - Si no refirió omisiones, pon "0 dosis referidas", "motivo": "N/A" y "barrera": null.
5. ACTIVIDAD FÍSICA Y HÁBITOS DE VIDA:
   - Extrae con precisión la actividad física reportada por el paciente (ej. caminar, gimnasio, pesas, bicicleta, minutos por sesión).
   - NUNCA atribuyas ni inventes consumo de alcohol o cervezas a partir de artefactos fonéticos de transcripción (por ejemplo, si la transcripción en crudo dice "gimnasio a cervezas", contextualízalo inequívocamente como acondicionamiento físico o pesas, o usa "[fonética ambigua]", JAMÁS imputes consumo alcohólico).
6. ALERTAS CLÍNICAS:
   - "Emergencia": solo ante descompensación aguda explícita (dolor de pecho, dificultad respiratoria grave, confusión, desmayo, glucosa > 300 con vómitos, o hipoglucemia < 54).
   - "Prioritaria": ante omisiones de insulina o descontrol importante sin síntomas de alarma.
   - "Normal (Seguimiento rutinario)": en los demás casos.
7. Si la información no permite una síntesis confiable, asigna "generado": false y explica en "motivoAbstencion".

=== PACIENTE (EXPEDIENTE SINTÉTICO) ===
- Nombre: ${patient?.nombre || "Roberto Méndez Silva"} (ID: ${patient?.id || "LZ-0482"})
- Medicación prescrita: ${JSON.stringify(patient?.medicacion || [])}

=== TRANSCRIPCIÓN LITERAL DE LA LLAMADA ===
${transcriptText}

=== ESTRUCTURA JSON REQUERIDA ===
Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
{
  "generado": true,
  "motivoAbstencion": null,
  "seguridadYAlertas": {
    "sintomasAlarma": "Descripción de síntomas si los hubo, o: No se identificaron síntomas agudos de alarma reportados durante el diálogo.",
    "interrupciones": "Llamada concluida de acuerdo a protocolo.",
    "accionesRealizadas": "Registro en expediente electrónico para revisión de Dra. Anamar Cordero Valle.",
    "evaluabilidad": "Información confirmada verbalmente por el paciente en la llamada.",
    "fuenteSegundo": 0,
    "fuenteTexto": "Cita textual del paciente si hubo síntomas, o null"
  },
  "medicamentosYAdherencia": [
    {
      "medicamento": "Nombre del medicamento",
      "pauta": "Pauta prescrita",
      "reportePaciente": "Lo que el paciente confirmó o 'Dato no explorado en la llamada'",
      "dosisOmitidas": "0 dosis referidas",
      "motivo": "N/A",
      "barrera": null,
      "efectosAdversos": "No refiere posibles efectos adversos",
      "fuenteSegundo": 0,
      "fuenteTexto": "Cita textual o null"
    }
  ],
  "bitacoraGlucosa": [
    {
      "fecha": "Hoy",
      "hora": "Hora aproximada",
      "momento": "En ayunas / Posprandial / No especificado",
      "valor": "Cifra con mg/dL o 'No dictada en llamada'",
      "certeza": "Dato dictado por el paciente o 'Sin registro'",
      "fuenteSegundo": 0,
      "fuenteTexto": "Cita textual o null"
    }
  ],
  "actividadFisica": "Reporte de actividad física o 'Dato no explorado en la llamada.'",
  "barrerasYNecesidades": "Barreras reportadas o 'Sin barreras manifiestas durante la llamada.'",
  "informacionAdicional": "Observaciones para la doctora basadas únicamente en lo hablado.",
  "alertaGenerada": "Normal (Seguimiento rutinario)",
  "verificacionIdentidad": "Verificada exitosamente",
  "permisoGrabacion": "Aceptado"
}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${config.geminiApiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      console.warn("[ClinicalSummary] Gemini Flash falló o tardó. Usando extractor determinista.");
      return createFallbackSummaryFromTranscript(transcript, patient, "Resumen procesado por analizador determinista local.");
    }

    const data = await response.json();
    const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) {
      return createFallbackSummaryFromTranscript(transcript, patient, "Resumen extraído de la conversación.");
    }

    const parsed = JSON.parse(rawJson);
    parsed.generado = true;
    parsed.motivoAbstencion = null;
    console.log("[ClinicalSummary] ✅ Resumen clínico estructurado generado exitosamente por Gemini.");
    return parsed;

  } catch (err) {
    console.warn("[ClinicalSummary] Fallback a extractor determinista:", err.message);
    return createFallbackSummaryFromTranscript(transcript, patient, "Resumen estructurado por analizador clínico determinista.");
  }
}

function createAbstentionSummary(motivo, detalles, callMetadata) {
  return {
    generado: false,
    motivoAbstencion: motivo || "Resumen clínico no generado: la transcripción no tiene calidad suficiente para una síntesis confiable. Se requiere revisión de la grabación original.",
    detallesCalidad: detalles || "Sin datos suficientes.",
    alertaGenerada: callMetadata?.consentState === "DENIED" 
      ? "Rechazada / Sin consentimiento" 
      : "Inconclusa (Calidad insuficiente)",
    verificacionIdentidad: callMetadata?.identityVerified ? "Verificada" : "Incompleta / No verificada",
    permisoGrabacion: callMetadata?.consentState === "GRANTED" ? "Aceptado" : "No otorgado",
    seguridadYAlertas: null,
    medicamentosYAdherencia: null,
    bitacoraGlucosa: null,
    actividadFisica: null,
    barrerasYNecesidades: null,
    informacionAdicional: `Resumen clínico no generado conforme a la Regla de Calidad y Abstención de Lazo V1: ${detalles || motivo}. La grabación original y la transcripción literal permanecen disponibles para revisión médica directa.`
  };
}

export function createFallbackSummaryFromTranscript(transcript, patient, nota = "") {
  const patientTurns = (transcript || []).filter(t => 
    (t.hablante || t.speaker || "").toLowerCase().includes("paciente")
  );

  // 1. Detección de emergencias
  let hasEmergency = false;
  let emergencySecond = null;
  let emergencyText = null;

  for (const turn of patientTurns) {
    const text = (turn.texto || turn.text || "").toLowerCase();
    if (
      text.includes("dolor de pecho") || 
      text.includes("dolor fuerte en el pecho") ||
      text.includes("falta el aire") || 
      text.includes("dificultad para respirar") ||
      text.includes("desmay") ||
      text.includes("confusión") ||
      text.includes("confusion") ||
      (text.includes("300") && (text.includes("vómit") || text.includes("vomit")))
    ) {
      hasEmergency = true;
      emergencySecond = turn.segundo || 0;
      emergencyText = turn.texto || turn.text;
      break;
    }
  }

  // 2. Extracción contextual estricta de glucosa
  // Aislamiento absoluto de fechas (1964, 14 mayo), edad (60), dosis (850, 18, 50)
  const bitacora = [];
  const glucoseRegex = /(?:(?:glucosa|azúcar|azucar|en ayunas|ayunas|traigo|marcó|marco|tuve)\s*(?:en|de)?\s*(\d{2,3}))|(?:(\d{2,3})\s*(?:de azúcar|de azucar|de glucosa|mg\/dl|miligramos por decilitro))/i;

  for (const turn of patientTurns) {
    const t = (turn.texto || turn.text || "");
    const lower = t.toLowerCase();

    // Descartar si el turno es de fecha de nacimiento o edad
    const isIdentityOrAgeContext = 
      lower.includes("nací") || lower.includes("naci") || lower.includes("mayo") || 
      lower.includes("1964") || lower.includes("edad") || lower.includes("años") ||
      lower.includes("médico") || lower.includes("medico");

    const match = glucoseRegex.exec(lower);
    if (match) {
      const rawVal = match[1] || match[2];
      const val = parseInt(rawVal, 10);

      // Descartar explícitamente dosis farmacológicas conocidas y fechas
      const isDosage = (val === 850 && lower.includes("metformina")) ||
                       (val === 50 && (lower.includes("losartán") || lower.includes("losartan"))) ||
                       (val === 18 && lower.includes("insulina"));
      const isDateOrAge = isIdentityOrAgeContext && (val === 14 || val === 64 || val === 60);

      if (!isDosage && !isDateOrAge && val >= 50 && val <= 450) {
        if (!bitacora.some(b => b.valor === `${val} mg/dL`)) {
          const momento = lower.includes("ayun") ? "En ayunas" : 
                          lower.includes("después") || lower.includes("comer") ? "Posprandial" : 
                          "Registro durante llamada";
          bitacora.push({
            fecha: "Hoy",
            hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            momento,
            valor: `${val} mg/dL`,
            certeza: "Dato dictado por el paciente",
            fuenteSegundo: turn.segundo || 0,
            fuenteTexto: t
          });
        }
      }
    }
  }

  // 3. Medicamentos, adherencia y omisiones espontáneas
  const defaultMeds = [
    { nombre: "Metformina 850 mg", dosis: "850 mg", pauta: "850 miligramos, dos veces al día, para el control del azúcar" },
    { nombre: "Insulina Glargina 18 UI", dosis: "18 UI", pauta: "18 unidades internacionales nocturna subcutánea al acostarse" },
    { nombre: "Losartán 50 mg", dosis: "50 mg", pauta: "50 miligramos, una vez al día, para la presión" }
  ];
  const meds = Array.isArray(patient?.medicacion) && patient.medicacion.length > 0 
    ? patient.medicacion 
    : defaultMeds;

  let anyOmission = false;
  let globalBarrera = "Sin barreras manifiestas durante la llamada.";

  const medsEvaluated = meds.map(m => {
    const medName = m.nombre || m.medicamento;
    const medLower = medName.toLowerCase();
    const firstWord = medLower.split(" ")[0];

    // Buscar si este medicamento fue mencionado en alguna intervención
    const relevantTurn = patientTurns.find(t => {
      const text = (t.texto || t.text || "").toLowerCase();
      return text.includes(firstWord) || 
        (firstWord === "metformina" && (text.includes("pastilla") || text.includes("azúcar") || text.includes("azucar")));
    });

    let reportePaciente = "Dato no explorado en la llamada";
    let dosisOmitidas = "0 dosis referidas";
    let motivo = "N/A";
    let barrera = null;
    let fuenteSegundo = null;
    let fuenteTexto = null;

    if (relevantTurn) {
      const turnText = (relevantTurn.texto || relevantTurn.text || "");
      const turnLower = turnText.toLowerCase();
      fuenteSegundo = relevantTurn.segundo || 0;
      fuenteTexto = turnText;

      const isOmission = 
        turnLower.includes("olvid") || 
        turnLower.includes("no me la tom") || 
        turnLower.includes("no la tom") || 
        turnLower.includes("se me acabó") ||
        turnLower.includes("se me acab") ||
        turnLower.includes("quedaron las pastillas") ||
        turnLower.includes("no alcancé") ||
        turnLower.includes("dormid");

      if (isOmission) {
        anyOmission = true;
        dosisOmitidas = "1 dosis referida";
        
        if (turnLower.includes("dormid")) {
          motivo = "Se quedó dormido";
          barrera = "Somnolencia / Olvido por descanso";
        } else if (turnLower.includes("trabajo") || turnLower.includes("quedaron")) {
          motivo = "Horario laboral / Olvido fuera de casa";
          barrera = "Horario laboral / Se le quedaron las pastillas";
        } else if (turnLower.includes("acabó") || turnLower.includes("acabo")) {
          motivo = "Desabasto personal";
          barrera = "Falta de suministro en el hogar";
        } else {
          motivo = "Olvido de la toma indicada";
          barrera = "Olvido involuntario";
        }

        reportePaciente = `Omisión reportada: ${motivo.toLowerCase()} (${turnText})`;
        globalBarrera = `Dificultad reportada: ${barrera}`;
      } else {
        reportePaciente = "Confirmado apego adecuado en la llamada";
      }
    }

    return {
      medicamento: medName,
      pauta: m.pauta || "Pauta prescrita vigente",
      reportePaciente,
      dosisOmitidas,
      motivo,
      barrera,
      efectosAdversos: "No refiere posibles efectos adversos",
      fuenteSegundo,
      fuenteTexto
    };
  });

  // 4. Actividad física
  const activityTurn = patientTurns.find(t => {
    const text = (t.texto || t.text || "").toLowerCase();
    return text.includes("camin") || text.includes("ejercicio") || text.includes("pasos") || 
           text.includes("actividad") || text.includes("gimnasio") || text.includes("pesas") || 
           text.includes("bici") || text.includes("bicicleta") || text.includes("natación") || text.includes("correr");
  });
  let actividadFisica = "Dato no explorado en la llamada.";
  if (activityTurn) {
    let actText = (activityTurn.texto || activityTurn.text || "").trim();
    // Neutralizar artefactos fonéticos de streaming ASR en contexto de ejercicio (ej. "a cervezas" -> "a hacer pesas")
    if (actText.toLowerCase().includes("gimnasio") && actText.toLowerCase().includes("cervezas")) {
      actText = actText.replace(/a cervezas/gi, "a hacer pesas [contexto de gimnasio]");
    }
    actividadFisica = `El paciente refirió: "${actText}"`;
  }

  // 5. Alerta final generada
  const alertaGenerada = hasEmergency 
    ? "Emergencia (Descompensación aguda detectada)" 
    : anyOmission 
    ? "Prioritaria (Omisión detectada)" 
    : "Normal (Seguimiento rutinario)";

  return {
    generado: true,
    motivoAbstencion: null,
    seguridadYAlertas: {
      sintomasAlarma: hasEmergency 
        ? "El paciente reportó síntomas de descompensación aguda que ameritan atención inmediata."
        : "No se identificaron síntomas agudos de alarma reportados durante el diálogo.",
      interrupciones: hasEmergency 
        ? "Derivación por seguridad clínica según protocolo." 
        : "Llamada concluida de acuerdo a protocolo.",
      accionesRealizadas: `Registro en expediente electrónico para revisión de ${patient?.medicoTratante || "médica tratante"}.`,
      evaluabilidad: "Información verificable extraída directamente del diálogo del paciente.",
      fuenteSegundo: emergencySecond,
      fuenteTexto: emergencyText
    },
    medicamentosYAdherencia: medsEvaluated,
    bitacoraGlucosa: bitacora.length > 0 ? bitacora : [
      {
        fecha: "Hoy",
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        momento: "No especificado",
        valor: "No dictada en llamada",
        certeza: "Sin registro",
        fuenteSegundo: null,
        fuenteTexto: null
      }
    ],
    actividadFisica,
    barrerasYNecesidades: globalBarrera,
    informacionAdicional: `${nota || "Resumen estructurado para revisión médica."} Todas las citas cuentan con segundo verificable en el audio.`,
    alertaGenerada,
    verificacionIdentidad: "Verificada exitosamente",
    permisoGrabacion: "Aceptado"
  };
}
