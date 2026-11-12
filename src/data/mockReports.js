export const CALL_OPERATIONS_DATA = {
  kpis: {
    llamadasTotales: 1248,
    completadas: 1062,
    tasaCompletadas: 85.1,
    incompletas: 186,
    salientes: 1120,
    entrantes: 128,
    promedioPorPaciente: "1.8",
    alertasGeneradas: 54,
    tasaAlertas: 4.3
  },
  // Gráfica principal de evolución mensual con barras agrupadas
  evolucionMensual: [
    { mes: "Jun", completadas: 154, incompletas: 28, alertas: 6, total: 182 },
    { mes: "Jul", completadas: 168, incompletas: 30, alertas: 8, total: 198 },
    { mes: "Ago", completadas: 175, incompletas: 32, alertas: 9, total: 207 },
    { mes: "Sep", completadas: 182, incompletas: 31, alertas: 11, total: 213 },
    { mes: "Oct", completadas: 195, incompletas: 34, alertas: 12, total: 229 },
    { mes: "Nov", completadas: 188, incompletas: 31, alertas: 8, total: 219 }
  ],
  llamadasPorDia: [
    { fecha: "28 Oct", completadas: 38, incompletas: 6, alertas: 2 },
    { fecha: "29 Oct", completadas: 42, incompletas: 5, alertas: 1 },
    { fecha: "30 Oct", completadas: 45, incompletas: 8, alertas: 3 },
    { fecha: "31 Oct", completadas: 40, incompletas: 4, alertas: 0 },
    { fecha: "01 Nov", completadas: 36, incompletas: 7, alertas: 2 },
    { fecha: "02 Nov", completadas: 44, incompletas: 6, alertas: 4 },
    { fecha: "03 Nov", completadas: 39, incompletas: 5, alertas: 3 }
  ],
  // Tabla: Pacientes con incidencias de contacto y recordatorios automáticos
  pacientesIncidenciasContacto: [
    {
      id: "LZ-0195",
      nombre: "Carlos Salinas Morales",
      problemaRecurrente: "Sin respuesta tras 3 timbres y buzón de voz",
      incidencias: 3,
      ultimaFecha: "03 Nov 2026 · 11:10 hrs",
      estadoRecordatorio: "Pendiente",
      causaDetallada: "Horario laboral matutino incompatible; teléfono sin buzón habilitado",
      accionSugerida: "Verificar teléfono alterno y acordar horario vespertino en próxima consulta"
    },
    {
      id: "LZ-0319",
      nombre: "Arturo Domínguez Vega",
      problemaRecurrente: "Línea fuera de servicio / corte recurrente",
      incidencias: 2,
      ultimaFecha: "01 Nov 2026 · 14:15 hrs",
      estadoRecordatorio: "Pendiente",
      causaDetallada: "Posible cambio de chip o corte de red telefónica",
      accionSugerida: "Solicitar número de familiar o cuidador responsable en consulta"
    },
    {
      id: "LZ-0588",
      nombre: "Beatriz Lozano Ruiz",
      problemaRecurrente: "Ocupada reiteradamente / solicita reagendar llamada",
      incidencias: 2,
      ultimaFecha: "30 Oct 2026 · 17:00 hrs",
      estadoRecordatorio: "Pendiente",
      causaDetallada: "Cuidado de nietos por las tardes",
      accionSugerida: "Ajustar ventana de contacto a horario matutino (09:00 - 11:00)"
    },
    {
      id: "LZ-0482",
      nombre: "Roberto Méndez Silva",
      problemaRecurrente: "Interrupción de llamada por protocolo de urgencia médica",
      incidencias: 1,
      ultimaFecha: "03 Nov 2026 · 08:42 hrs",
      estadoRecordatorio: "Resuelto",
      causaDetallada: "Interrupción protectora por seguridad clínica (Glucosa 340 mg/dL + vómitos)",
      accionSugerida: "No es falla técnica ni problema de contacto. Canalizado a Urgencias médicas."
    }
  ],
  desgloseTipo: [
    { tipo: "Seguimiento periódico programado", porcentaje: 76, conteo: 948 },
    { tipo: "Tamizaje rotativo (Pie, DNS, Ojos)", porcentaje: 16, conteo: 200 },
    { tipo: "Línea abierta entrante (Dudas/Síntomas)", porcentaje: 8, conteo: 100 }
  ],
  porGrupoEdad: [
    { grupo: "< 50 años", llamadas: 240, completadas: 212, tasa: "88.3%" },
    { grupo: "50 - 64 años", llamadas: 620, completadas: 533, tasa: "86.0%" },
    { grupo: "≥ 65 años", llamadas: 388, completadas: 317, tasa: "81.7%" }
  ],
  motivosNoCompletadas: [
    { motivo: "Sin respuesta tras 3 timbres", porcentaje: 58, conteo: 108 },
    { motivo: "Paciente ocupado / Solicitó reagendar", porcentaje: 22, conteo: 41 },
    { motivo: "Buzón de voz / Fuera de servicio", porcentaje: 14, conteo: 26 },
    { motivo: "Rechazo del permiso de grabación", porcentaje: 6, conteo: 11 }
  ],
  incidenciasTecnicas: [
    { tipo: "Reconocimiento ambiguo por ruido ambiental / acento regional", casos: 14, resolucion: "Reclasificado por revisor humano en < 24h sin falsear respuesta" },
    { tipo: "Corte de red telefónica / desconexión de portadora", casos: 4, resolucion: "Reintento automático programado a las 2 horas" }
  ]
};

