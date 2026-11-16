import assert from "node:assert";
import { 
  evaluateTranscriptQuality, 
  generateClinicalSummary, 
  createFallbackSummaryFromTranscript 
} from "./services/clinicalSummaryService.js";

async function runTests() {
  console.log("=== INICIANDO PRUEBAS DE CALIDAD Y FIABILIDAD CLÍNICA LAZO V1 ===");
  const patient = {
    id: "LZ-0482",
    nombre: "Roberto Méndez Silva",
    medicoTratante: "Dra. Anamar Cordero Valle",
    medicacion: [
      { nombre: "Metformina 850 mg", dosis: "850 mg", pauta: "850 miligramos, dos veces al día" },
      { nombre: "Insulina Glargina 18 UI", dosis: "18 UI", pauta: "18 unidades internacionales nocturna" },
      { nombre: "Losartán 50 mg", dosis: "50 mg", pauta: "50 miligramos al día" }
    ]
  };

  // TEST 1: Regla de Calidad y Abstención - Transcripción insuficiente (1 turno corto)
  console.log("\n[TEST 1] Regla de Calidad y Abstención: Transcripción con un solo turno corto...");
  const shortTranscript = [
    { segundo: 0, hablante: "Lazo (IA)", texto: "Hola, le habla Lazo..." },
    { segundo: 4, hablante: "Paciente", texto: "Hola bueno" }
  ];
  const q1 = evaluateTranscriptQuality(shortTranscript, patient, { consentState: "GRANTED" });
  assert.strictEqual(q1.isQualified, false, "Debe descalificar por turnos/palabras insuficientes");
  console.log("  ✅ Calidad rechazada correctamente:", q1.reason);

  const sum1 = await generateClinicalSummary({
    transcript: shortTranscript,
    patient,
    callMetadata: { consentState: "GRANTED" }
  });
  assert.strictEqual(sum1.generado, false, "generado debe ser false");
  assert.ok(sum1.motivoAbstencion.includes("calidad suficiente"), "Debe contener el motivo de abstención oficial");
  console.log("  ✅ Resumen no generado conforme a regla oficial.");

  // TEST 2: Consentimiento rechazado
  console.log("\n[TEST 2] Regla de Calidad y Abstención: Consentimiento denegado...");
  const deniedTranscript = [
    { segundo: 0, hablante: "Lazo (IA)", texto: "¿Está de acuerdo en continuar y en que grabemos la llamada?" },
    { segundo: 5, hablante: "Paciente", texto: "No, no quiero que graben nada, ahorita no puedo." }
  ];
  const q2 = evaluateTranscriptQuality(deniedTranscript, patient, { consentState: "DENIED" });
  assert.strictEqual(q2.isQualified, false, "Debe descalificar por consentimiento rechazado");
  const sum2 = await generateClinicalSummary({
    transcript: deniedTranscript,
    patient,
    callMetadata: { consentState: "DENIED" }
  });
  assert.strictEqual(sum2.generado, false);
  console.log("  ✅ Consentimiento rechazado resulta en abstención sin síntesis.");

  // TEST 3: Aislamiento contextual estricto de Glucosa (ignorar fecha 1964, 14 mayo, dosis 850)
  console.log("\n[TEST 3] Aislamiento estricto de glucosa: Fechas y dosis no deben contaminar bitácora...");
  const contextTranscript = [
    { segundo: 0, hablante: "Lazo (IA)", texto: "Hola, le habla Lazo. ¿Me confirma su nombre y fecha de nacimiento?" },
    { segundo: 5, hablante: "Paciente", texto: "Sí, soy Roberto Méndez Silva y nací el 14 de mayo de 1964." },
    { segundo: 12, hablante: "Lazo (IA)", texto: "¿Se tomó su metformina de 850 miligramos y cuánto tuvo de azúcar en ayunas?" },
    { segundo: 18, hablante: "Paciente", texto: "Sí me tomé la metformina de 850 mg y hoy mi glucosa en ayunas marcó 128." },
    { segundo: 26, hablante: "Lazo (IA)", texto: "¿Ha realizado alguna actividad física o caminata?" },
    { segundo: 30, hablante: "Paciente", texto: "Caminé 20 minutos por la mañana y me sentí bastante bien." }
  ];

  const sum3 = createFallbackSummaryFromTranscript(contextTranscript, patient, "Test determinista");
  assert.strictEqual(sum3.generado, true);
  console.log("  Valores en bitácora:", sum3.bitacoraGlucosa.map(b => b.valor));
  assert.strictEqual(sum3.bitacoraGlucosa.length, 1, "Solo debe haber 1 medición de glucosa");
  assert.strictEqual(sum3.bitacoraGlucosa[0].valor, "128 mg/dL", "El valor extraído debe ser 128 mg/dL");
  assert.strictEqual(sum3.bitacoraGlucosa[0].fuenteSegundo, 18, "fuenteSegundo debe apuntar al segundo 18");
  console.log("  ✅ Glucosa aislada con total precisión (128 mg/dL), sin falsos positivos de 1964 ni 850 mg.");

  // TEST 4: Memoria conversacional y registro de omisión espontánea
  console.log("\n[TEST 4] Memoria y extracción de omisión espontánea con trazabilidad...");
  const omissionTranscript = [
    { segundo: 0, hablante: "Lazo (IA)", texto: "Hola, le habla Lazo..." },
    { segundo: 4, hablante: "Paciente", texto: "Roberto Méndez Silva, 14 de mayo de 1964." },
    { segundo: 10, hablante: "Lazo (IA)", texto: "¿Está de acuerdo en continuar y grabar?" },
    { segundo: 14, hablante: "Paciente", texto: "Sí, acepto continuar con la llamada." },
    { segundo: 18, hablante: "Lazo (IA)", texto: "¿Cómo le ha ido con su metformina?" },
    { segundo: 22, hablante: "Paciente", texto: "Olvidé la metformina anoche porque me quedé dormido." }
  ];
  const sum4 = createFallbackSummaryFromTranscript(omissionTranscript, patient, "Test omisión");
  const metf = sum4.medicamentosYAdherencia.find(m => m.medicamento.includes("Metformina"));
  assert.ok(metf, "Debe evaluar metformina");
  assert.strictEqual(metf.dosisOmitidas, "1 dosis referida");
  assert.strictEqual(metf.motivo, "Se quedó dormido");
  assert.strictEqual(metf.fuenteSegundo, 22);
  // TEST 5: Fidelidad en actividad física y prevención de alucinación de alcohol
  console.log("\n[TEST 5] Actividad física: Reconocimiento de gimnasio/pesas sin alucinación de alcohol...");
  const gymTranscript = [
    { segundo: 0, hablante: "Lazo (IA)", texto: "¿Hizo alguna actividad física?" },
    { segundo: 5, hablante: "Paciente", texto: "Fui al gimnasio a cervezas y también hice bici." }
  ];
  const sum5 = createFallbackSummaryFromTranscript(gymTranscript, patient, "Test actividad física");
  assert.strictEqual(sum5.generado, true);
  console.log("  Actividad física extraída:", sum5.actividadFisica);
  assert.ok(!sum5.actividadFisica.toLowerCase().includes("cervezas"), "No debe contener cervezas");
  assert.ok(sum5.actividadFisica.includes("gimnasio"), "Debe reconocer gimnasio");
  console.log("  ✅ Actividad física contextualizada correctamente sin falsas imputaciones de alcohol.");

  console.log("\n🎉 TODAS LAS PRUEBAS DE CALIDAD Y FIABILIDAD PASARON EXITOSAMENTE.");
}

runTests().catch(err => {
  console.error("❌ ERROR EN PRUEBAS:", err);
  process.exit(1);
});
