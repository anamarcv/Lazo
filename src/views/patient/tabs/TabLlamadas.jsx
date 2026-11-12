import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertOctagon, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  X,
  FileText,
  AlertTriangle,
  Sparkles,
  PhoneMissed,
  ShieldAlert,
  Wrench
} from 'lucide-react';

export default function TabLlamadas({ patient }) {
  // Estado de llamada seleccionada (null = muestra historial operativo y tarjetas)
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [activeCallTab, setActiveCallTab] = useState('resumen'); // 'resumen' | 'transcripcion'
  const [filterType, setFilterType] = useState('todas'); // 'todas' | 'emergencia' | 'completada' | 'inconclusa'
  
  // Drawer state for "Ver fuente"
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [highlightedSecond, setHighlightedSecond] = useState(0);
  const [sourceNote, setSourceNote] = useState('');

  // Audio Player State (Simulado)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [copied, setCopied] = useState(false);

  const calls = patient.llamadas || [];
  const selectedCall = calls.find(c => c.id === selectedCallId);
  const maxDuration = selectedCall?.duracionSegundos || 258;

  // Cálculo 100% dinámico y sincronizado de estadísticas operativas a partir de las llamadas reales
  const operacionStats = {
    completadas: calls.filter(c => c.estado.toLowerCase().includes('completada')).length,
    sinRespuesta: calls.filter(c => c.estado.toLowerCase().includes('sin respuesta') || c.estado.toLowerCase().includes('no contestada')).length,
    interrumpidasSeguridad: calls.filter(c => c.estado.toLowerCase().includes('interrumpida')).length,
    fallidasTecnicas: calls.filter(c => c.estado.toLowerCase().includes('fallida') || c.estado.toLowerCase().includes('técnica')).length
  };

  const totalLlamadasCalculado = operacionStats.completadas + operacionStats.sinRespuesta + operacionStats.interrumpidasSeguridad + operacionStats.fallidasTecnicas;

  // Audio timer simulation
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= maxDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, maxDuration]);

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (sec) => {
    setCurrentTime(sec);
  };

  const handleOpenSource = (second, note) => {
    setHighlightedSecond(second);
    setSourceNote(note);
    setCurrentTime(second);
    setIsPlaying(true);
    setDrawerOpen(true);
  };

  // Replay snippet from the beginning
  const handleReplaySnippet = () => {
    setCurrentTime(highlightedSecond || 0);
    setIsPlaying(true);
  };

  const handleCopySummary = () => {
    if (!selectedCall?.resumenClinico) return;
    const text = `LAZO - RESUMEN CLÍNICO GENERADO POR IA
Paciente: ${patient.nombre} (ID: ${patient.id})
Llamada: ${selectedCall.fechaHora} (${selectedCall.tipo})
Estado: ${selectedCall.estado}

1. SEGURIDAD Y ALERTAS:
${selectedCall.resumenClinico.seguridadYAlertas.sintomasAlarma}
Acciones: ${selectedCall.resumenClinico.seguridadYAlertas.accionesRealizadas}

2. MEDICAMENTOS Y ADHERENCIA:
${selectedCall.resumenClinico.medicamentosYAdherencia.map(m => `- ${m.medicamento}: ${m.reportePaciente} | Omisiones: ${m.dosisOmitidas} (${m.motivo})`).join('\n')}

3. BITÁCORA DE GLUCOSA:
${selectedCall.resumenClinico.bitacoraGlucosa.map(g => `- ${g.fecha} ${g.hora} (${g.momento}): ${g.valor}`).join('\n')}

4. ACTIVIDAD FÍSICA:
${selectedCall.resumenClinico.actividadFisica}

5. BARRERAS Y NECESIDADES:
${selectedCall.resumenClinico.barrerasYNecesidades}

6. INFORMACIÓN ADICIONAL:
${selectedCall.resumenClinico.informacionAdicional}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtrado de llamadas
  const filteredCalls = calls.filter(c => {
    if (filterType === 'emergencia') return c.alertaGenerada?.includes('Emergencia');
    if (filterType === 'completada') return c.estado.toLowerCase().includes('completada');
    if (filterType === 'inconclusa') return !c.estado.toLowerCase().includes('completada');
    return true;
  });

  return (
    <div className="relative animate-fadeIn space-y-6">
      {/* VISTA 1: CUANDO NO HAY LLAMADA SELECCIONADA */}
      {!selectedCallId ? (
        <div className="space-y-6">
          {/* SECCIÓN SUPERIOR: SEGUIMIENTO OPERATIVO DE LLAMADAS (HASTA ARRIBA) */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Clock className="w-5 h-5 text-lazo-primary" />
                  Seguimiento Operativo de Llamadas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Desglose acumulado de todas las llamadas realizadas y recibidas para {patient.nombre}
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-lazo-canvas border border-slate-200/80 text-slate-700 w-fit">
                Total: {calls.length} {calls.length === 1 ? 'llamada registrada' : 'llamadas registradas'}
              </span>
            </div>

            {/* 4 Indicadores Operativos (100% sincronizados con las llamadas reales) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-lazo-canvas border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completadas</span>
                <p className="text-2xl font-extrabold text-emerald-800 mt-1">{operacionStats.completadas}</p>
                <p className="text-[10.5px] text-slate-400 mt-0.5">Cuestionario íntegro</p>
              </div>

              <div className="p-4 rounded-2xl bg-lazo-canvas border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sin respuesta</span>
                <p className="text-2xl font-extrabold text-slate-700 mt-1">{operacionStats.sinRespuesta}</p>
                <p className="text-[10.5px] text-slate-400 mt-0.5">No contestó / Ocupado</p>
              </div>

              <div className="p-4 rounded-2xl bg-lazo-canvas border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Interrumpidas Seg.</span>
                <p className="text-2xl font-extrabold text-amber-800 mt-1">{operacionStats.interrumpidasSeguridad}</p>
                <p className="text-[10.5px] text-amber-700 font-semibold mt-0.5">Por protocolo clínico</p>
              </div>

              <div className="p-4 rounded-2xl bg-lazo-canvas border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fallos Técnicos</span>
                <p className="text-2xl font-extrabold text-slate-500 mt-1">{operacionStats.fallidasTecnicas}</p>
                <p className="text-[10.5px] text-slate-400 mt-0.5">Cortes de red móvil</p>
              </div>
            </div>

            {/* Banner de gobernanza médica */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Regla de gobernanza:</strong> Una interrupción por seguridad clínica (descompensación aguda detectada) protege al paciente y **no constituye un fallo técnico**.
              </span>
            </div>
          </div>

          {/* BARRA DE FILTROS Y CATÁLOGO DE TARJETAS */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-lazo-primary" />
                  Registro Detallado de Llamadas
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Haz clic en cualquier llamada para abrir la grabación de audio, transcripción y resumen
                </p>
              </div>

              {/* Píldoras de filtro */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFilterType('todas')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterType === 'todas'
                      ? 'bg-lazo-primary text-white shadow-soft'
                      : 'bg-lazo-canvas text-slate-600 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  Todas ({calls.length})
                </button>
                <button
                  onClick={() => setFilterType('emergencia')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterType === 'emergencia'
                      ? 'bg-red-600 text-white shadow-soft'
                      : 'bg-lazo-canvas text-slate-600 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  Emergencias ({calls.filter(c => c.alertaGenerada?.includes('Emergencia')).length})
                </button>
                <button
                  onClick={() => setFilterType('completada')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterType === 'completada'
                      ? 'bg-emerald-700 text-white shadow-soft'
                      : 'bg-lazo-canvas text-slate-600 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  Completadas ({operacionStats.completadas})
                </button>
                <button
                  onClick={() => setFilterType('inconclusa')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterType === 'inconclusa'
                      ? 'bg-slate-700 text-white shadow-soft'
                      : 'bg-lazo-canvas text-slate-600 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  Interrumpidas / Sin respuesta ({operacionStats.sinRespuesta + operacionStats.interrumpidasSeguridad + operacionStats.fallidasTecnicas})
                </button>
              </div>
            </div>

            {/* Listado de tarjetas de llamada (100% interactivas) */}
            {filteredCalls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCalls.map((c) => {
                  const isEmergency = c.alertaGenerada?.includes('Emergencia');
                  const isPriority = c.alertaGenerada?.includes('Prioritaria');
                  const isInterrupted = c.estado.toLowerCase().includes('interrumpida');
                  const isCompleted = c.estado.toLowerCase().includes('completada');
                  const isSinRespuesta = c.estado.toLowerCase().includes('sin respuesta') || c.estado.toLowerCase().includes('no contestada');

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCallId(c.id);
                        setIsPlaying(false);
                        setCurrentTime(0);
                      }}
                      className={`bg-white rounded-3xl border p-6 transition-all cursor-pointer hover:shadow-card hover:border-lazo-primary group flex flex-col justify-between ${
                        isEmergency
                          ? 'border-red-200 bg-red-50/25'
                          : isPriority
                          ? 'border-amber-200 bg-amber-50/15'
                          : isInterrupted
                          ? 'border-amber-200 bg-amber-50/10'
                          : 'border-slate-100'
                      }`}
                    >
                      <div>
                        {/* Cabecera con fecha y chips de resultado (Sin cortes de texto) */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <span className="text-xs font-bold text-slate-800">{c.fechaHora}</span>
                          
                          <div className="flex flex-wrap items-center gap-1.5">
                            {isEmergency && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 shrink-0">
                                <AlertOctagon className="w-3.5 h-3.5" />
                                Emergencia Médica
                              </span>
                            )}
                            
                            {isPriority && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                                Prioritaria
                              </span>
                            )}

                            {/* Chip de estado ajustado con texto completo sin corte */}
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                              isInterrupted
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                                : isCompleted 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold' 
                                : isSinRespuesta
                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {isInterrupted ? 'Interrumpida por seguridad' : c.estado}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-lazo-primary transition-colors">
                          {c.tipo}
                        </h4>
                        
                        <p className="text-xs text-slate-500 mt-1">
                          Dirección: <strong>{c.direccion}</strong> · Duración: <strong>{c.duracion}</strong>
                        </p>

                        {c.resumenClinico?.seguridadYAlertas?.sintomasAlarma ? (
                          <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 line-clamp-2">
                            <strong>Síntesis clínica:</strong> {c.resumenClinico.seguridadYAlertas.sintomasAlarma}
                          </div>
                        ) : isSinRespuesta ? (
                          <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                            Llamada no contestada por el paciente (3 timbres sin respuesta).
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-lazo-primary font-bold">
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          ID: {c.id}
                        </span>
                        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Ver detalle y transcripción
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
                No se encontraron llamadas que coincidan con los filtros seleccionados.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VISTA 2: DETALLE DE LLAMADA SELECCIONADA */
        <div className="space-y-6">
          {/* Botón superior para volver al catálogo de llamadas */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedCallId(null);
                setDrawerOpen(false);
                setIsPlaying(false);
              }}
              className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/80 shadow-soft transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-lazo-primary" />
              <span>← Volver a llamadas del paciente</span>
            </button>

            <span className="text-xs text-slate-400">
              Llamada seleccionada: <strong>{selectedCall.id}</strong>
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-7">
            {/* Header de la llamada seleccionada */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Detalle de Llamada Telefónica
                  </h3>
                  {selectedCall.alertaGenerada.includes('Emergencia') && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-lazo-emergency-light text-lazo-emergency border border-lazo-emergency-border">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      Alerta Crítica Generada
                    </span>
                  )}
                  {selectedCall.estado.toLowerCase().includes('interrumpida') && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Interrumpida por seguridad
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedCall.fechaHora} · {selectedCall.direccion} · ID: {selectedCall.id}
                </p>
              </div>

              {/* Verificación de identidad y consentimiento de llamada */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Identidad: <strong>{selectedCall.verificacionIdentidad}</strong></span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-lazo-primary" />
                  <span>Permiso de audio: <strong>{selectedCall.permisoGrabacion}</strong></span>
                </div>
              </div>
            </div>

            {/* REPRODUCTOR PERMANENTE DE AUDIO REAL (Simulado) */}
            <div className="p-5 rounded-2xl bg-lazo-canvas border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-lazo-primary" />
                  Grabación íntegra de la llamada telefónica (Voz humana)
                </span>
                <span className="font-mono text-slate-500 font-semibold">
                  {formatSeconds(currentTime)} / {formatSeconds(maxDuration)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-2xl bg-lazo-primary hover:bg-lazo-primary-hover text-white flex items-center justify-center transition-colors shadow-soft shrink-0"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <button
                  onClick={() => setCurrentTime(0)}
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200/60 transition-colors shrink-0"
                  title="Reiniciar audio"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Scrub Bar */}
                <input
                  type="range"
                  min="0"
                  max={maxDuration}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full accent-lazo-primary cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Sub-Pestañas: Resumen Clínico vs. Transcripción Literal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveCallTab('resumen')}
                  className={`pb-2 text-xs font-bold transition-all relative border-b-2 ${
                    activeCallTab === 'resumen'
                      ? 'border-lazo-primary text-lazo-primary'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Resumen Clínico Extraído por IA
                </button>
                <button
                  onClick={() => setActiveCallTab('transcripcion')}
                  className={`pb-2 text-xs font-bold transition-all relative border-b-2 ${
                    activeCallTab === 'transcripcion'
                      ? 'border-lazo-primary text-lazo-primary'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Transcripción Literal Completa
                </button>
              </div>

              {activeCallTab === 'resumen' && (
                <button
                  onClick={handleCopySummary}
                  className="px-3.5 py-1.5 rounded-xl bg-lazo-canvas hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar resumen para expediente'}</span>
                </button>
              )}
            </div>

            {/* CONTENIDO PESTAÑA 1: RESUMEN CLÍNICO (6 SECCIONES OBLIGATORIAS) */}
            {activeCallTab === 'resumen' && selectedCall.resumenClinico ? (
              <div className="space-y-6">
                {/* Disclaimer de IA */}
                <div className="p-3.5 rounded-2xl bg-lazo-sage/30 border border-lazo-sage-border flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-lazo-primary" />
                    <strong>Síntesis estructurada por IA:</strong> Cada dato es verificable pulsando «Ver fuente».
                  </span>
                  <span className="text-[11px] text-slate-400">NOM-004 Auditable</span>
                </div>

                {/* 1. Seguridad y Alertas */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      1. Seguridad y Señales de Alarma
                    </h4>
                    <button
                      onClick={() => handleOpenSource(68, "Declaración de síntomas clínicos reportados en la llamada")}
                      className="text-xs font-semibold text-lazo-primary hover:underline flex items-center gap-1"
                    >
                      <span>Ver fuente (01:08)</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedCall.resumenClinico.seguridadYAlertas.sintomasAlarma}
                  </p>
                  <div className="pt-2 border-t border-slate-200/60 text-[11.5px] text-slate-600">
                    <p><strong>Acciones automáticas:</strong> {selectedCall.resumenClinico.seguridadYAlertas.accionesRealizadas}</p>
                  </div>
                </div>

                {/* 2. Medicamentos y Adherencia Autorreportada (TABLA OBLIGATORIA) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      2. Medicamentos y Adherencia Autorreportada
                    </h4>
                    <span className="text-[11px] text-slate-400">Una fila por medicamento con chip de barrera</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-100 rounded-2xl overflow-hidden">
                      <thead className="bg-lazo-canvas text-slate-600 font-bold border-b border-slate-100">
                        <tr>
                          <th className="py-3 px-4">Medicamento</th>
                          <th className="py-3 px-4">Pauta Registrada</th>
                          <th className="py-3 px-4">Reporte del Paciente</th>
                          <th className="py-3 px-4">Omisiones / Motivo</th>
                          <th className="py-3 px-4">Barrera Identificada</th>
                          <th className="py-3 px-4 text-right">Auditoría</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedCall.resumenClinico.medicamentosYAdherencia.map((med, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3.5 px-4 font-bold text-slate-900">{med.medicamento}</td>
                            <td className="py-3.5 px-4 text-slate-600">{med.pauta}</td>
                            <td className="py-3.5 px-4 text-slate-700">{med.reportePaciente}</td>
                            <td className="py-3.5 px-4">
                              <span className={med.dosisOmitidas !== '0' && !med.dosisOmitidas.includes('0') ? 'font-bold text-amber-800' : 'text-slate-500'}>
                                {med.dosisOmitidas}
                              </span>
                              {med.motivo !== 'N/A' && <p className="text-[11px] text-slate-400 mt-0.5">{med.motivo}</p>}
                            </td>
                            <td className="py-3.5 px-4">
                              {med.barrera ? (
                                <span className="inline-block px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/60 font-semibold text-xs leading-snug">
                                  {med.barrera}
                                </span>
                              ) : (
                                <span className="text-slate-400">Sin barrera</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {med.medicamento.includes('Insulina') && (
                                <button
                                  onClick={() => handleOpenSource(41, "Omisión de dosis de insulina por temor al mareo")}
                                  className="text-xs text-lazo-primary font-bold hover:underline inline-flex items-center gap-1"
                                >
                                  <span>Ver fuente</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Bitácora de Glucosa (TABLA) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      3. Bitácora de Glucosa Dictada en Llamada
                    </h4>
                    <span className="text-[11px] text-slate-400">Valores con contexto pre/posprandial</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-100 rounded-2xl overflow-hidden">
                      <thead className="bg-lazo-canvas text-slate-600 font-bold border-b border-slate-100">
                        <tr>
                          <th className="py-3 px-4">Fecha y Hora</th>
                          <th className="py-3 px-4">Momento de Alimentación</th>
                          <th className="py-3 px-4">Valor Reportado</th>
                          <th className="py-3 px-4">Validación Técnica</th>
                          <th className="py-3 px-4 text-right">Fuente</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedCall.resumenClinico.bitacoraGlucosa.map((g, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-semibold text-slate-800">{g.fecha} · {g.hora}</td>
                            <td className="py-3 px-4 text-slate-600">{g.momento}</td>
                            <td className="py-3 px-4">
                              <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                                parseInt(g.valor) >= 250 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {g.valor}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-[11px]">{g.certeza}</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleOpenSource(68, `Dictado de cifra de glucosa: ${g.valor}`)}
                                className="text-xs text-lazo-primary font-bold hover:underline inline-flex items-center gap-1"
                              >
                                <span>Ver audio</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Actividad Física & 5. Barreras & 6. Info Adicional */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <h4 className="font-bold text-slate-800 mb-2 uppercase text-[11px]">4. Actividad Física</h4>
                    <p className="text-slate-600">{selectedCall.resumenClinico.actividadFisica}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <h4 className="font-bold text-slate-800 mb-2 uppercase text-[11px]">5. Barreras y Necesidades</h4>
                    <p className="text-slate-600">{selectedCall.resumenClinico.barrerasYNecesidades}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <h4 className="font-bold text-slate-800 mb-2 uppercase text-[11px]">6. Info Adicional para Médico</h4>
                    <p className="text-slate-600">{selectedCall.resumenClinico.informacionAdicional}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* En caso de que la llamada no tenga resumen estructurado (ej. no contestada) */
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs">
                Esta llamada no cuenta con resumen clínico generado por no haber sido completada por el paciente.
              </div>
            )}

            {/* CONTENIDO PESTAÑA 2: TRANSCRIPCIÓN LITERAL */}
            {activeCallTab === 'transcripcion' && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500">
                  Palabras textuales del diálogo telefónico. Haz clic en cualquier fragmento para reproducir desde ese segundo.
                </div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {selectedCall.transcripcionLiteral && selectedCall.transcripcionLiteral.length > 0 ? (
                    selectedCall.transcripcionLiteral.map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setCurrentTime(t.segundo);
                          setIsPlaying(true);
                        }}
                        className="p-3.5 rounded-2xl border text-xs cursor-pointer transition-all bg-lazo-canvas border-slate-100 hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                          <span className={t.hablante.includes('Lazo') ? 'text-lazo-primary' : 'text-slate-800'}>
                            {t.hablante}
                          </span>
                          <span className="font-mono text-slate-400">{formatSeconds(t.segundo)}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{t.texto}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No hay transcripción disponible para este registro telefónico.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRAWER LATERAL DESLIZANTE PARA "VER FUENTE" */}
      {drawerOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 z-50 p-6 flex flex-col justify-between animate-slideLeft">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-lazo-primary" />
                <h4 className="font-bold text-slate-900 text-sm">
                  Fuente de Extracción (Auditoría de IA)
                </h4>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="p-3.5 rounded-2xl bg-lazo-sage/40 border border-lazo-sage-border text-xs text-lazo-primary font-semibold">
                Dato verificado: {sourceNote}
              </div>

              <div className="p-4 rounded-2xl bg-lazo-canvas border border-slate-200 text-xs space-y-2">
                <span className="text-slate-400 font-bold text-[11px] uppercase">Fragmento literal de audio</span>
                <p className="text-slate-800 italic leading-relaxed">
                  «Mire, desde la madrugada ando con náuseas muy feas, ya vomité tres veces y no tolero ni un traguito de agua. Me acabo de checar el azúcar en el glucómetro y me salió en trescientos cuarenta... 340 mg.»
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Marca de tiempo de inicio: {formatSeconds(highlightedSecond || 0)}</span>
                  <span className="text-emerald-700 font-bold">100% Concordancia</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 leading-relaxed">
                El audio de la llamada ha saltado al segundo <strong>{formatSeconds(highlightedSecond || 0)}</strong> para auditar la declaración original del paciente sin intermediación.
              </div>
            </div>
          </div>

          {/* Botones de acción en panel: «Volver a escuchar», Pausar / Continuar y Cerrar */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleReplaySnippet}
              className="px-4 py-2.5 rounded-2xl bg-lazo-sage text-lazo-primary hover:bg-lazo-sage-border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              title="Volver a reproducir desde el inicio del fragmento"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Volver a escuchar</span>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 py-2.5 rounded-2xl bg-lazo-primary text-white text-xs font-semibold hover:bg-lazo-primary-hover flex items-center justify-center gap-2 shadow-soft transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pausar' : 'Continuar'}</span>
            </button>

            <button
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