export const POPULATION_REPORTS_DATA = {
  kpis: {
    pacientesPrograma: 142,
    adherenciaPoblacional: 84.2,
    pacientesEnMeta: 77,
    porcentajeEnMeta: 54.2,
    alertasTotalesPeriodo: 18
  },
  evolucionMeta: [
    { mes: "Jun", enMeta: 41.5, promedioHbA1c: 8.3 },
    { mes: "Jul", enMeta: 44.0, promedioHbA1c: 8.1 },
    { mes: "Ago", enMeta: 48.2, promedioHbA1c: 7.9 },
    { mes: "Sep", enMeta: 51.0, promedioHbA1c: 7.8 },
    { mes: "Oct", enMeta: 54.2, promedioHbA1c: 7.6 }
  ],
  // 6 Indicadores Longitudinales desde el ingreso a Lazo (Cohorte pareada)
  evolucionLongitudinal: {
    hba1c: {
      id: "hba1c",
      nombre: "Hemoglobina Glucosilada (HbA1c)",
      unidad: "%",
      tipoMeta: "Meta individualizada: <7.0% o <7.5%",
      metaAlIngreso: "38.8%",
      metaUltimoSeguimiento: "64.3%",
      cambioObservado: "+25.5 puntos porcentuales",
      totalEvaluables: "93 de 98",
      descripcionClinica: "Porcentaje de pacientes que alcanzan su objetivo glucémico individualizado ajustado por edad y comorbilidades.",
      series: [
        { periodo: "Ingreso", enMeta: 38.8, valorPromedio: 8.5, nEvaluables: 98, totalPacientes: 98 },
        { periodo: "Mes 1", enMeta: 41.5, valorPromedio: 8.3, nEvaluables: 96, totalPacientes: 98 },
        { periodo: "Mes 2", enMeta: 45.8, valorPromedio: 8.1, nEvaluables: 95, totalPacientes: 98 },
        { periodo: "Mes 3", enMeta: 52.1, valorPromedio: 7.9, nEvaluables: 94, totalPacientes: 98 },
        { periodo: "Mes 4", enMeta: 57.4, valorPromedio: 7.8, nEvaluables: 94, totalPacientes: 98 },
        { periodo: "Mes 5", enMeta: 61.3, valorPromedio: 7.7, nEvaluables: 93, totalPacientes: 98 },
        { periodo: "Mes 6", enMeta: 64.3, valorPromedio: 7.6, nEvaluables: 93, totalPacientes: 98 }
      ]
    },
    glucosa: {
      id: "glucosa",
      nombre: "Glucemia Plasmática en Ayuno",
      unidad: "mg/dL",
      tipoMeta: "Glucemia basal en rango meta (80 - 130 mg/dL)",
      metaAlIngreso: "32.7%",
      metaUltimoSeguimiento: "61.2%",
      cambioObservado: "+28.5%",
      totalEvaluables: "93 de 98 pacientes",
      descripcionClinica: "Pacientes con control de glucosa capilar matutina dentro de las metas individualizadas autorreportadas en bitácoras telefónicas y laboratorio.",
      series: [
        { periodo: "Ingreso", enMeta: 32.7, valorPromedio: 172, nEvaluables: 98, totalPacientes: 98 },
        { periodo: "Mes 1", enMeta: 38.5, valorPromedio: 161, nEvaluables: 96, totalPacientes: 98 },
        { periodo: "Mes 2", enMeta: 44.2, valorPromedio: 152, nEvaluables: 95, totalPacientes: 98 },
        { periodo: "Mes 3", enMeta: 50.0, valorPromedio: 144, nEvaluables: 94, totalPacientes: 98 },
        { periodo: "Mes 4", enMeta: 54.3, valorPromedio: 139, nEvaluables: 94, totalPacientes: 98 },
        { periodo: "Mes 5", enMeta: 58.1, valorPromedio: 136, nEvaluables: 93, totalPacientes: 98 },
        { periodo: "Mes 6", enMeta: 61.2, valorPromedio: 132, nEvaluables: 93, totalPacientes: 98 }
      ]
    },
    hta: {
      id: "hta",
      nombre: "Presión Arterial Sistémica (HTA)",
      unidad: "mmHg",
      tipoMeta: "Presión en meta (<130/80 mmHg o meta individual)",
      metaAlIngreso: "42.9%",
      metaUltimoSeguimiento: "71.0%",
      cambioObservado: "+28.1%",
      totalEvaluables: "93 de 98 pacientes",
      descripcionClinica: "Porcentaje de pacientes hipertensos con cifras tensionales en control terapéutico domiciliario y de consultorio.",
      series: [
        { periodo: "Ingreso", enMeta: 42.9, valorPromedio: "138/86", nEvaluables: 98, totalPacientes: 98 },
        { periodo: "Mes 1", enMeta: 48.0, valorPromedio: "135/84", nEvaluables: 96, totalPacientes: 98 },
        { periodo: "Mes 2", enMeta: 55.8, valorPromedio: "132/82", nEvaluables: 95, totalPacientes: 98 },
        { periodo: "Mes 3", enMeta: 61.7, valorPromedio: "129/81", nEvaluables: 94, totalPacientes: 98 },
        { periodo: "Mes 4", enMeta: 66.0, valorPromedio: "127/80", nEvaluables: 94, totalPacientes: 98 },
        { periodo: "Mes 5", enMeta: 68.8, valorPromedio: "126/79", nEvaluables: 93, totalPacientes: 98 },
        { periodo: "Mes 6", enMeta: 71.0, valorPromedio: "125/78", nEvaluables: 93, totalPacientes: 98 }
      ]
    },
    renal: {
      id: "renal",
      nombre: "Función Renal (eGFR y Creatinina)",
      unidad: "mL/min/1.73m² / mg/dL",
      tipoMeta: "eGFR Estable (>60 mL/min / preservación funcional)",
      metaAlIngreso: "88.8% con eGFR > 60",
      metaUltimoSeguimiento: "88.2% con eGFR > 60",
      cambioObservado: "-0.6% (Estabilidad funcional)",
      totalEvaluables: "93 de 98 pacientes",
      descripcionClinica: "eGFR CKD-EPI como indicador primario de filtrado glomerular, con creatinina sérica complementaria. Refleja preservación sin deterioro agudo.",
      series: [
        { periodo: "Ingreso", egfr: 79.1, creatinina: 1.04, enMeta: 88.8, nEvaluables: 98, totalPacientes: 98 },
        { periodo: "Mes 1", egfr: 79.0, creatinina: 1.04, enMeta: 88.5, nEvaluables: 96, totalPacientes: 98 },
        { periodo: "Mes 2", egfr: 78.8, creatinina: 1.05, enMeta: 88.4, nEvaluables: 95, totalPacientes: 98 },
        { periodo: "Mes 3", egfr: 78.6, creatinina: 1.05, enMeta: 88.3, nEvaluables: 94, totalPacientes: 98 },
        { periodo: "Mes 4", egfr: 78.5, creatinina: 1.05, enMeta: 88.3, nEvaluables: 94, totalPacientes: 98 },
        { periodo: "Mes 5", egfr: 78.4, creatinina: 1.05, enMeta: 88.2, nEvaluables: 93, totalPacientes: 98 },
        { periodo: "Mes 6", egfr: 78.4, creatinina: 1.05, enMeta: 88.2, nEvaluables: 93, totalPacientes: 98 }
      ]
    },
    ldl: {
      id: "ldl",
      nombre: "Colesterol LDL",
      unidad: "mg/dL",
      tipoMeta: "Meta LDL (<100 o <70 mg/dL según RCV)",
      metaAlIngreso: "35.7%",
      metaUltimoSeguimiento: "59.1%",
      cambioObservado: "+23.4%",
      totalEvaluables: "93 de 98 pacientes",
      descripcionClinica: "Porcentaje de pacientes en meta de c-LDL según estratificación de riesgo cardiovascular.",
      series: [
        { periodo: "Ingreso", enMeta: 35.7, valorPromedio: 134, nEvaluables: 98, totalPacientes: 98 },
        { periodo: "Mes 1", enMeta: 38.5, valorPromedio: 130, nEvaluables: 96, totalPacientes: 98 },
        { periodo: "Mes 2", enMeta: 43.2, valorPromedio: 124, nEvaluables: 95, totalPacientes: 98 },
        { periodo: "Mes 3", enMeta: 48.9, valorPromedio: 118, nEvaluables: 94, totalPacientes: 98 },
        { periodo: "Mes 4", enMeta: 53.2, valorPromedio: 112, nEvaluables: 94, totalPacientes: 98 },
        { periodo: "Mes 5", enMeta: 56.9, valorPromedio: 107, nEvaluables: 93, totalPacientes: 98 },
        { periodo: "Mes 6", enMeta: 59.1, valorPromedio: 103, nEvaluables: 93, totalPacientes: 98 }
      ]
    },
    hdl: {
      id: "hdl",
      nombre: "Colesterol HDL (Valores Medios Observados)",
      unidad: "mg/dL",
      tipoMeta: "Sin meta universal predefinida (trayectoria fisiológica)",
      metaAlIngreso: "41.2 mg/dL promedio",
      metaUltimoSeguimiento: "45.8 mg/dL promedio",
      cambioObservado: "+4.6 mg/dL",
      totalEvaluables: "93 de 98 pacientes",
      descripcionClinica: "Evolución observada de concentración media de c-HDL sin imponer una meta terapéutica artificial no avalada por consensos clínicos.",
      series: [
        { periodo: "Ingreso", valorPromedio: 41.2, hdlHombres: 38.4, hdlMujeres: 43.1, nEvaluables: 98, totalPacientes: 98 },
        { periodo: "Mes 1", valorPromedio: 41.8, hdlHombres: 38.9, hdlMujeres: 43.8, nEvaluables: 96, totalPacientes: 98 },
        { periodo: "Mes 2", valorPromedio: 42.6, hdlHombres: 39.5, hdlMujeres: 44.7, nEvaluables: 95, totalPacientes: 98 },
        { periodo: "Mes 3", valorPromedio: 43.5, hdlHombres: 40.2, hdlMujeres: 45.8, nEvaluables: 94, totalPacientes: 98 },
        { periodo: "Mes 4", valorPromedio: 44.3, hdlHombres: 40.8, hdlMujeres: 46.7, nEvaluables: 94, totalPacientes: 98 },
        { periodo: "Mes 5", valorPromedio: 45.1, hdlHombres: 41.4, hdlMujeres: 47.6, nEvaluables: 93, totalPacientes: 98 },
        { periodo: "Mes 6", valorPromedio: 45.8, hdlHombres: 42.0, hdlMujeres: 48.4, nEvaluables: 93, totalPacientes: 98 }
      ]
    }
  },
  adherenciaPorEdad: [
    { grupo: "Menores de 50 años", pacientes: 28, adherenciaMedia: 88.4, altaApego: 22, bajoApego: 2 },
    { grupo: "50 a 64 años", pacientes: 74, adherenciaMedia: 85.1, altaApego: 53, bajoApego: 7 },
    { grupo: "65 años o más", pacientes: 40, adherenciaMedia: 79.8, altaApego: 25, bajoApego: 6 }
  ],
  adherenciaPorSexo: [
    { sexo: "Mujeres", pacientes: 82, adherenciaMedia: 86.2, altaApego: 60, bajoApego: 8 },
    { sexo: "Hombres", pacientes: 60, adherenciaMedia: 81.9, altaApego: 40, bajoApego: 7 }
  ],
  distribucionAdherencia: [
    { nivel: "Alta (≥ 80% de dosis)", porcentaje: 70.4, pacientes: 100 },
    { nivel: "Intermedia (50 - 79%)", porcentaje: 19.0, pacientes: 27 },
    { nivel: "Baja (< 50% de dosis)", porcentaje: 10.6, pacientes: 15 }
  ],
  resultadosClinicosPareados: {
    nCohorte: 98,
    indicadores: [
      { indicador: "HbA1c", basal: "8.4%", actual: "7.6%", cambio: "-0.8 pp" },
      { indicador: "Glucemia en ayuno", basal: "168", actual: "134 mg/dL", cambio: "-34 mg/dL" },
      { indicador: "Presión sistólica", basal: "138", actual: "126 mmHg", cambio: "-12 mmHg" },
      { indicador: "Índice de Masa Corporal", basal: "29.8", actual: "29.2 kg/m²", cambio: "-0.6 kg/m²" }
    ],
    complicacionesIngresoVsSeguimiento: [
      { complicacion: "Neuropatía periférica", ingresoPreexistente: "28% (27/98)", nuevasDeteccionesTamizaje: "6 casos sospechosos (DNS positivo, derivados)" },
      { complicacion: "Retinopatía diabética", ingresoPreexistente: "18% (18/98)", nuevasDeteccionesTamizaje: "4 casos con cambios visuales canalizados" },
      { complicacion: "Nefropatía (Albuminuria A2/A3)", ingresoPreexistente: "14% (14/98)", nuevasDeteccionesTamizaje: "3 pacientes con nuevo uACR >30 mg/g" },
      { complicacion: "Enfermedad Cardiovascular", ingresoPreexistente: "9% (9/98)", nuevasDeteccionesTamizaje: "0 eventos agudos en seguimiento" }
    ],
    actividadFisica: {
      diasActivosSemana: 2.9,
      minutosSemanales: 118,
      porcentajeAlcanzaMeta: 44.5
    }
  },
  complicacionesCohorte: [
    {
      complicacion: "Neuropatía periférica",
      alIngreso: "28% (27/98)",
      nuevasSospechas: 6,
      nuevasConfirmadas: "3 (3.1%)",
      progresion: "2 (2.0%)"
    },
    {
      complicacion: "Retinopatía diabética",
      alIngreso: "18% (18/98)",
      nuevasSospechas: 4,
      nuevasConfirmadas: "2 (2.0%)",
      progresion: "1 (1.0%)"
    },
    {
      complicacion: "Nefropatía (Albuminuria A2/A3)",
      alIngreso: "14% (14/98)",
      nuevasSospechas: 3,
      nuevasConfirmadas: "1 (1.0%)",
      progresion: "1 (1.0%)"
    },
    {
      complicacion: "Enfermedad Cardiovascular",
      alIngreso: "9% (9/98)",
      nuevasSospechas: 0,
      nuevasConfirmadas: "0 (0.0%)",
      progresion: "0 (0.0%)"
    }
  ],
  tamizajesPrevencion: {
    recomendados: 60,
    revisadosMedico: 48,
    realizados: 36,
    hallazgosRelevantes: 8,
    tasaRealizados: 60,
    porTipo: [
      { tipo: "Fondo de ojo", realizados: 12, recomendados: 20, porcentaje: 60, id: "ojo" },
      { tipo: "Evaluación de pies", realizados: 10, recomendados: 15, porcentaje: 67, id: "pies" },
      { tipo: "Función renal (creatinina/eTFG)", realizados: 8, recomendados: 12, porcentaje: 67, id: "renal" },
      { tipo: "Albuminuria (A2/A3)", realizados: 6, recomendados: 13, porcentaje: 46, id: "albuminuria" }
    ]
  },
  barrerasFrecuentes: [
    { barrera: "Costo económico de tiras e insumos", porcentaje: 38, casos: 54 },
    { barrera: "Olvido o desorganización de rutina diaria", porcentaje: 28, casos: 40 },
    { barrera: "Desabasto en farmacia institucional", porcentaje: 18, casos: 26 },
    { barrera: "Comprensión de dosis o temor a hipoglucemia", porcentaje: 11, casos: 16 },
    { barrera: "Otras (traslado, apoyo familiar)", porcentaje: 5, casos: 7 }
  ],
  intervencionesBarreras: [
    { paciente: "Elena Garza Villarreal", barrera: "Costo de tiras reactivas", necesidad: "Entrega de insumos institucionales", estado: "En trámite con Trabajo Social", fecha: "02 Nov 2026" },
    { paciente: "Carlos Salinas Morales", barrera: "Desabasto de atorvastatina", necesidad: "Gestión de receta alternativa", estado: "Pendiente de contacto", fecha: "30 Oct 2026" },
    { paciente: "Roberto Méndez Silva", barrera: "Temor a hipoglucemia por insulina", necesidad: "Educación en 'días de enfermedad'", estado: "Agendado para consulta", fecha: "03 Nov 2026" }
  ]
};
