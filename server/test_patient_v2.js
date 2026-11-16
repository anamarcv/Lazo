import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  addAnthropometryMeasurement,
  updateLifestyle,
  validateReportedField,
  calculateBMI,
  calculateWHR,
  calculateMifflinStJeor,
  normalizeNotes,
  normalizePatient
} from "./services/patientPersistenceService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PATIENTS_FILE = path.join(__dirname, "data/patients.json");

console.log("=======================================================");
console.log("🧪 INICIANDO SUITE DE PRUEBAS AUTOMATIZADAS LAZO V2");
console.log("=======================================================\n");

async function runTests() {
  // Limpieza preventiva de pacientes de prueba de ejecuciones previas
  const preCleanPatients = getAllPatients().filter(p => !p.id.startsWith("LZ-TEST-") && !p.id.startsWith("LZ-DRAFT-") && p.nombre !== "María Guadalupe Flores Rivas");
  const tempPreClean = `${PATIENTS_FILE}.clean.tmp`;
  fs.writeFileSync(tempPreClean, JSON.stringify(preCleanPatients, null, 2), "utf-8");
  fs.renameSync(tempPreClean, PATIENTS_FILE);

  // TEST 1: Verificar sembrado inicial y no-pérdida de pacientes existentes
  console.log("[TEST 1] Verificando sembrado inicial de pacientes...");
  const initialPatients = getAllPatients();
  assert(initialPatients.length >= 4, "Debe haber al menos 4 pacientes");
  const roberto = getPatientById("LZ-0482");
  assert(roberto !== null, "Roberto Méndez Silva (LZ-0482) debe existir");
  assert(roberto.nombre === "Roberto Méndez Silva", "Nombre de Roberto verificado");
  console.log(`  ✅ Sembrado inicial verificado: ${initialPatients.length} pacientes disponibles.`);

  // TEST 2: Alta de nuevo paciente completo
  console.log("\n[TEST 2] Alta de nuevo paciente completo (María Guadalupe)...");
  const testId = `LZ-TEST-${Date.now().toString().slice(-4)}`;
  const newPatientData = {
    id: testId,
    nombre: "María Guadalupe Flores Rivas",
    fechaNacimiento: "1970-08-22",
    sexo: "Femenino",
    telefono: "55 8899 1122",
    direccion: "Coyoacán, Ciudad de México",
    diagnosticoPrincipal: "Diabetes Mellitus Tipo 2 (Reciente diagnóstico)",
    diagnosticosSecundarios: ["Hipertensión Arterial Sistémica"],
    peso: "72.5",
    talla: "158",
    cintura: "86",
    cadera: "102"
  };

  const created = await createPatient(newPatientData);
  assert(created.id === testId, "El ID debe coincidir");
  assert(created.nombre === "María Guadalupe Flores Rivas", "El nombre debe coincidir");
  assert(created.antropometria.mediciones.length === 1, "Debe tener 1 medición antropométrica basal");
  const basal = created.antropometria.mediciones[0];
  assert(basal.peso === 72.5, "Peso correcto");
  assert(basal.imc === 29.04, "IMC correcto: 72.5 / (1.58^2) = 29.04");
  assert(basal.icc === 0.84, "ICC correcto: 86 / 102 = 0.84");
  console.log(`  ✅ Paciente creada con éxito: ${created.id} (IMC: ${basal.imc}, ICC: ${basal.icc})`);

  // TEST 3: Verificación de persistencia duradera en disco
  console.log("\n[TEST 3] Verificando persistencia duradera en patients.json...");
  const diskRaw = fs.readFileSync(PATIENTS_FILE, "utf-8");
  const diskPatients = JSON.parse(diskRaw);
  const foundOnDisk = diskPatients.find(p => p.id === testId);
  assert(foundOnDisk !== undefined, "El paciente creado debe existir físicamente en patients.json");
  console.log("  ✅ Persistencia duradera en disco confirmada.");

  // TEST 4: Prevención de duplicados (por ID y por Nombre + Fecha de Nacimiento)
  console.log("\n[TEST 4] Prevención de registros duplicados...");
  let dupRejectedId = false;
  try {
    await createPatient({ id: testId, nombre: "Otra Persona", fechaNacimiento: "1980-01-01" });
  } catch (err) {
    dupRejectedId = true;
    console.log(`  ✅ Duplicado por ID rechazado correctamente: "${err.message}"`);
  }
  assert(dupRejectedId, "Debe rechazar paciente con ID repetido");

  let dupRejectedNameDob = false;
  try {
    await createPatient({
      nombre: "María Guadalupe Flores Rivas",
      fechaNacimiento: "1970-08-22",
      sexo: "Femenino"
    });
  } catch (err) {
    dupRejectedNameDob = true;
    console.log(`  ✅ Duplicado por Nombre y Fecha de Nacimiento rechazado correctamente: "${err.message}"`);
  }
  assert(dupRejectedNameDob, "Debe rechazar paciente con mismo nombre y fecha de nacimiento");

  // TEST 5: Guardado de borrador incompleto
  console.log("\n[TEST 5] Guardado de expediente incompleto como borrador...");
  const draftId = `LZ-DRAFT-${Date.now().toString().slice(-4)}`;
  const draft = await createPatient({
    id: draftId,
    nombre: "Borrador Paciente Pendiente",
    esBorrador: true
  });
  assert(draft.estadoAlta === "borrador", "Debe marcarse como borrador");
  console.log(`  ✅ Borrador guardado exitosamente con ID ${draft.id} (estadoAlta: ${draft.estadoAlta}).`);

  // Completar borrador posteriormente
  const completedDraft = await updatePatient(draftId, {
    fechaNacimiento: "1965-03-10",
    sexo: "Masculino",
    telefono: "55 1234 5678",
    estadoAlta: "completo"
  });
  assert(completedDraft.estadoAlta === "completo", "Borrador completado debe cambiar a completo");
  assert(completedDraft.telefono === "55 1234 5678", "Datos completados deben persistir");
  console.log("  ✅ Borrador completado y actualizado a estado 'completo'.");

  // TEST 6: Edición directa por el médico de datos generales y clínicos
  console.log("\n[TEST 6] Edición médica de datos clínicos...");
  const updated = await updatePatient(testId, {
    telefono: "55 9900 1122",
    diagnosticosSecundarios: ["Hipertensión Arterial Sistémica", "Dislipidemia"],
    antecedentes: {
      alergias: [{ sustancia: "Sulfamidas", reaccion: "Urticaria", confirmacion: "Confirmada por médico" }]
    }
  });
  assert(updated.telefono === "55 9900 1122", "Teléfono actualizado");
  assert(updated.diagnosticosSecundarios.includes("Dislipidemia"), "Diagnóstico agregado");
  assert(updated.antecedentes.alergias.length === 1, "Alergia registrada");
  console.log("  ✅ Campos clínicos editados y persistidos correctamente.");

  // TEST 7: Antropometría basal y posterior (Evolución de mediciones)
  console.log("\n[TEST 7] Registro de medición antropométrica de seguimiento...");
  const followUp = await addAnthropometryMeasurement(testId, {
    fecha: "2026-11-15",
    tipo: "seguimiento",
    peso: "70.2",
    talla: "158",
    cintura: "84",
    cadera: "101",
    notas: "Descenso de 2.3 kg con mejoría en perímetro de cintura"
  });
  assert(followUp.patient.antropometria.mediciones.length === 2, "Debe tener 2 tomas");
  const second = followUp.measurement;
  assert(second.peso === 70.2, "Peso 70.2 kg");
  assert(second.imc === 28.12, "IMC nuevo: 70.2 / (1.58^2) = 28.12");
  assert(second.icc === 0.83, "ICC nuevo: 84 / 101 = 0.83");
  console.log(`  ✅ Segunda toma guardada: ${second.peso} kg (IMC: ${second.imc}, ICC: ${second.icc}).`);

  // TEST 8: Validación de Fórmulas deterministas: OMS vs NOM-008 Talla Baja
  console.log("\n[TEST 8] Validación de Criterios de IMC (OMS vs. NOM-008 Talla Baja)...");
  // Caso 1: Hombre estándar (1.75m, 80kg -> IMC 26.12 -> Sobrepeso OMS)
  const hombreStd = calculateBMI(80, 175, "Masculino");
  assert(hombreStd.esTallaBaja === false, "No debe ser talla baja");
  assert(hombreStd.categoria === "Sobrepeso", "Debe ser Sobrepeso OMS");

  // Caso 2: Hombre talla baja (<1.60m: 1.58m, 63kg -> IMC 25.24 -> Obesidad NOM-008!)
  const hombreTallaBaja = calculateBMI(63, 158, "Masculino");
  assert(hombreTallaBaja.esTallaBaja === true, "Debe ser talla baja");
  assert(hombreTallaBaja.categoria === "Obesidad (para talla baja)", "En NOM-008 IMC >= 25 es Obesidad para talla baja");
  console.log(`  ✅ Corte NOM-008 Talla Baja Hombre verificado: IMC ${hombreTallaBaja.bmi} -> ${hombreTallaBaja.categoria}`);

  // Caso 3: Mujer talla baja (<1.50m: 1.48m, 51kg -> IMC 23.28 -> Sobrepeso NOM-008!)
  const mujerTallaBaja = calculateBMI(51, 148, "Femenino");
  assert(mujerTallaBaja.esTallaBaja === true, "Mujer < 1.50m es talla baja");
  assert(mujerTallaBaja.categoria === "Sobrepeso (para talla baja)", "En NOM-008 IMC 23.0-24.9 es Sobrepeso para talla baja");
  console.log(`  ✅ Corte NOM-008 Talla Baja Mujer verificado: IMC ${mujerTallaBaja.bmi} -> ${mujerTallaBaja.categoria}`);

  // TEST 9: Validación de Mifflin–St Jeor (1990)
  console.log("\n[TEST 9] Validación de fórmula de Mifflin–St Jeor (1990)...");
  // Hombre: 70kg, 170cm, 30 años -> 10*70 + 6.25*170 - 5*30 + 5 = 700 + 1062.5 - 150 + 5 = 1617.5 -> 1618 kcal/día
  const msjH = calculateMifflinStJeor({ weightKg: 70, heightCm: 170, ageYears: 30, sex: "Masculino", activityFactor: 1.0 });
  assert(msjH.calculable === true, "Debe ser calculable");
  assert(msjH.gerKcalDia === 1618, `GER hombre esperado: 1618, obtenido: ${msjH.gerKcalDia}`);

  // Mujer: 60kg, 160cm, 30 años -> 10*60 + 6.25*160 - 5*30 - 161 = 600 + 1000 - 150 - 161 = 1289 kcal/día
  const msjM = calculateMifflinStJeor({ weightKg: 60, heightCm: 160, ageYears: 30, sex: "Femenino", activityFactor: 1.2 });
  assert(msjM.calculable === true, "Debe ser calculable");
  assert(msjM.gerKcalDia === 1289, `GER mujer esperado: 1289, obtenido: ${msjM.gerKcalDia}`);
  assert(msjM.gedKcalDia === Math.round(1289 * 1.2), "GED calculado con factor 1.2");

  // Caso con datos insuficientes
  const msjFaltante = calculateMifflinStJeor({ weightKg: null, heightCm: 160, ageYears: 30 });
  assert(msjFaltante.calculable === false, "Debe detectar datos insuficientes");
  console.log("  ✅ Mifflin–St Jeor validado para hombres, mujeres y casos incompletos.");

  // TEST 10: Trazabilidad de doble vía y regla de no-sobreescritura
  console.log("\n[TEST 10] Trazabilidad y regla de no-sobreescritura...");
  // 1. Establecer actividad física validada por médico
  await updateLifestyle(testId, {
    actividadFisica: {
      tipoActividad: "Natación terapéutica",
      diasSemana: 2,
      minutosSesion: 45,
      intensidad: "Moderada"
    },
    fuente: "medico"
  });

  const pBeforeCall = getPatientById(testId);
  assert(pBeforeCall.estiloVida.actividadFisica.estadoValidacion === "validado", "Estado inicial debe ser validado por médico");

  // 2. Simular reporte telefónico posterior
  await updateLifestyle(testId, {
    actividadFisica: {
      tipoActividad: "Caminata leve en calle",
      diasSemana: 1,
      minutosSesion: 20,
      intensidad: "Ligera"
    },
    fuente: "llamada" // Reportado en llamada
  });

  const pAfterCall = getPatientById(testId);
  assert(pAfterCall.estiloVida.actividadFisica.fuente === "llamada", "La fuente debe indicar llamada");
  assert(pAfterCall.estiloVida.actividadFisica.estadoValidacion === "reportado_paciente", "Debe marcarse como reportado_paciente hasta validación médica");
  console.log("  ✅ Reporte telefónico registrado conservando procedencia y estado 'reportado_paciente'.");

  // 3. Médico valida el reporte telefónico desde la interfaz
  const pValidated = await validateReportedField(testId, {
    section: "actividadFisica",
    valorAprobado: {
      tipoActividad: "Caminata y natación combinada",
      diasSemana: 3
    },
    notas: "Revisado y ajustado en consulta de seguimiento"
  });
  assert(pValidated.estiloVida.actividadFisica.estadoValidacion === "validado", "Debe quedar como validado tras aprobación médica");
  console.log("  ✅ Validación médica completada exitosamente.");

  // TEST 11: Normalización robusta de notas (Prevención de 'patient.notas?.map is not a function')
  console.log("\n[TEST 11] Normalización defensiva de patient.notas frente a formatos anómalos...");
  // 1. null, undefined, string vacío, espacios
  assert.deepStrictEqual(normalizeNotes(null), [], "null debe normalizarse a []");
  assert.deepStrictEqual(normalizeNotes(undefined), [], "undefined debe normalizarse a []");
  assert.deepStrictEqual(normalizeNotes(""), [], "'' debe normalizarse a []");
  assert.deepStrictEqual(normalizeNotes("   "), [], "'   ' debe normalizarse a []");

  // 2. String plano heredado
  const fromString = normalizeNotes("Nota médica en formato plano");
  assert(Array.isArray(fromString) && fromString.length === 1, "String debe convertirse a array de 1 nota");
  assert.strictEqual(fromString[0].contenido, "Nota médica en formato plano", "Contenido preservado");

  // 3. Array heterogéneo (strings y objetos mezclados)
  const mixed = normalizeNotes(["Nota 1 en string", { id: "n-custom", contenido: "Nota 2 en objeto" }]);
  assert(Array.isArray(mixed) && mixed.length === 2, "Array heterogéneo debe normalizarse a 2 notas objeto");
  assert.strictEqual(mixed[0].contenido, "Nota 1 en string");
  assert.strictEqual(mixed[1].contenido, "Nota 2 en objeto");

  // 4. Objeto aislado (no array)
  const singleObj = normalizeNotes({ id: "n-solo", contenido: "Nota en objeto directo" });
  assert(Array.isArray(singleObj) && singleObj.length === 1);
  assert.strictEqual(singleObj[0].contenido, "Nota en objeto directo");

  // 5. Garantía de .map sin errores
  const sampleInputs = [null, undefined, "", "  ", "Texto", ["A", "B"], [{ id: "1" }], { contenido: "X" }];
  sampleInputs.forEach((input, i) => {
    assert.doesNotThrow(() => {
      const mapped = normalizeNotes(input).map(n => n.contenido);
      assert(Array.isArray(mapped));
    }, `El caso de entrada #${i} debe admitir .map sin lanzar TypeError`);
  });
  console.log("  ✅ Normalización de notas validada contra todos los tipos inválidos y heterogéneos.");

  // TEST 12: Preservación de notas clínicas ante actualizaciones de perfil
  console.log("\n[TEST 12] Preservación de notas clínicas durante updatePatient()...");
  const testPatientWithNotes = await createPatient({
    id: `LZ-TEST-NOTES-${Date.now().toString().slice(-4)}`,
    nombre: "Paciente Con Notas Previas",
    sexo: "Masculino",
    notaInicial: "Nota de ingreso clínico inicial"
  });
  assert(testPatientWithNotes.notas.length === 1, "Debe tener 1 nota inicial");

  // Intentar actualizar enviando notas: "" (simula el bug del formulario anterior)
  const afterEmptyNotasUpdate = await updatePatient(testPatientWithNotes.id, {
    telefono: "55 0000 1111",
    notas: "" // Payload erróneo no debe destruir notas existentes
  });
  assert(Array.isArray(afterEmptyNotasUpdate.notas), "notas debe seguir siendo un array");
  assert(afterEmptyNotasUpdate.notas.length === 1, "La nota clínica previa NO debe ser borrada ni sustituida por ''");
  assert.strictEqual(afterEmptyNotasUpdate.notas[0].contenido, "Nota de ingreso clínico inicial");

  // Actualizar con notasInternas
  const afterInternalNotesUpdate = await updatePatient(testPatientWithNotes.id, {
    notasInternas: "Comentarios administrativos sobre seguro médico"
  });
  assert.strictEqual(afterInternalNotesUpdate.notasInternas, "Comentarios administrativos sobre seguro médico");
  assert(afterInternalNotesUpdate.notas.length === 1, "La nota clínica sigue intacta en notas[]");
  console.log("  ✅ updatePatient protege el array de notas clínicas ante sobrescrituras accidentales.");

  // TEST 13: Consistencia demográfica y metabólica de Roberto Méndez Silva (LZ-0482)
  console.log("\n[TEST 13] Verificación de consistencia demográfica y clínica de Roberto Méndez Silva...");
  const robertoCheck = getPatientById("LZ-0482");
  assert(robertoCheck !== null, "Roberto debe existir");
  assert.strictEqual(robertoCheck.sexo, "Masculino", "El sexo de Roberto debe ser Masculino");

  // Antecedentes APNP deben ser masculinos
  const apnpGenerales = robertoCheck.antecedentes?.apnp?.datosGenerales || {};
  assert.strictEqual(apnpGenerales.ocupacion, "Empleado / Guardia de seguridad privada", "Ocupación corregida");
  assert.strictEqual(apnpGenerales.estadoCivil, "Casado", "Estado civil corregido");
  assert.notStrictEqual(apnpGenerales.ocupacion, "Ama de casa", "No debe tener ocupación 'Ama de casa'");
  assert.notStrictEqual(apnpGenerales.estadoCivil, "Soltera", "No debe tener estado civil 'Soltera'");

  // Evaluación antropométrica masculina
  const bmiRoberto = calculateBMI(83.2, 172, robertoCheck.sexo);
  assert.strictEqual(bmiRoberto.esTallaBaja, false, "Hombre de 1.72m no es talla baja (<1.60m)");
  assert.strictEqual(bmiRoberto.categoria, "Sobrepeso", "IMC 28.12 en hombre estándar es Sobrepeso");

  const whrRoberto = calculateWHR(98, 104, robertoCheck.sexo);
  assert.strictEqual(whrRoberto.whr, 0.94, "ICC 98 / 104 = 0.94");
  assert.strictEqual(whrRoberto.corteReferencia, 0.90, "Umbral de ICC de referencia para hombre es 0.90 (no 0.85)");
  assert.strictEqual(whrRoberto.cinturaEnRiesgo, true, "Cintura de 98 cm supera el umbral masculino de 90 cm");
  assert(whrRoberto.criterioNormativo.includes("Hombres ≥ 0.90"), "Criterio normativo debe especificar Hombres >= 0.90");
  assert(whrRoberto.criterioNormativo.includes("≥ 90 cm"), "Criterio de cintura normativo debe especificar >= 90 cm");
  assert(whrRoberto.riesgoCardiometabolico.includes("Riesgo cardiometabólico aumentado"), "Debe indicar riesgo aumentado");

  // Ecuación de Mifflin–St Jeor masculina (+5)
  const msjRoberto = calculateMifflinStJeor({
    weightKg: 83.2,
    heightCm: 172,
    ageYears: 61,
    sex: robertoCheck.sexo,
    activityFactor: 1.2
  });
  assert.strictEqual(msjRoberto.variablesUtilizadas.sexoEcuacion, "Masculino", "Debe calcularse como Masculino");
  assert(msjRoberto.formulaVisible.includes("+ 5"), "La fórmula masculina debe incluir '+ 5'");
  assert(!msjRoberto.formulaVisible.includes("− 161"), "La fórmula masculina NO debe incluir '− 161'");
  // GER esperado: 10*83.2 + 6.25*172 - 5*61 + 5 = 832 + 1075 - 305 + 5 = 1607 kcal/día
  assert.strictEqual(msjRoberto.gerKcalDia, 1607, `GER esperado 1607 kcal/día, obtenido ${msjRoberto.gerKcalDia}`);
  console.log(`  ✅ Consistencia de Roberto validada: Sexo ${robertoCheck.sexo}, GER ${msjRoberto.gerKcalDia} kcal/día (+5), Umbral ICC ${whrRoberto.corteReferencia}.`);

  // Limpieza de pacientes de prueba temporales para mantener catálogo limpio
  const finalPatients = getAllPatients().filter(p => !p.id.startsWith("LZ-TEST-") && !p.id.startsWith("LZ-DRAFT-"));
  // Escribir pacientes limpios
  const tempClean = `${PATIENTS_FILE}.clean.tmp`;
  fs.writeFileSync(tempClean, JSON.stringify(finalPatients, null, 2), "utf-8");
  fs.renameSync(tempClean, PATIENTS_FILE);

  console.log("\n=======================================================");
  console.log("🎉 TODAS LAS 13 PRUEBAS AUTOMATIZADAS PASARON CON ÉXITO");
  console.log("=======================================================");
}

runTests().catch(err => {
  console.error("❌ Fallo en suite de pruebas:", err);
  process.exit(1);
});
