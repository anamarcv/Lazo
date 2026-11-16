export const CURRENT_DOCTOR = {
  name: "Dra. Anamar Cordero Valle",
  cedula: "11984251",
  especialidad: "Medicina de Atención Primaria / Diabetología",
  institucion: "Unidad de Medicina Familiar & Clínica de Enfermedades Crónicas",
  rol: "Médico Tratante Responsable",
  email: "anamar.cordero@lazo-salud.mx",
  notificaciones: 3
};

export const MOCK_PATIENTS = [
  {
    id: "LZ-0482",
    nombre: "Roberto Méndez Silva",
    edad: 62,
    sexo: "Masculino",
    fechaNacimiento: "1964-05-14",
    telefono: "55 4192 8830",
    cuidador: "Rosa Méndez (Hija) - 55 4192 8831 (Autorizado)",
    medicoTratante: "Dra. Anamar Cordero Valle",
    fechaRegistro: "2026-06-12",
    fechaIngresoLazo: "2026-06-12",
    metasIndividuales: {
      ayunoMin: 80,
      ayunoMax: 130,
      postMax: 180,
      hba1cMeta: 7.0,
      presionSistolicaMeta: 130,
      presionDiastolicaMeta: 80,
      ldlMeta: 100
    },
    cambiosTratamiento: [
      {
        fecha: "2026-08-15",
        tipo: "Ajuste de dosis",
        farmaco: "Insulina Glargina",
        de: "14 UI nocturna",
        a: "18 UI nocturna",
        justificacion: "Persistencia de glucemias basales >140 mg/dL reportadas en llamadas",
        medico: "Dra. Anamar Cordero Valle"
      }
    ],
    diagnosticoPrincipal: "Diabetes Mellitus Tipo 2 (8 años de evolución)",
    diagnosticosSecundarios: ["Hipertensión Arterial Sistémica", "Dislipidemia mixta"],
    estadoSeguimiento: "Activo (2x/semana)",
    prioridadClinica: "Emergencia", // 'Emergencia' | 'Prioritaria' | 'Rutina'
    
    // Alerta de seguridad crítica
    alertaActiva: {
      tipo: "emergencia",
      titulo: "Alerta de Descompensación Aguda: Hiperglucemia con Emesis",
      estadoDerivacion: "Derivación a urgencias indicada", // 'Derivación a urgencias indicada' | 'Paciente refiere estar en urgencias' | 'Paciente refiere estar hospitalizado'
      motivo: "Glucosa autorreportada de 340 mg/dL acompañada de náusea, vómitos repetidos e imposibilidad de retener líquidos.",
      fechaHora: "Hoy, 08:42 hrs",
      accionSistema: "El sistema interrumpió el cuestionario habitual y reprodujo instrucción pregrabada de acudir de inmediato a Urgencias. Notificación prioritaria enviada.",
      confirmacionEnfermeria: "Pendiente llamada de verificación de traslado hospitalario.",
      llamadaId: "LL-20261103-01"
    },

    kpisSeguimiento: {
      adherenciaDosis: { tomadas: 26, total: 30, porcentaje: 87, detalle: "26 de 30 dosis reportadas como tomadas en los últimos 14 días" },
      glucosaEnMeta: { enMeta: 7, total: 12, porcentaje: 58, detalle: "7 de 12 lecturas capilares dentro de meta individualizada (80 - 130 mg/dL en ayuno, <180 mg/dL posprandial)" },
      bitacorasDias: { conRegistro: 6, totalDias: 7, detalle: "6 de 7 días con registro de glucemia" },
      presionDomiciliaria: { sistolica: 134, diastolica: 84, lecturas: 5, fuente: "OMRON M3 Domiciliario", estado: "Aceptable" }
    },

    metasIndividuales: {
      ayunoMin: 80,
      ayunoMax: 130,
      postMax: 180,
      hba1cMeta: 7.0
    },

    lecturasGlucosa: [
      { id: "g1", fecha: "2026-11-03", hora: "08:15", valor: 340, contexto: "ayuno", dentroMeta: false, nota: "Presentó náuseas y vómito matutino" },
      { id: "g2", fecha: "2026-11-02", hora: "21:30", valor: 260, contexto: "posprandial", dentroMeta: false, nota: "Cena familiar" },
      { id: "g3", fecha: "2026-11-02", hora: "08:10", valor: 145, contexto: "ayuno", dentroMeta: false, nota: "Sensación de boca seca" },
      { id: "g4", fecha: "2026-11-01", hora: "21:00", valor: 168, contexto: "posprandial", dentroMeta: true, nota: "" },
      { id: "g5", fecha: "2026-11-01", hora: "07:50", valor: 124, contexto: "ayuno", dentroMeta: true, nota: "Glucemia basal normal" },
      { id: "g6", fecha: "2026-10-31", hora: "21:15", valor: 172, contexto: "posprandial", dentroMeta: true, nota: "" },
      { id: "g7", fecha: "2026-10-31", hora: "08:00", valor: 118, contexto: "ayuno", dentroMeta: true, nota: "" },
      { id: "g8", fecha: "2026-10-30", hora: "21:00", valor: 195, contexto: "posprandial", dentroMeta: false, nota: "Omitió dosis de insulina vespertina" },
      { id: "g9", fecha: "2026-10-30", hora: "08:05", valor: 128, contexto: "ayuno", dentroMeta: true, nota: "" },
      { id: "g10", fecha: "2026-10-29", hora: "21:20", valor: 160, contexto: "posprandial", dentroMeta: true, nota: "" },
      { id: "g11", fecha: "2026-10-29", hora: "07:45", valor: 112, contexto: "ayuno", dentroMeta: true, nota: "" },
      { id: "g12", fecha: "2026-10-28", hora: "08:00", valor: 120, contexto: "ayuno", dentroMeta: true, nota: "" }
    ],

    sintomasReportados: {
      estadoActual: "Refirió náusea intensa y vómitos esta mañana. Mareo ortostático.",
      episodiosPrevios: "Episodio de hipoglucemia leve (62 mg/dL) hace 3 semanas.",
      alertasHistoricas: "Derivación a urgencias indicada hoy 3 Nov 2026 a las 08:42 hrs."
    },

    efectosAdversos: [
      {
        sintoma: "Diarrea leve intermitente",
        fechaInicio: "2026-09-15",
        medicamentoSospechado: "Metformina 850 mg",
        persistencia: "Ocasional tras toma matutina",
        gravedad: "Leve",
        impactoAdherencia: "Bajo (continúa tomándola con alimentos)"
      }
    ],

    barreras: [
      {
        tipo: "Olvido y rutina",
        descripcion: "Dificultad para recordar la dosis nocturna de insulina los días de guardia laboral.",
        evidencia: "Reportado en llamada del 30 Oct 2026.",
        evolucion: "Se propuso alarma en celular del cuidador.",
        estado: "en_seguimiento"
      }
    ],

    medicacion: [
      {
        id: "m1",
        nombre: "Metformina",
        claseFarmacologica: "Biguanida",
        dosisPrescrita: "850 mg",
        frecuencia: "Cada 12 horas",
        indicacion: "Control glucémico (DM2)",
        horarioPrescrito: "08:00 y 20:00 (con alimentos)",
        horarioReferido: "08:30 y 21:00",
        dosisOmitidasSemana: 1,
        motivoOmision: "Olvido por salida imprevista",
        cambiosRecientes: "Sin cambios de dosis en últimos 3 meses",
        posiblesEfectos: "Molestia gástrica leve",
        adherenciaSemanal: { lun: "tomada", mar: "tomada", mie: "tomada", jue: "omitida", vie: "tomada", sab: "tomada", dom: "tomada" }
      },
      {
        id: "m2",
        nombre: "Insulina Glargina",
        claseFarmacologica: "Insulina basal",
        dosisPrescrita: "18 UI",
        frecuencia: "Cada 24 horas",
        indicacion: "Cobertura basal DM2",
        horarioPrescrito: "22:00 hrs (al acostarse)",
        horarioReferido: "22:00 hrs",
        dosisOmitidasSemana: 1,
        motivoOmision: "Confusión por viaje",
        cambiosRecientes: "Ajuste de 16 UI a 18 UI en consulta de Septiembre",
        posiblesEfectos: "Ninguno referido",
        adherenciaSemanal: { lun: "tomada", mar: "tomada", mie: "tomada", jue: "tomada", vie: "omitida", sab: "tomada", dom: "tomada" }
      },
      {
        id: "m3",
        nombre: "Losartán",
        claseFarmacologica: "ARA-II",
        dosisPrescrita: "50 mg",
        frecuencia: "Cada 24 horas",
        indicacion: "Hipertensión Arterial / Nefroprotección",
        horarioPrescrito: "08:00 hrs",
        horarioReferido: "08:00 hrs",
        dosisOmitidasSemana: 0,
        motivoOmision: "Ninguno",
        cambiosRecientes: "Estable",
        posiblesEfectos: "Ninguno",
        adherenciaSemanal: { lun: "tomada", mar: "tomada", mie: "tomada", jue: "tomada", vie: "tomada", sab: "tomada", dom: "tomada" }
      }
    ],

    laboratorios: {
      clave: [
        { nombre: "HbA1c", valor: 7.8, unidad: "%", fecha: "2026-09-20", meta: "< 7.0%", fueraMeta: true },
        { nombre: "Creatinina", valor: 1.05, unidad: "mg/dL", fecha: "2026-09-20", meta: "0.70 - 1.20", fueraMeta: false },
        { nombre: "eGFR (CKD-EPI)", valor: 76, unidad: "mL/min/1.73m²", fecha: "2026-09-20", meta: "> 60", fueraMeta: false },
        { nombre: "uACR (Albúmina/Creatinina)", valor: 38, unidad: "mg/g", fecha: "2026-09-20", meta: "< 30 mg/g", fueraMeta: true, nota: "Albuminuria A2 moderada" }
      ],
      interpretacion: "Control glucémico subóptimo (HbA1c 7.8% vs meta 7.0%). Función renal preservada por eGFR (76 mL/min), pero se observa microalbuminuria (uACR 38 mg/g, categoría A2) que amerita optimización de titulación de IECA/ARA-II y estricto control glucémico.",
      historico: [
        { fecha: "2026-09-20", hba1c: 7.8, glucosaLab: 165, creatinina: 1.05, egfr: 76, uacr: 38, colTotal: 198, hdl: 42, ldl: 118, tri: 190 },
        { fecha: "2026-06-15", hba1c: 8.4, glucosaLab: 190, creatinina: 1.10, egfr: 74, uacr: 42, colTotal: 215, hdl: 39, ldl: 135, tri: 205 },
        { fecha: "2026-03-10", hba1c: 8.9, glucosaLab: 210, creatinina: 1.08, egfr: 75, uacr: 45, colTotal: 228, hdl: 40, ldl: 142, tri: 230 }
      ],
      proximosEstudios: [
        { estudio: "Perfil de Lípidos y Química Sanguínea", fechaSugerida: "Diciembre 2026", estado: "Pendiente de orden" },
        { estudio: "Revisión de Fondo de Ojo (Retinografía)", fechaSugerida: "Noviembre 2026", estado: "Vencido (último hace 14 meses)" }
      ]
    },

    antecedentes: {
      cronicos: [
        { condicion: "Diabetes Mellitus Tipo 2", anio: "2018", estado: "En tratamiento farmacológico oral e insulina basal" },
        { condicion: "Hipertensión Arterial Sistémica", anio: "2020", estado: "Bajo control farmacológico con ARA-II" },
        { condicion: "Dislipidemia Mixta", anio: "2021", estado: "Tratamiento intermitente con estatinas" }
      ],
      medicos: [
        { evento: "Urgencia hiperglucémica (deshidratación)", fecha: "Octubre 2024", institucion: "H.G.Z. 24", resuelto: true },
        { evento: "COVID-19 no grave", fecha: "Julio 2022", institucion: "Domiciliario", resuelto: true }
      ],
      quirurgicos: [
        { procedimiento: "Apendicectomía laparoscópica", anio: "2012" }
      ],
      familiares: [
        { parentesco: "Madre", enfermedad: "DM2 e Insuficiencia Renal Terminal (Fallecida)" },
        { parentesco: "Hermano mayor", enfermedad: "Infarto Agudo al Miocardio a los 58 años" }
      ],
      alergias: [
        { 
          sustancia: "Penicilina", 
          reaccion: "Exantema maculopapular y prurito", 
          confirmacion: "Referida por el paciente" 
        },
        { 
          sustancia: "Nueces", 
          reaccion: "Choque anafiláctico tras la ingestión de nueces.", 
          confirmacion: "Confirmada / Documentada",
          notaAdicional: "Cuenta con autoinyector de epinefrina (EpiPen®) y plan de manejo en caso de exposición accidental."
        }
      ],
      apnp: {
        datosGenerales: {
          originario: "Ciudad de México",
          originaria: "Ciudad de México",
          residencia: "Ciudad de México",
          escolaridad: "Secundaria",
          ocupacion: "Empleado / Guardia de seguridad privada",
          religion: "Católica",
          estadoCivil: "Casado",
          tipoSanguineo: "O+",
          verificacionTipoSanguineo: "Verificado en cartilla",
          zoonosis: "Niega",
          biomasa: "Niega"
        },
        habitosVida: {
          alimentacion: "3 comidas al día, predominio de comida casera",
          consumoAgua: "~1.5 L/día",
          actividadFisica: "Caminata 3 veces por semana (30 min)",
          habitosHigienicos: "Adecuados (baño diario, higiene bucal 2 veces al día)"
        },
        sustancias: {
          tabaco: "Niega consumo",
          alcohol: "Ocasional (1–2 copas/mes)",
          otrasSustancias: "Niega"
        }
      },
      estiloVida: {
        tabaquismo: "Negativo (exfumador suspendió hace 10 años)",
        alcohol: "Ocasional (social, <1 copa al mes)",
        actividadFisica: "Caminata 25 minutos, 3 días a la semana",
        alimentacion: "Refiere intento de reducción de refrescos y harinas, con recaídas de fin de semana"
      },
      tamizajes: [
        { prueba: "Exploración monofilamento de pies", fecha: "2026-06-12", resultado: "Sensibilidad conservada en ambos pies, sin callosidades ni lesiones activas" },
        { prueba: "Fondo de ojo (Retinografía)", fecha: "2025-08-10", resultado: "Retinopatía no proliferativa leve. Cita de tamizaje anual pendiente" }
      ],
      vacunacion: [
        { prueba: "Vacunación Influenza", fecha: "2025-11-04", resultado: "Aplicada temporada 2025-2026" },
        { prueba: "Vacunación Neumococo", fecha: "2023-04-18", resultado: "Dosis única aplicada" }
      ]
    },

    llamadas: [
      {
        id: "LL-20261103-01",
        fechaHora: "03 Nov 2026 · 08:42 hrs",
        direccion: "Saliente programada",
        tipo: "Seguimiento quincenal programado",
        duracion: "4 min 18 s",
        estado: "Interrumpida por seguridad",
        alertaGenerada: "Emergencia (Glucosa 340 mg/dL + Vómitos)",
        verificacionIdentidad: "Verificada exitosamente (Roberto Méndez Silva · 14/05/1964)",
        permisoGrabacion: "Aceptado",
        audioUrl: "/audio/mock_call_01.mp3",
        duracionSegundos: 258,
        resumenClinico: {
          seguridadYAlertas: {
            sintomasAlarma: "Refirió hiperglucemia extrema (340 mg/dL) acompañada de mareo, náuseas intensas y vómitos repetidos con imposibilidad de retener líquidos.",
            interrupciones: "Llamada interrumpida a los 3 min 45 s según protocolo clínico.",
            accionesRealizadas: "El sistema reprodujo instrucción automática aprobada: indicación imperativa de acudir a Urgencias médicas de inmediato. Notificación urgente a Dra. Anamar Cordero Valle vía panel.",
            evaluabilidad: "Información evaluable y confirmada por el paciente."
          },
          medicamentosYAdherencia: [
            {
              medicamento: "Metformina 850 mg",
              pauta: "1 tableta c/12h con alimentos",
              reportePaciente: "Refiere haber tomado la dosis de la mañana.",
              dosisOmitidas: "0 dosis en las últimas 24h",
              motivo: "N/A",
              barrera: null,
              efectosAdversos: "Náuseas atribuidas al cuadro actual"
            },
            {
              medicamento: "Insulina Glargina 18 UI",
              pauta: "18 UI nocturna subcutánea",
              reportePaciente: "Discrepancia: paciente refiere haber omitido la dosis de anoche.",
              dosisOmitidas: "1 dosis omitida",
              motivo: "Se sintió mareado antes de dormir y temió que le bajara más el azúcar.",
              barrera: "Temor a hipoglucemia / Falta de comprensión sobre insulina basal",
              efectosAdversos: "Ninguno referido"
            },
            {
              medicamento: "Losartán 50 mg",
              pauta: "1 tableta c/24h en ayuno",
              reportePaciente: "Refiere haber tomado la dosis habitual.",
              dosisOmitidas: "0 dosis",
              motivo: "N/A",
              barrera: null,
              efectosAdversos: "Ninguno"
            }
          ],
          bitacoraGlucosa: [
            { fecha: "03 Nov 2026", hora: "08:15", momento: "En ayunas", valor: "340 mg/dL", certeza: "Dato verificado cifra por cifra" },
            { fecha: "02 Nov 2026", hora: "21:30", momento: "2h después de cenar", valor: "260 mg/dL", certeza: "Dato verificado" },
            { fecha: "02 Nov 2026", hora: "08:10", momento: "En ayunas", valor: "145 mg/dL", certeza: "Dato verificado" }
          ],
          actividadFisica: "No reportada en esta llamada por interrupción temprana de protocolo.",
          barrerasYNecesidades: "Temor a administrarse la insulina basal en presencia de malestar general. Requiere reforzamiento educativo de sick-days (días de enfermedad).",
          informacionAdicional: "La hija (Rosa) intervino brevemente al final para confirmar que lo trasladará de inmediato a la clínica del IMSS."
        },
        transcripcionLiteral: [
          { segundo: 0, hablante: "Lazo (IA)", texto: "Hola, le habla Lazo, el sistema automatizado de seguimiento de salud de la clínica. ¿Estoy hablando con el señor Roberto Méndez?" },
          { segundo: 8, hablante: "Don Roberto", texto: "Sí, buenos días... sí, soy yo." },
          { segundo: 14, hablante: "Lazo (IA)", texto: "Para proteger su información confidencial, ¿me puede confirmar su nombre completo y su fecha de nacimiento, por favor?" },
          { segundo: 22, hablante: "Don Roberto", texto: "Roberto Méndez Silva, del catorce de mayo de 1964." },
          { segundo: 30, hablante: "Lazo (IA)", texto: "Identidad verificada. Esta es una llamada automatizada de seguimiento de Lazo. Sus respuestas y el audio se registrarán para que su médico tratante pueda revisarlos. ¿Está de acuerdo en continuar?" },
          { segundo: 41, hablante: "Don Roberto", texto: "Sí, de acuerdo, solo que hoy me siento un poco mal..." },
          { segundo: 48, hablante: "Lazo (IA)", texto: "Entendido señor Roberto. Antes de comenzar el cuestionario de rutina, ¿tiene en este momento algún problema importante de salud, como dificultad para respirar, dolor fuerte de pecho, confusión, desmayo, vómitos repetidos o sensación de azúcar muy alta o muy baja?" },
          { segundo: 68, hablante: "Don Roberto", texto: "Mire, desde la madrugada ando con náuseas muy feas, ya vomité tres veces y no tolero ni un traguito de agua. Me acabo de checar el azúcar en el glucómetro y me salió en trescientos cuarenta... 340 mg." },
          { segundo: 88, hablante: "Lazo (IA)", texto: "Señor Roberto, una cifra de 340 de azúcar acompañada de vómitos repetidos e incapacidad para retener líquidos es una señal de alarma que requiere atención médica inmediata. Por favor, acuda de inmediato al servicio de Urgencias de su clínica o solicite a un familiar que lo traslade ahora mismo. No espere a que pase el día." },
          { segundo: 112, hablante: "Don Roberto", texto: "Ay Dios... sí, aquí está mi hija Rosa conmigo, ya me está alistando para llevarnos a la clínica." },
          { segundo: 122, hablante: "Lazo (IA)", texto: "Hemos registrado la alerta prioritaria en el sistema y se ha notificado a su médica, la Dra. Anamar Cordero. Interrumpimos esta llamada para que pueda acudir sin demora al hospital. Que se recupere pronto." },
          { segundo: 135, hablante: "Don Roberto", texto: "Muchas gracias, señorita Lazo, ya vamos saliendo." }
        ]
      },
      {
        id: "LL-20261026-02",
        fechaHora: "26 Oct 2026 · 10:15 hrs",
        direccion: "Saliente programada",
        tipo: "Seguimiento de rutina",
        duracion: "6 min 45 s",
        estado: "Completada",
        alertaGenerada: "Ninguna",
        verificacionIdentidad: "Verificada exitosamente",
        permisoGrabacion: "Aceptado",
        audioUrl: "/audio/mock_call_02.mp3",
        duracionSegundos: 405,
        resumenClinico: {
          seguridadYAlertas: {
            sintomasAlarma: "No refirió síntomas de alarma (sin dolor precordial, sin disnea, sin mareo severo).",
            interrupciones: "Ninguna. Llamada completada en su totalidad.",
            accionesRealizadas: "Registro ordinario.",
            evaluabilidad: "Completa."
          },
          medicamentosYAdherencia: [
            { medicamento: "Metformina 850 mg", pauta: "1 tab c/12h", reportePaciente: "Tomada según pauta", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" },
            { medicamento: "Insulina Glargina 18 UI", pauta: "18 UI nocturna", reportePaciente: "Tomada según pauta", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" },
            { medicamento: "Losartán 50 mg", pauta: "1 tab c/24h", reportePaciente: "Tomada según pauta", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" }
          ],
          bitacoraGlucosa: [
            { fecha: "26 Oct 2026", hora: "08:00", momento: "En ayunas", valor: "122 mg/dL", certeza: "Verificado" },
            { fecha: "25 Oct 2026", hora: "21:00", momento: "Posprandial", valor: "158 mg/dL", certeza: "Verificado" }
          ],
          actividadFisica: "Caminata 25 minutos 3 días por semana.",
          barrerasYNecesidades: "Ninguna reportada en este periodo.",
          informacionAdicional: "Pregunta cuándo le toca su próxima receta de Losartán."
        },
        transcripcionLiteral: [
          { segundo: 0, hablante: "Lazo (IA)", texto: "Hola, le habla Lazo, el sistema automatizado de seguimiento de salud. ¿Estoy hablando con el señor Roberto Méndez?" },
          { segundo: 10, hablante: "Don Roberto", texto: "Sí, buenos días." },
          { segundo: 18, hablante: "Lazo (IA)", texto: "¿Ha tenido algún malestar o síntoma de alarma esta semana?" },
          { segundo: 26, hablante: "Don Roberto", texto: "No, todo tranquilo señorita, me he sentido con buen ánimo." }
        ]
      },
      {
        id: "LL-20261012-03",
        fechaHora: "12 Oct 2026 · 09:30 hrs",
        direccion: "Saliente programada",
        tipo: "Seguimiento quincenal programado",
        duracion: "5 min 10 s",
        estado: "Completada",
        alertaGenerada: "Ninguna",
        verificacionIdentidad: "Verificada exitosamente",
        permisoGrabacion: "Aceptado",
        audioUrl: "/audio/mock_call_03.mp3",
        duracionSegundos: 310,
        resumenClinico: {
          seguridadYAlertas: {
            sintomasAlarma: "Sin síntomas de alarma. Glucemias controladas.",
            interrupciones: "Ninguna",
            accionesRealizadas: "Registro",
            evaluabilidad: "Completa"
          },
          medicamentosYAdherencia: [
            { medicamento: "Metformina 850 mg", pauta: "1 tab c/12h", reportePaciente: "Tomada regular", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" },
            { medicamento: "Insulina Glargina 18 UI", pauta: "18 UI nocturna", reportePaciente: "Tomada regular", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" },
            { medicamento: "Losartán 50 mg", pauta: "1 tab c/24h", reportePaciente: "Tomada regular", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" }
          ],
          bitacoraGlucosa: [
            { fecha: "12 Oct 2026", hora: "08:00", momento: "En ayunas", valor: "128 mg/dL", certeza: "Verificado" },
            { fecha: "11 Oct 2026", hora: "21:15", momento: "Posprandial", valor: "164 mg/dL", certeza: "Verificado" }
          ],
          actividadFisica: "Caminata 20 min en parque cercano.",
          barrerasYNecesidades: "Sin dificultades para surtimiento de medicamento.",
          informacionAdicional: "Refiere apego a reducción de refrescos."
        },
        transcripcionLiteral: [
          { segundo: 0, hablante: "Lazo (IA)", texto: "Buenos días señor Roberto, le llama Lazo para su revisión quincenal..." },
          { segundo: 12, hablante: "Don Roberto", texto: "Hola señorita, todo en orden por acá." }
        ]
      },
      {
        id: "LL-20260928-04",
        fechaHora: "28 Sep 2026 · 10:00 hrs",
        direccion: "Saliente programada",
        tipo: "Seguimiento quincenal programado",
        duracion: "4 min 50 s",
        estado: "Completada",
        alertaGenerada: "Ninguna",
        verificacionIdentidad: "Verificada exitosamente",
        permisoGrabacion: "Aceptado",
        audioUrl: "/audio/mock_call_04.mp3",
        duracionSegundos: 290,
        resumenClinico: {
          seguridadYAlertas: {
            sintomasAlarma: "Sin datos de alarma.",
            interrupciones: "Ninguna",
            accionesRealizadas: "Registro",
            evaluabilidad: "Completa"
          },
          medicamentosYAdherencia: [
            { medicamento: "Metformina 850 mg", pauta: "1 tab c/12h", reportePaciente: "Tomada", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" },
            { medicamento: "Insulina Glargina 18 UI", pauta: "18 UI nocturna", reportePaciente: "Tomada", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" },
            { medicamento: "Losartán 50 mg", pauta: "1 tab c/24h", reportePaciente: "Tomada", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" }
          ],
          bitacoraGlucosa: [
            { fecha: "28 Sep 2026", hora: "08:05", momento: "En ayunas", valor: "135 mg/dL", certeza: "Verificado" }
          ],
          actividadFisica: "Caminata ligera.",
          barrerasYNecesidades: "Ninguna.",
          informacionAdicional: "Agradece la llamada puntual."
        },
        transcripcionLiteral: [
          { segundo: 0, hablante: "Lazo (IA)", texto: "Hola Don Roberto, le habla Lazo de la clínica..." }
        ]
      },
      {
        id: "LL-20260914-05",
        fechaHora: "14 Sep 2026 · 09:15 hrs",
        direccion: "Saliente programada",
        tipo: "Seguimiento quincenal programado",
        duracion: "0 s",
        estado: "Sin respuesta",
        alertaGenerada: "Ninguna",
        verificacionIdentidad: "No iniciada",
        permisoGrabacion: "N/A",
        audioUrl: null,
        duracionSegundos: 0,
        resumenClinico: null,
        transcripcionLiteral: []
      },
      {
        id: "LL-20260914-06",
        fechaHora: "14 Sep 2026 · 11:30 hrs",
        direccion: "Saliente programada (Reintento)",
        tipo: "Reintento de seguimiento quincenal",
        duracion: "5 min 04 s",
        estado: "Completada",
        alertaGenerada: "Ninguna",
        verificacionIdentidad: "Verificada exitosamente",
        permisoGrabacion: "Aceptado",
        audioUrl: "/audio/mock_call_05.mp3",
        duracionSegundos: 304,
        resumenClinico: {
          seguridadYAlertas: {
            sintomasAlarma: "Refirió que no contestó la llamada matutina por encontrarse en el banco.",
            interrupciones: "Ninguna",
            accionesRealizadas: "Registro",
            evaluabilidad: "Completa"
          },
          medicamentosYAdherencia: [
            { medicamento: "Metformina 850 mg", pauta: "1 tab c/12h", reportePaciente: "Tomada", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" },
            { medicamento: "Insulina Glargina 18 UI", pauta: "18 UI nocturna", reportePaciente: "Tomada", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" },
            { medicamento: "Losartán 50 mg", pauta: "1 tab c/24h", reportePaciente: "Tomada", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" }
          ],
          bitacoraGlucosa: [
            { fecha: "14 Sep 2026", hora: "08:10", momento: "En ayunas", valor: "131 mg/dL", certeza: "Verificado" }
          ],
          actividadFisica: "Actividad cotidiana normal.",
          barrerasYNecesidades: "Ninguna.",
          informacionAdicional: "Reintento exitoso según protocolo."
        },
        transcripcionLiteral: [
          { segundo: 0, hablante: "Lazo (IA)", texto: "Hola de nuevo Don Roberto, le habla Lazo en llamada de reintento..." },
          { segundo: 8, hablante: "Don Roberto", texto: "Hola, disculpe que hace rato andaba en la fila del banco y no pude contestar." }
        ]
      }
    ],
    notas: [
      {
        id: "not-01",
        tipo: "Nota de seguimiento",
        fechaHora: "03 Nov 2026 · 09:05 hrs",
        autor: "Dra. Anamar Cordero Valle",
        vinculadaLlamada: "LL-20261103-01",
        contenido: "Se revisa reporte urgente generado por Lazo a las 08:42 hrs. Paciente Roberto Méndez Silva con hiperglucemia de 340 mg/dL y cuadro emético incoercible. Se confirma que el sistema emitió indicación protocolizada de acudir a Urgencias de inmediato. Se coordina con Trabajo Social y enfermería de guardia para monitorear ingreso a Urgencias del H.G.Z. No realizar ajustes remotos de insulina hasta evaluar cetonuria/gasometría.",
        estado: "Firmada"
      },
      {
        id: "not-02",
        tipo: "Consulta médica",
        fechaHora: "20 Sep 2026 · 11:30 hrs",
        autor: "Dra. Anamar Cordero Valle",
        vinculadaLlamada: null,
        contenido: "Consulta trimestral presencial. Se revisan laboratorios: HbA1c 7.8%, uACR 38 mg/g. Se titula Insulina Glargina a 18 UI subcutáneas nocturnas. Se insiste en técnica de aplicación y rotación de sitios abdominales. Se solicitan laboratorios de control para Diciembre 2026.",
        estado: "Firmada"
      }
    ]
  },

  {
    id: "LZ-0319",
    nombre: "Elena Garza Villarreal",
    edad: 58,
    sexo: "Femenino",
    fechaNacimiento: "1968-09-22",
    telefono: "55 3302 9184",
    cuidador: "Carlos Garza (Esposo)",
    medicoTratante: "Dra. Anamar Cordero Valle",
    fechaRegistro: "2026-04-18",
    fechaIngresoLazo: "2026-04-10",
    metasIndividuales: {
      ayunoMin: 70,
      ayunoMax: 130,
      postMax: 180,
      hba1cMeta: 7.0,
      presionSistolicaMeta: 130,
      presionDiastolicaMeta: 80,
      ldlMeta: 100
    },
    cambiosTratamiento: [
      {
        fecha: "2026-06-02",
        tipo: "Inicio de tratamiento",
        farmaco: "Metformina 850 mg",
        de: "Manejo no farmacológico",
        a: "1 tableta cada 12 horas",
        justificacion: "Falla de control con estilo de vida en consulta trimestral",
        medico: "Dra. Anamar Cordero Valle"
      }
    ],
    diagnosticoPrincipal: "Diabetes Mellitus Tipo 2 (4 años de evolución)",
    diagnosticosSecundarios: ["Dislipidemia"],
    estadoSeguimiento: "Activo (1x/semana)",
    prioridadClinica: "Prioritaria", // 'Emergencia' | 'Prioritaria' | 'Rutina'
    
    alertaActiva: {
      tipo: "prioritaria",
      titulo: "Valoración Prioritaria: Cambio Visual No Súbito + Barrera Económica",
      estadoDerivacion: null,
      motivo: "Paciente refiere visión borrosa progresiva de 3 semanas de evolución y falta de recursos para adquirir tiras reactivas de glucosa.",
      fechaHora: "Ayer, 16:20 hrs",
      accionSistema: "Se generó ticket de valoración prioritaria. Se sugiere agendar cita anticipada para revisión clínica y canalización con Trabajo Social.",
      confirmacionEnfermeria: "Llamada de enfermería programada para hoy antes de las 18:00 hrs.",
      llamadaId: "LL-20261102-04"
    },

    kpisSeguimiento: {
      adherenciaDosis: { tomadas: 23, total: 28, porcentaje: 82, detalle: "23 de 28 dosis reportadas en últimos 14 días" },
      glucosaEnMeta: { enMeta: 5, total: 8, porcentaje: 63, detalle: "5 de 8 mediciones disponibles en meta (80 - 130 mg/dL)" },
      bitacorasDias: { conRegistro: 4, totalDias: 7, detalle: "4 de 7 días (escasez de tiras reactivas)" },
      presionDomiciliaria: { sistolica: 122, diastolica: 78, lecturas: 3, fuente: "Baumanómetro digital", estado: "Óptima" }
    },

    metasIndividuales: { ayunoMin: 80, ayunoMax: 130, postMax: 180, hba1cMeta: 7.0 },
    lecturasGlucosa: [
      { id: "eg1", fecha: "2026-11-02", hora: "08:00", valor: 148, contexto: "ayuno", dentroMeta: false, nota: "Tiras escasas" },
      { id: "eg2", fecha: "2026-11-01", hora: "08:15", valor: 138, contexto: "ayuno", dentroMeta: false, nota: "" },
      { id: "eg3", fecha: "2026-10-30", hora: "21:00", valor: 165, contexto: "posprandial", dentroMeta: true, nota: "" },
      { id: "eg4", fecha: "2026-10-29", hora: "08:00", valor: 120, contexto: "ayuno", dentroMeta: true, nota: "" }
    ],

    sintomasReportados: {
      estadoActual: "Visión borrosa progresiva al leer o ver televisión de 3 semanas de inicio.",
      episodiosPrevios: "Parestesias ocasionales en dedos de pies.",
      alertasHistoricas: "Ninguna urgencia previa."
    },

    efectosAdversos: [],
    barreras: [
      {
        tipo: "Costo económico",
        descripcion: "No cuenta con presupuesto para comprar el frasco de 50 tiras reactivas del glucómetro.",
        evidencia: "Autorreportado en llamada 2 Nov 2026.",
        evolucion: "Requiere apoyo por programa de insumos de la clínica.",
        estado: "activa"
      }
    ],

    medicacion: [
      {
        id: "em1",
        nombre: "Metformina",
        claseFarmacologica: "Biguanida",
        dosisPrescrita: "850 mg",
        frecuencia: "Cada 12 horas",
        indicacion: "DM2",
        horarioPrescrito: "08:00 y 20:00",
        horarioReferido: "08:00 y 20:00",
        dosisOmitidasSemana: 2,
        motivoOmision: "Olvido por rutina familiar",
        cambiosRecientes: "Sin cambios",
        posiblesEfectos: "Ninguno",
        adherenciaSemanal: { lun: "tomada", mar: "tomada", mie: "omitida", jue: "tomada", vie: "tomada", sab: "omitida", dom: "tomada" }
      }
    ],

    laboratorios: {
      clave: [
        { nombre: "HbA1c", valor: 7.2, unidad: "%", fecha: "2026-08-14", meta: "< 7.0%", fueraMeta: true },
        { nombre: "Creatinina", valor: 0.82, unidad: "mg/dL", fecha: "2026-08-14", meta: "0.50 - 1.00", fueraMeta: false },
        { nombre: "eGFR", valor: 88, unidad: "mL/min/1.73m²", fecha: "2026-08-14", meta: "> 60", fueraMeta: false },
        { nombre: "uACR", valor: 18, unidad: "mg/g", fecha: "2026-08-14", meta: "< 30 mg/g", fueraMeta: false }
      ],
      interpretacion: "Control glucémico cercano a meta (7.2%). Función renal normal sin proteinuria. Priorizar valoración oftalmológica por cambios visuales referidos.",
      historico: [
        { fecha: "2026-08-14", hba1c: 7.2, glucosaLab: 134, creatinina: 0.82, egfr: 88, uacr: 18, colTotal: 185, hdl: 48, ldl: 105, tri: 160 }
      ],
      proximosEstudios: [
        { estudio: "Fondo de Ojo con Oftalmología", fechaSugerida: "Noviembre 2026", estado: "Sugerido prioritario" }
      ]
    },

    antecedentes: {
      cronicos: [{ condicion: "DM2", anio: "2022", estado: "Tratamiento oral" }],
      medicos: [],
      quirurgicos: [{ procedimiento: "Cesárea", anio: "1994" }],
      familiares: [{ parentesco: "Padre", enfermedad: "DM2 y cardiopatía isquémica" }],
      alergias: [{ sustancia: "Sulfamidas", reaccion: "Urticaria cutánea", confirmacion: "Clínica" }],
      estiloVida: { tabaquismo: "Nunca", alcohol: "No consume", actividadFisica: "Hogar, sedentaria", alimentacion: "Mixta" },
      tamizajes: [{ prueba: "Monofilamento", fecha: "2026-04-18", resultado: "Sensibilidad normal" }]
    },

    llamadas: [
      {
        id: "LL-20261102-04",
        fechaHora: "02 Nov 2026 · 16:20 hrs",
        direccion: "Saliente programada",
        tipo: "Seguimiento semanal programado",
        duracion: "5 min 30 s",
        estado: "Completada",
        alertaGenerada: "Prioritaria (Visión borrosa + Tiras escasas)",
        verificacionIdentidad: "Verificada exitosamente",
        permisoGrabacion: "Aceptado",
        duracionSegundos: 330,
        resumenClinico: {
          seguridadYAlertas: {
            sintomasAlarma: "Refirió visión borrosa gradual de 3 semanas, sin dolor ni pérdida súbita.",
            interrupciones: "Ninguna",
            accionesRealizadas: "Generación de alerta prioritaria para valoración oftalmológica.",
            evaluabilidad: "Completa"
          },
          medicamentosYAdherencia: [
            { medicamento: "Metformina 850 mg", pauta: "1 tab c/12h", reportePaciente: "Omitió 2 tomas", dosisOmitidas: "2", motivo: "Olvido", barrera: "Costo de transporte para surtimiento", efectosAdversos: "Ninguno" }
          ],
          bitacoraGlucosa: [{ fecha: "02 Nov 2026", hora: "08:00", momento: "En ayunas", valor: "148 mg/dL", certeza: "Verificado" }],
          actividadFisica: "Sedentaria en la última semana por fatiga visual.",
          barrerasYNecesidades: "Dificultad económica para comprar tiras reactivas de automonitoreo.",
          informacionAdicional: "Pide que la doctora le autorice una receta de tiras si es posible."
        },
        transcripcionLiteral: [
          { segundo: 0, hablante: "Lazo (IA)", texto: "Buenas tardes, señora Elena. Le habla Lazo de la clínica..." },
          { segundo: 10, hablante: "Doña Elena", texto: "Buenas tardes señorita, aquí ando un poco preocupada con la vista..." }
        ]
      },
      {
        id: "LL-20261026-01",
        fechaHora: "26 Oct 2026 · 16:05 hrs",
        direccion: "Saliente programada",
        tipo: "Seguimiento semanal programado",
        duracion: "4 min 50 s",
        estado: "Completada",
        alertaGenerada: "Ninguna",
        verificacionIdentidad: "Verificada exitosamente",
        permisoGrabacion: "Aceptado",
        duracionSegundos: 290,
        resumenClinico: {
          seguridadYAlertas: { sintomasAlarma: "Sin dolor de cabeza ni mareos.", interrupciones: "Ninguna", accionesRealizadas: "Registro", evaluabilidad: "Completa" },
          medicamentosYAdherencia: [{ medicamento: "Metformina 850 mg", pauta: "1 tab c/12h", reportePaciente: "Tomada según indicación", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" }],
          bitacoraGlucosa: [{ fecha: "26 Oct 2026", hora: "08:00", momento: "En ayunas", valor: "138 mg/dL", certeza: "Verificado" }],
          actividadFisica: "Hogar, sedentaria.",
          barrerasYNecesidades: "Reporta que le quedan pocas tiras de glucosa.",
          informacionAdicional: "Seguimiento estable."
        },
        transcripcionLiteral: [
          { segundo: 0, hablante: "Lazo (IA)", texto: "Buenas tardes, señora Elena..." }
        ]
      },
      {
        id: "LL-20261019-02",
        fechaHora: "19 Oct 2026 · 16:15 hrs",
        direccion: "Saliente programada",
        tipo: "Seguimiento semanal programado",
        duracion: "0 s",
        estado: "Sin respuesta",
        alertaGenerada: "Ninguna",
        verificacionIdentidad: "No iniciada",
        permisoGrabacion: "N/A",
        duracionSegundos: 0,
        resumenClinico: null,
        transcripcionLiteral: []
      },
      {
        id: "LL-20261019-03",
        fechaHora: "19 Oct 2026 · 17:30 hrs",
        direccion: "Saliente programada (Reintento)",
        tipo: "Reintento de llamada semanal",
        duracion: "5 min 10 s",
        estado: "Completada",
        alertaGenerada: "Ninguna",
        verificacionIdentidad: "Verificada exitosamente",
        permisoGrabacion: "Aceptado",
        duracionSegundos: 310,
        resumenClinico: {
          seguridadYAlertas: { sintomasAlarma: "Sin síntomas agudos.", interrupciones: "Ninguna", accionesRealizadas: "Registro", evaluabilidad: "Completa" },
          medicamentosYAdherencia: [{ medicamento: "Metformina 850 mg", pauta: "1 tab c/12h", reportePaciente: "Tomada", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" }],
          bitacoraGlucosa: [{ fecha: "19 Oct 2026", hora: "08:15", momento: "En ayunas", valor: "135 mg/dL", certeza: "Verificado" }],
          actividadFisica: "Caminata al mercado.",
          barrerasYNecesidades: "Ninguna.",
          informacionAdicional: "Reintento completado con éxito."
        },
        transcripcionLiteral: [
          { segundo: 0, hablante: "Lazo (IA)", texto: "Buenas tardes señora Elena en llamada de reintento..." }
        ]
      }
    ],
    notas: [
      {
        id: "not-03",
        tipo: "Nota de seguimiento",
        fechaHora: "02 Nov 2026 · 17:00 hrs",
        autor: "Dra. Anamar Cordero Valle",
        vinculadaLlamada: "LL-20261102-04",
        contenido: "Alerta prioritaria revisada. Se aprueba pase a tamizaje de fondo de ojo y se turna caso a Trabajo Social para entrega de tiras reactivas institucionales.",
        estado: "Firmada"
      }
    ]
  },

  {
    id: "LZ-0195",
    nombre: "Carlos Salinas Morales",
    edad: 66,
    sexo: "Masculino",
    fechaNacimiento: "1960-03-08",
    telefono: "55 8812 4491",
    cuidador: "No registrado",
    medicoTratante: "Dra. Anamar Cordero Valle",
    fechaRegistro: "2025-11-10",
    fechaIngresoLazo: "2025-11-10",
    metasIndividuales: {
      ayunoMin: 90,
      ayunoMax: 140,
      postMax: 190,
      hba1cMeta: 7.5,
      presionSistolicaMeta: 135,
      presionDiastolicaMeta: 85,
      ldlMeta: 70
    },
    cambiosTratamiento: [
      {
        fecha: "2026-03-12",
        tipo: "Intensificación",
        farmaco: "Metformina + Glibenclamida 500/5 mg",
        de: "Metformina 850 mg monoterapia",
        a: "Combinación oral 1 tab c/12h",
        justificacion: "Descontrol glucémico sostenido (HbA1c 8.6%)",
        medico: "Dra. Anamar Cordero Valle"
      }
    ],
    recordatoriosContacto: [
      {
        id: "REC-0195-01",
        problema: "Problema recurrente de contacto telefónico (3 intentos fallidos consecutivos)",
        incidencias: 3,
        fechaGeneracion: "03 Nov 2026",
        estado: "Pendiente",
        causa: "Sin respuesta tras 3 timbres y buzón de voz",
        accionSugerida: "Revisar número telefónico alterno y definir ventana horaria idónea en próxima consulta presencial.",
        observacion: "Recordatorio automático generado por protocolo de contactabilidad (umbral ≥ 2 incidencias)."
      }
    ],
    diagnosticoPrincipal: "Diabetes Mellitus Tipo 2 (12 años de evolución)",
    diagnosticosSecundarios: ["Cardiopatía isquémica crónica"],
    estadoSeguimiento: "Contacto pendiente (2 llamadas sin respuesta)",
    prioridadClinica: "Seguimiento de contacto", // 'Emergencia' | 'Prioritaria' | 'Rutina' | 'Seguimiento de contacto'
    
    alertaActiva: {
      tipo: "contacto",
      titulo: "Seguimiento de Contacto: 2 Intentos Fallidos con Alerta Previa",
      estadoDerivacion: null,
      motivo: "Paciente con antecedente de glucemia de 265 mg/dL hace 4 días; no contestó llamada programada de ayer ni intento de recontacto de esta mañana.",
      fechaHora: "Hoy, 11:10 hrs (Segundo intento)",
      accionSistema: "El sistema no clasifica la falta de respuesta como emergencia médica. Turnado a enfermería para llamada manual o búsqueda activa por promotor.",
      confirmacionEnfermeria: "Pendiente intento de llamada manual por enfermería.",
      llamadaId: "LL-20261103-09"
    },

    kpisSeguimiento: {
      adherenciaDosis: { tomadas: 20, total: 28, porcentaje: 71, detalle: "Información parcial por llamadas no completadas" },
      glucosaEnMeta: { enMeta: 3, total: 6, porcentaje: 50, detalle: "3 de 6 lecturas previas en meta" },
      bitacorasDias: { conRegistro: 3, totalDias: 7, detalle: "3 de 7 días" },
      presionDomiciliaria: { sistolica: 142, diastolica: 90, lecturas: 2, fuente: "Desconocida", estado: "Elevada" }
    },

    metasIndividuales: { ayunoMin: 90, ayunoMax: 140, postMax: 190, hba1cMeta: 7.5 },
    lecturasGlucosa: [
      { id: "cg1", fecha: "2026-10-30", hora: "08:30", valor: 265, contexto: "ayuno", dentroMeta: false, nota: "Alerta previa" }
    ],

    sintomasReportados: { estadoActual: "Sin datos en últimas 48 hrs por falta de contacto.", episodiosPrevios: "Picos de glucosa >250 mg/dL.", alertasHistoricas: "" },
    efectosAdversos: [],
    barreras: [{ tipo: "Abasto", descripcion: "Refirió en consulta anterior que no le surtieron la atorvastatina.", estado: "activa" }],
    medicacion: [
      {
        id: "cm1",
        nombre: "Metformina + Glibenclamida",
        claseFarmacologica: "Biguanida + Sulfonilurea",
        dosisPrescrita: "500/5 mg",
        frecuencia: "Cada 12 horas",
        indicacion: "DM2",
        horarioPrescrito: "08:00 y 20:00",
        horarioReferido: "08:00 y 20:00",
        dosisOmitidasSemana: 1,
        motivoOmision: "Olvido",
        cambiosRecientes: "Estable",
        posiblesEfectos: "Ninguno",
        adherenciaSemanal: { lun: "tomada", mar: "tomada", mie: "omitida", jue: "tomada", vie: "sin_dato", sab: "sin_dato", dom: "sin_dato" }
      }
    ],

    laboratorios: {
      clave: [
        { nombre: "HbA1c", valor: 8.6, unidad: "%", fecha: "2026-07-22", meta: "< 7.5%", fueraMeta: true },
        { nombre: "Creatinina", valor: 1.15, unidad: "mg/dL", fecha: "2026-07-22", meta: "0.7 - 1.3", fueraMeta: false },
        { nombre: "eGFR", valor: 68, unidad: "mL/min/1.73m²", fecha: "2026-07-22", meta: "> 60", fueraMeta: false },
        { nombre: "uACR", valor: 24, unidad: "mg/g", fecha: "2026-07-22", meta: "< 30 mg/g", fueraMeta: false }
      ],
      interpretacion: "HbA1c persistentemente fuera de meta. Urge retomar contacto y evaluar posible intensificación de tratamiento.",
      historico: [{ fecha: "2026-07-22", hba1c: 8.6, glucosaLab: 182, creatinina: 1.15, egfr: 68, uacr: 24, colTotal: 210, hdl: 36, ldl: 140, tri: 220 }],
      proximosEstudios: []
    },

    antecedentes: {
      cronicos: [{ condicion: "DM2", anio: "2014", estado: "Tratamiento combinado" }],
      medicos: [{ evento: "Angina estable", anio: "2021" }],
      quirurgicos: [],
      familiares: [],
      alergias: [],
      estiloVida: { tabaquismo: "Exfumador", alcohol: "No", actividadFisica: "Sedentario", alimentacion: "Sin apego" },
      tamizajes: []
    },

    llamadas: [
      {
        id: "LL-20261103-09",
        fechaHora: "03 Nov 2026 · 11:10 hrs",
        direccion: "Saliente programada (Reintento)",
        tipo: "Seguimiento de contacto",
        duracion: "0 s",
        estado: "Sin respuesta",
        alertaGenerada: "Incidencia de contacto",
        verificacionIdentidad: "No iniciada",
        permisoGrabacion: "N/A",
        duracionSegundos: 0,
        resumenClinico: null,
        transcripcionLiteral: []
      },
      {
        id: "LL-20261102-08",
        fechaHora: "02 Nov 2026 · 10:30 hrs",
        direccion: "Saliente programada",
        tipo: "Seguimiento quincenal",
        duracion: "0 s",
        estado: "Sin respuesta",
        alertaGenerada: "Incidencia de contacto",
        verificacionIdentidad: "No iniciada",
        permisoGrabacion: "N/A",
        duracionSegundos: 0,
        resumenClinico: null,
        transcripcionLiteral: []
      },
      {
        id: "LL-20261025-05",
        fechaHora: "25 Oct 2026 · 14:00 hrs",
        direccion: "Saliente programada",
        tipo: "Seguimiento quincenal",
        duracion: "12 s",
        estado: "Fallida por problema técnico",
        alertaGenerada: "Incidencia técnica",
        verificacionIdentidad: "Iniciada",
        permisoGrabacion: "N/A",
        duracionSegundos: 12,
        resumenClinico: null,
        transcripcionLiteral: [
          { segundo: 0, hablante: "Lazo (IA)", texto: "Hola, le habla Lazo..." },
          { segundo: 6, hablante: "Red Móvil", texto: "[Tono de corte de llamada / portadora sin señal]" }
        ]
      },
      {
        id: "LL-20261018-03",
        fechaHora: "18 Oct 2026 · 10:15 hrs",
        direccion: "Saliente programada",
        tipo: "Seguimiento quincenal programado",
        duracion: "4 min 15 s",
        estado: "Completada",
        alertaGenerada: "Ninguna",
        verificacionIdentidad: "Verificada exitosamente",
        permisoGrabacion: "Aceptado",
        duracionSegundos: 255,
        resumenClinico: {
          seguridadYAlertas: { sintomasAlarma: "Refirió boca seca matutina ocasional.", interrupciones: "Ninguna", accionesRealizadas: "Registro", evaluabilidad: "Completa" },
          medicamentosYAdherencia: [{ medicamento: "Metformina + Glibenclamida 500/5 mg", pauta: "1 tab c/12h", reportePaciente: "Tomada", dosisOmitidas: "1", motivo: "Olvido", barrera: "Desabasto de atorvastatina", efectosAdversos: "Ninguno" }],
          bitacoraGlucosa: [{ fecha: "18 Oct 2026", hora: "08:30", momento: "En ayunas", valor: "185 mg/dL", certeza: "Verificado" }],
          actividadFisica: "Sedentario.",
          barrerasYNecesidades: "Falta de surtimiento de estatinas en clínica.",
          informacionAdicional: "Comenta que sale a trabajar temprano y se le complica responder."
        },
        transcripcionLiteral: [
          { segundo: 0, hablante: "Lazo (IA)", texto: "Buenos días señor Carlos Salinas..." }
        ]
      }
    ],
    notas: []
  },

  {
    id: "LZ-0512",
    nombre: "Martha Sánchez Treviño",
    edad: 54,
    sexo: "Femenino",
    fechaNacimiento: "1972-11-30",
    telefono: "55 2109 7733",
    cuidador: "No requiere",
    medicoTratante: "Dra. Anamar Cordero Valle",
    fechaRegistro: "2026-02-10",
    fechaIngresoLazo: "2026-02-10",
    metasIndividuales: {
      ayunoMin: 70,
      ayunoMax: 120,
      postMax: 160,
      hba1cMeta: 6.5,
      presionSistolicaMeta: 120,
      presionDiastolicaMeta: 80,
      ldlMeta: 100
    },
    cambiosTratamiento: [
      {
        fecha: "2026-02-10",
        tipo: "Inicio monoterapia",
        farmaco: "Metformina 500 mg",
        de: "Diagnóstico inicial",
        a: "1 tableta cada 12 horas",
        justificacion: "Inicio de farmacoterapia en DM2 temprana",
        medico: "Dra. Anamar Cordero Valle"
      }
    ],
    diagnosticoPrincipal: "Diabetes Mellitus Tipo 2 (Diagnóstico reciente)",
    diagnosticosSecundarios: [],
    estadoSeguimiento: "Activo (1x/quincena)",
    prioridadClinica: "Rutina", // 'Emergencia' | 'Prioritaria' | 'Rutina'
    
    alertaActiva: null,

    kpisSeguimiento: {
      adherenciaDosis: { tomadas: 30, total: 30, porcentaje: 100, detalle: "30 de 30 dosis reportadas tomadas en 15 días" },
      glucosaEnMeta: { enMeta: 11, total: 12, porcentaje: 92, detalle: "11 de 12 mediciones en meta individualizada" },
      bitacorasDias: { conRegistro: 7, totalDias: 7, detalle: "7 de 7 días con registro" },
      presionDomiciliaria: { sistolica: 118, diastolica: 76, lecturas: 4, fuente: "Domiciliario", estado: "Óptima" }
    },

    metasIndividuales: { ayunoMin: 70, ayunoMax: 120, postMax: 160, hba1cMeta: 6.5 },
    lecturasGlucosa: [
      { id: "mg1", fecha: "2026-11-03", hora: "07:30", valor: 104, contexto: "ayuno", dentroMeta: true, nota: "" },
      { id: "mg2", fecha: "2026-11-02", hora: "21:00", valor: 132, contexto: "posprandial", dentroMeta: true, nota: "" },
      { id: "mg3", fecha: "2026-11-02", hora: "07:45", valor: 98, contexto: "ayuno", dentroMeta: true, nota: "" }
    ],

    sintomasReportados: { estadoActual: "Asintomática. Excelente ánimo.", episodiosPrevios: "Ninguno.", alertasHistoricas: "Ninguna." },
    efectosAdversos: [],
    barreras: [],
    medicacion: [
      {
        id: "mm1",
        nombre: "Metformina",
        claseFarmacologica: "Biguanida",
        dosisPrescrita: "500 mg",
        frecuencia: "Cada 12 horas",
        indicacion: "DM2 reciente",
        horarioPrescrito: "08:00 y 20:00",
        horarioReferido: "08:00 y 20:00",
        dosisOmitidasSemana: 0,
        motivoOmision: "Ninguno",
        cambiosRecientes: "Estable",
        posiblesEfectos: "Ninguno",
        adherenciaSemanal: { lun: "tomada", mar: "tomada", mie: "tomada", jue: "tomada", vie: "tomada", sab: "tomada", dom: "tomada" }
      }
    ],

    laboratorios: {
      clave: [
        { nombre: "HbA1c", valor: 6.4, unidad: "%", fecha: "2026-09-10", meta: "< 6.5%", fueraMeta: false },
        { nombre: "Creatinina", valor: 0.74, unidad: "mg/dL", fecha: "2026-09-10", meta: "0.5 - 1.0", fueraMeta: false },
        { nombre: "eGFR", valor: 94, unidad: "mL/min/1.73m²", fecha: "2026-09-10", meta: "> 60", fueraMeta: false },
        { nombre: "uACR", valor: 12, unidad: "mg/g", fecha: "2026-09-10", meta: "< 30 mg/g", fueraMeta: false }
      ],
      interpretacion: "Excelente control glucémico y metabólico en monoterapia. Plan: mantener pauta y valorar espaciar llamadas a periodicidad quincenal.",
      historico: [{ fecha: "2026-09-10", hba1c: 6.4, glucosaLab: 102, creatinina: 0.74, egfr: 94, uacr: 12, colTotal: 170, hdl: 52, ldl: 98, tri: 140 }],
      proximosEstudios: []
    },

    antecedentes: {
      cronicos: [{ condicion: "DM2", anio: "2026", estado: "Monoterapia oral" }],
      medicos: [],
      quirurgicos: [],
      familiares: [],
      alergias: [],
      estiloVida: { tabaquismo: "No", alcohol: "No", actividadFisica: "Zumba 45 min 4 días/semana", alimentacion: "Plan nutricional activo" },
      tamizajes: []
    },

    llamadas: [
      {
        id: "LL-20261028-08",
        fechaHora: "28 Oct 2026 · 09:00 hrs",
        direccion: "Saliente programada",
        tipo: "Seguimiento de rutina (Control óptimo)",
        duracion: "5 min 10 s",
        estado: "Completada",
        alertaGenerada: "Ninguna",
        verificacionIdentidad: "Verificada exitosamente",
        permisoGrabacion: "Aceptado",
        duracionSegundos: 310,
        resumenClinico: {
          seguridadYAlertas: { sintomasAlarma: "Ninguno. Asintomática.", interrupciones: "Ninguna", accionesRealizadas: "Registro", evaluabilidad: "Completa" },
          medicamentosYAdherencia: [{ medicamento: "Metformina 500 mg", pauta: "1 tab c/12h", reportePaciente: "100% apego", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" }],
          bitacoraGlucosa: [{ fecha: "28 Oct 2026", hora: "07:30", momento: "En ayunas", valor: "101 mg/dL", certeza: "Verificado" }],
          actividadFisica: "Zumba 45 min 4 días por semana.",
          barrerasYNecesidades: "Ninguna.",
          informacionAdicional: "Excelente adherencia y control glucémico."
        },
        transcripcionLiteral: [
          { segundo: 0, hablante: "Lazo (IA)", texto: "Buenos días doña Martha, le llama Lazo..." }
        ]
      },
      {
        id: "LL-20261014-06",
        fechaHora: "14 Oct 2026 · 09:05 hrs",
        direccion: "Saliente programada",
        tipo: "Seguimiento quincenal programado",
        duracion: "4 min 55 s",
        estado: "Completada",
        alertaGenerada: "Ninguna",
        verificacionIdentidad: "Verificada exitosamente",
        permisoGrabacion: "Aceptado",
        duracionSegundos: 295,
        resumenClinico: {
          seguridadYAlertas: { sintomasAlarma: "Sin síntomas.", interrupciones: "Ninguna", accionesRealizadas: "Registro", evaluabilidad: "Completa" },
          medicamentosYAdherencia: [{ medicamento: "Metformina 500 mg", pauta: "1 tab c/12h", reportePaciente: "Tomada puntual", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" }],
          bitacoraGlucosa: [{ fecha: "14 Oct 2026", hora: "07:45", momento: "En ayunas", valor: "108 mg/dL", certeza: "Verificado" }],
          actividadFisica: "Clases de baile aeróbico.",
          barrerasYNecesidades: "Ninguna.",
          informacionAdicional: "Tratamiento en metas óptimas."
        },
        transcripcionLiteral: [
          { segundo: 0, hablante: "Lazo (IA)", texto: "Buenos días señora Martha..." }
        ]
      },
      {
        id: "LL-20260930-04",
        fechaHora: "30 Sep 2026 · 09:00 hrs",
        direccion: "Saliente programada",
        tipo: "Seguimiento quincenal programado",
        duracion: "5 min 02 s",
        estado: "Completada",
        alertaGenerada: "Ninguna",
        verificacionIdentidad: "Verificada exitosamente",
        permisoGrabacion: "Aceptado",
        duracionSegundos: 302,
        resumenClinico: {
          seguridadYAlertas: { sintomasAlarma: "Sin síntomas de alarma.", interrupciones: "Ninguna", accionesRealizadas: "Registro", evaluabilidad: "Completa" },
          medicamentosYAdherencia: [{ medicamento: "Metformina 500 mg", pauta: "1 tab c/12h", reportePaciente: "Tomada", dosisOmitidas: "0", motivo: "N/A", barrera: null, efectosAdversos: "Ninguno" }],
          bitacoraGlucosa: [{ fecha: "30 Sep 2026", hora: "08:00", momento: "En ayunas", valor: "104 mg/dL", certeza: "Verificado" }],
          actividadFisica: "Activa.",
          barrerasYNecesidades: "Ninguna.",
          informacionAdicional: "Control metabólico estable."
        },
        transcripcionLiteral: [
          { segundo: 0, hablante: "Lazo (IA)", texto: "Buenos días Doña Martha..." }
        ]
      }
    ],
    notas: []
  }
];

export const TODAY_APPOINTMENTS = [
  {
    id: "apt-1",
    hora: "09:30",
    pacienteId: "LZ-0482",
    pacienteNombre: "Roberto Méndez Silva",
    motivo: "Revisión urgente de descompensación glucémica y seguimiento de derivación",
    estado: "Confirmada",
    resumenLlamada: "Alerta hoy 08:42: glucosa 340 mg/dL + emesis incoercible. Derivación hospitalaria indicada.",
    duracion: "30 min"
  },
  {
    id: "apt-2",
    hora: "10:30",
    pacienteId: "LZ-0319",
    pacienteNombre: "Elena Garza Villarreal",
    motivo: "Valoración prioritaria de síntomas visuales y ajuste de insumos",
    estado: "Confirmada",
    resumenLlamada: "Refiere visión borrosa de 3 semanas + escasez de tiras reactivas.",
    duracion: "25 min"
  },
  {
    id: "apt-3",
    hora: "12:00",
    pacienteId: "LZ-0512",
    pacienteNombre: "Martha Sánchez Treviño",
    motivo: "Control de rutina trimestral y valoración de espaciar seguimiento",
    estado: "Confirmada",
    resumenLlamada: "Control óptimo con HbA1c 6.4% y adherencia de 100%.",
    duracion: "20 min"
  }
];
