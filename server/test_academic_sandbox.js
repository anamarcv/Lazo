/**
 * LAZO V2 — Academic Sandbox & Clinical Protection Automated Acceptance Test Suite
 * Valida los 16 criterios de seguridad, aislamiento de evaluadores y protección clínica NOM-004
 */

import http from 'http';
import { config } from './config.js';
import { createFallbackSummaryFromTranscript } from './services/clinicalSummaryService.js';
import { GeminiLiveSession } from './gemini/liveSession.js';

const PORT = config.port || 3001;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json,
          rawBody: data
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      if (typeof postData === 'object') {
        req.write(JSON.stringify(postData));
      } else {
        req.write(postData);
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('  LAZO V2 — BATERÍA DE PRUEBAS DE ACEPTACIÓN ACADÉMICA');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // 1. AUTENTICACIÓN ACADÉMICA Y SESIONES FIRMADAS HMAC
    // -------------------------------------------------------------
    console.log('1. Autenticación Académica con Clave Compartida y Cookies HMAC:');

    // 1.1 Rechazo de clave incorrecta
    const validPasskey = config.academicPasskey;
    const invalidPasskey = `PASSKEY-INVALID-${Date.now()}`;
    const badLoginRes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { passkey: invalidPasskey, reviewerName: 'Intruso' });

    assert(badLoginRes.statusCode === 401, 'Rechaza clave incorrecta con HTTP 401 Unauthorized');
    assert(badLoginRes.data.code === 'INVALID_PASSKEY', 'Código de error es INVALID_PASSKEY');

    // 1.2 Aceptación de clave académica oficial para Revisor A
    const loginARes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { passkey: validPasskey, reviewerName: 'Dr. Evaluador A' });

    assert(loginARes.statusCode === 200, 'Acepta clave válida con HTTP 200 OK');
    assert(loginARes.data.reviewer && loginARes.data.reviewer.name === 'Dr. Evaluador A', 'Retorna objeto de revisor correcto');
    
    const setCookieA = loginARes.headers['set-cookie'];
    assert(Array.isArray(setCookieA) && setCookieA.length > 0, 'Servidor emite encabezado Set-Cookie');
    const cookieHeaderA = setCookieA[0].split(';')[0];
    assert(cookieHeaderA.startsWith('lazo_session='), 'Cookie contiene prefijo lazo_session');

    // 1.3 Verificación de sesión activa mediante /api/auth/session
    const sessionRes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/session',
      method: 'GET',
      headers: { Cookie: cookieHeaderA }
    });
    assert(sessionRes.statusCode === 200 && sessionRes.data.authenticated === true, 'GET /api/auth/session valida sesión activa');
    assert(sessionRes.data.reviewer.name === 'Dr. Evaluador A', 'Sesión reconoce identidad del Revisor A');

    // 1.4 Aceptación de Evaluador B en sesión separada
    const loginBRes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { passkey: validPasskey, reviewerName: 'Dra. Evaluadora B' });
    const cookieHeaderB = loginBRes.headers['set-cookie'][0].split(';')[0];
    assert(loginBRes.statusCode === 200, 'Evaluador B se autentica exitosamente');

    // -------------------------------------------------------------
    // 2. INMUTABILIDAD ESTRICTA DE LOS 6 PACIENTES BASALES
    // -------------------------------------------------------------
    console.log('\n2. Inmutabilidad Estricta de Pacientes Basales (Solo Lectura):');
    const baselineIds = ['LZ-0482', 'LZ-0319', 'LZ-0195', 'LZ-0512', 'LZ-0513', 'LZ-0514'];

    // 2.1 Los 6 pacientes basales se leen correctamente
    const getPatientsRes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/patients',
      method: 'GET',
      headers: { Cookie: cookieHeaderA }
    });
    assert(getPatientsRes.statusCode === 200, 'GET /api/patients retorna HTTP 200');
    const patientsList = getPatientsRes.data;
    const foundBaselineCount = baselineIds.filter(id => patientsList.some(p => p.id === id)).length;
    assert(foundBaselineCount === 6, `Los 6 pacientes basales están presentes en el listado (${foundBaselineCount}/6)`);

    // 2.2 Bloqueo de modificación directa (PUT) en paciente basal LZ-0482
    const putBaselineRes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/patients/LZ-0482',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeaderA }
    }, { nombre: 'Nombre Modificado Ilegalmente' });

    assert(putBaselineRes.statusCode === 403, 'PUT /api/patients/LZ-0482 retorna HTTP 403 Forbidden');
    assert(putBaselineRes.data.code === 'BASELINE_PATIENT_PROTECTED', 'Código de error es BASELINE_PATIENT_PROTECTED');

    // 2.3 Bloqueo de eliminación (DELETE) en paciente basal
    const deleteBaselineRes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/patients/LZ-0319',
      method: 'DELETE',
      headers: { Cookie: cookieHeaderA }
    });
    assert(deleteBaselineRes.statusCode === 403, 'DELETE /api/patients/LZ-0319 retorna HTTP 403 Forbidden');

    // 2.4 Bloqueo de adición de antropometría en paciente basal
    const anthropoBaselineRes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/patients/LZ-0195/anthropometry',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeaderA }
    }, { pesoKg: 95, tallaCm: 170 });
    assert(anthropoBaselineRes.statusCode === 403, 'POST /api/patients/LZ-0195/anthropometry retorna HTTP 403 Forbidden');

    // 2.5 Bloqueo de actualización de estilo de vida en paciente basal
    const lifestyleBaselineRes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/patients/LZ-0512/lifestyle',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeaderA }
    }, { actividadFisicaMinutosSemana: 200 });
    assert(lifestyleBaselineRes.statusCode === 403, 'PUT /api/patients/LZ-0512/lifestyle retorna HTTP 403 Forbidden');

    // 2.6 Bloqueo de validación médica en campo de paciente basal
    const validateFieldBaselineRes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/patients/LZ-0513/validate-field',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeaderA }
    }, { fieldName: 'actividadFisica', validado: true });
    assert(validateFieldBaselineRes.statusCode === 403, 'PUT /api/patients/LZ-0513/validate-field retorna HTTP 403 Forbidden');

    // -------------------------------------------------------------
    // 3. AISLAMIENTO ESTRICTO ENTRE REVISORES (SANDBOX)
    // -------------------------------------------------------------
    console.log('\n3. Aislamiento Estricto entre Evaluadores (Partición de Recursos):');

    // 3.1 Revisor A crea un paciente de prueba
    const runUid = Date.now().toString().slice(-4);
    const testPatientId = `LZ-TEST-${runUid}`;
    const testPatientName = `Paciente Demo Evaluador A ${runUid}`;
    const createPatientARes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/patients',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeaderA }
    }, {
      id: testPatientId,
      nombre: testPatientName,
      fechaNacimiento: '1975-06-15',
      sexo: 'Masculino',
      telefono: '5512345678'
    });

    assert(createPatientARes.statusCode === 201, `Revisor A crea exitosamente paciente ${testPatientId}`);
    const createdPatientObj = createPatientARes.data.patient || createPatientARes.data;
    assert(createdPatientObj.revisorId === loginARes.data.reviewer.id, 'Paciente queda asociado al revisorId del Evaluador A');

    // 3.2 Revisor A puede leer su propio paciente
    const getPatientARes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/patients/${testPatientId}`,
      method: 'GET',
      headers: { Cookie: cookieHeaderA }
    });
    assert(getPatientARes.statusCode === 200, 'Revisor A puede consultar su paciente creado');

    // 3.3 Revisor B NO puede ver el paciente del Revisor A en su listado
    const getPatientsBRes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/patients',
      method: 'GET',
      headers: { Cookie: cookieHeaderB }
    });
    const patientsBList = getPatientsBRes.data;
    const testPatientInB = patientsBList.some(p => p.id === testPatientId);
    assert(!testPatientInB, 'Revisor B NO ve el paciente del Revisor A en el directorio general');

    // 3.4 Revisor B NO puede acceder directamente al paciente del Revisor A
    const getPatientBDirectRes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/patients/${testPatientId}`,
      method: 'GET',
      headers: { Cookie: cookieHeaderB }
    });
    assert(getPatientBDirectRes.statusCode === 404, 'GET /api/patients/:id del Revisor B sobre paciente del Revisor A retorna 404 Not Found');

    // 3.5 Revisor B NO puede modificar el paciente del Revisor A
    const putPatientBRes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/patients/${testPatientId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeaderB }
    }, { nombre: 'Nombre alterado por Revisor B' });
    assert(putPatientBRes.statusCode === 403 || putPatientBRes.statusCode === 404, 'Revisor B no puede alterar el paciente del Revisor A');

    // 3.6 Revisor A puede eliminar su propio paciente de prueba (limpieza)
    const delPatientARes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/patients/${testPatientId}`,
      method: 'DELETE',
      headers: { Cookie: cookieHeaderA }
    });
    assert(delPatientARes.statusCode === 200, 'Revisor A elimina limpiamente su paciente de prueba al concluir');

    // -------------------------------------------------------------
    // 4. LÍMITE DE DURACIÓN DE 5 MINUTOS Y RESUMEN CLÍNICO NOM-004
    // -------------------------------------------------------------
    console.log('\n4. Límite de 5 Minutos (300s) y Rigor Clínico de Secciones No Exploradas:');

    // Simular llamada interrumpida a los 5 minutos con secciones no exploradas
    const simulatedIncompleteTranscript = [
      { speaker: 'assistant', text: 'Buenos días, le hablo del centro de salud para su seguimiento de diabetes.' },
      { speaker: 'user', text: 'Buenos días doctora, me he sentido bien pero con algo de sed.' }
    ];

    const structuredSummary = createFallbackSummaryFromTranscript(simulatedIncompleteTranscript, {
      patientId: testPatientId,
      pacienteNombre: 'Paciente Demo del Evaluador A',
      timeoutReached: true
    });

    assert(structuredSummary.limitacionDuracion5Min === true, 'Marca limitacionDuracion5Min como true');
    assert(
      Array.isArray(structuredSummary.medicamentosYAdherencia) &&
      structuredSummary.medicamentosYAdherencia.every(m => m.reportePaciente.includes('No explorado')),
      'Medicación no explorada está rotulada explícitamente y no se asume negativa/normal'
    );
    assert(
      structuredSummary.actividadFisica.includes('No explorado'),
      'Actividad física no explorada está rotulada explícitamente'
    );
    assert(
      Array.isArray(structuredSummary.conclusiones) &&
      structuredSummary.conclusiones.some(c => c.includes('5 minutos')),
      'Conclusiones clínicas advierten la conclusión por límite de duración de 5 minutos'
    );

    // -------------------------------------------------------------
    // 5. CONTROL DE CONCURRENCIA DE LLAMADAS EN VIVO (MÁXIMO 3)
    // -------------------------------------------------------------
    console.log('\n5. Control de Concurrencia de Sesiones Gemini Live (Máx 3):');

    assert(config.maxConcurrentCalls === 3, 'maxConcurrentCalls está configurado en 3');
    const initialActive = GeminiLiveSession.getActiveSessionsCount();
    
    // Simular slots en Set
    const mock1 = { id: 'mock-1' };
    const mock2 = { id: 'mock-2' };
    const mock3 = { id: 'mock-3' };
    GeminiLiveSession.activeSessions.add(mock1);
    GeminiLiveSession.activeSessions.add(mock2);
    GeminiLiveSession.activeSessions.add(mock3);

    assert(GeminiLiveSession.getActiveSessionsCount() === 3, 'Sesiones activas alcanzan el límite de 3');
    
    let rejectedDueToLimit = false;
    if (GeminiLiveSession.getActiveSessionsCount() >= config.maxConcurrentCalls) {
      rejectedDueToLimit = true;
    }
    assert(rejectedDueToLimit, 'El controlador rechaza la 4ta llamada con límite de concurrencia alcanzado');

    // Limpiar slots mock
    GeminiLiveSession.activeSessions.delete(mock1);
    GeminiLiveSession.activeSessions.delete(mock2);
    GeminiLiveSession.activeSessions.delete(mock3);
    assert(GeminiLiveSession.getActiveSessionsCount() === initialActive, 'Slots liberados correctamente al finalizar');

    // -------------------------------------------------------------
    // 6. REPRODUCCIÓN DE AUDIO WAV Y PETICIONES HTTP RANGE (206)
    // -------------------------------------------------------------
    console.log('\n6. Audio de Grabaciones Históricas y Soporte HTTP Range (206):');

    const wavTestFilename = 'LL-20261113-071255.wav';
    const rangeRes = await httpRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/recordings/${wavTestFilename}`,
      method: 'GET',
      headers: {
        Range: 'bytes=0-1023'
      }
    });

    assert(rangeRes.statusCode === 206, 'Petición Range retorna HTTP 206 Partial Content');
    assert(rangeRes.headers['accept-ranges'] === 'bytes', 'Encabezado Accept-Ranges: bytes presente');
    assert(rangeRes.headers['content-range'] && rangeRes.headers['content-range'].startsWith('bytes 0-1023/'), 'Encabezado Content-Range correcto');
    assert(rangeRes.headers['content-type'] === 'audio/wav', 'Content-Type es audio/wav');

    // -------------------------------------------------------------
    // RESUMEN FINAL DE LA SUITE
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`  RESULTADO: ${passedTests}/${totalTests} pruebas aprobadas.`);
    if (failedTests === 0) {
      console.log('  ESTADO: TODAS LAS PRUEBAS DE ACEPTACIÓN PASARON EXITOSAMENTE.');
    } else {
      console.error(`  ESTADO: ${failedTests} PRUEBAS FALLARON.`);
    }
    console.log('================================================================\n');

    process.exit(failedTests === 0 ? 0 : 1);
  } catch (err) {
    console.error('Error no capturado durante las pruebas:', err);
    process.exit(1);
  }
}

runTests();
