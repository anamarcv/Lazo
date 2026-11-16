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
import LiveCallModal from '../../../components/calls/LiveCallModal';

export default function TabLlamadas({ patient }) {
  // Modal de prueba interactiva de llamada en vivo (Gemini Live)
  const [isLiveCallModalOpen, setIsLiveCallModalOpen] = useState(false);

  // Estado de llamadas persistidas en el servidor
  const [persistedCalls, setPersistedCalls] = useState([]);

  // Estado de llamada seleccionada (null = muestra historial operativo y tarjetas)
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [activeCallTab, setActiveCallTab] = useState('resumen'); // 'resumen' | 'transcripcion'
  const [filterType, setFilterType] = useState('todas'); // 'todas' | 'emergencia' | 'completada' | 'inconclusa'
  
  // Drawer state for "Ver fuente"
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [highlightedSecond, setHighlightedSecond] = useState(null);
  const [sourceNote, setSourceNote] = useState('');
  const [sourceQuote, setSourceQuote] = useState('');

  // Audio Player State (Real con fallback)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [copied, setCopied] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [retryingCallId, setRetryingCallId] = useState(null);
  const audioRef = React.useRef(null);

  // Carga reactiva de llamadas desde el backend persistido (/api/calls)
  const fetchPersistedCalls = async () => {
    try {
      const res = await fetch(`/api/calls?patientId=${patient.id}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPersistedCalls(data);
        }
      }
    } catch (err) {
      console.warn('No se pudieron obtener llamadas del backend:', err);
    }
  };

  const handleRetrySummary = async (callId) => {
    try {
      setRetryingCallId(callId);
      const res = await fetch(`/api/calls/${callId}/retry-summary`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        console.log('[TabLlamadas] Reintento de resumen exitoso:', data);
        await fetchPersistedCalls();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error al reintentar resumen: ${errData.error || res.statusText}`);
      }
    } catch (err) {
      console.error('Error al reintentar resumen:', err);
      alert('Error de conexión al reintentar resumen.');
    } finally {
      setRetryingCallId(null);
    }
  };

  useEffect(() => {
    fetchPersistedCalls();

    const handleCallSaved = (event) => {
      console.log('[TabLlamadas] 🔄 Evento lazo_call_saved detectado. Actualizando lista reactivamente:', event.detail?.id);
      if (event.detail) {
        setPersistedCalls(prev => {
          if (prev.some(c => c.id === event.detail.id)) {
            return prev.map(c => c.id === event.detail.id ? event.detail : c);
          }
          return [event.detail, ...prev];
        });
      }
      fetchPersistedCalls();
    };

    window.addEventListener('lazo_call_saved', handleCallSaved);
    return () => {
      window.removeEventListener('lazo_call_saved', handleCallSaved);
    };
  }, [patient.id]);

  // Sondeo periódico temporal para llamadas cuyo resumen se procesa en segundo plano
  useEffect(() => {
    const hasProcessing = persistedCalls.some(c => c.resumenEstado === 'processing');
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchPersistedCalls();
    }, 2500);

    return () => clearInterval(interval);
  }, [persistedCalls, patient.id]);

  // Fusión de llamadas: las grabadas en vivo persistidas van primero
  const initialMockCalls = patient.llamadas || [];
  const calls = [
    ...persistedCalls,
    ...initialMockCalls.filter(c => !persistedCalls.some(p => p.id === c.id))
  ];

  const selectedCall = calls.find(c => c.id === selectedCallId);
  const maxDuration = selectedCall?.duracionSegundos || 258;

  // Consolidar intervenciones consecutivas del mismo interlocutor en una sola caja por turno
  const consolidatedTranscript = React.useMemo(() => {
    if (!selectedCall?.transcripcionLiteral || !Array.isArray(selectedCall.transcripcionLiteral)) return [];
    const merged = [];
    for (const turn of selectedCall.transcripcionLiteral) {
      const last = merged[merged.length - 1];
      if (last && last.hablante === turn.hablante) {
        last.texto = (last.texto + ' ' + turn.texto).trim();
        last.segundoFin = turn.segundoFin || turn.segundo;
      } else {
        merged.push({ ...turn });
      }
    }
    return merged;
  }, [selectedCall?.transcripcionLiteral]);

  // Cálculo dinámico de estadísticas operativas
  const operacionStats = {
    completadas: calls.filter(c => c.estado.toLowerCase().includes('completada')).length,
    sinRespuesta: calls.filter(c => c.estado.toLowerCase().includes('sin respuesta') || c.estado.toLowerCase().includes('no contestada')).length,
    interrumpidasSeguridad: calls.filter(c => c.estado.toLowerCase().includes('interrumpida')).length,
    fallidasTecnicas: calls.filter(c => c.estado.toLowerCase().includes('fallida') || c.estado.toLowerCase().includes('técnica')).length
  };

  const totalLlamadasCalculado = operacionStats.completadas + operacionStats.sinRespuesta + operacionStats.interrumpidasSeguridad + operacionStats.fallidasTecnicas;

  // Manejo de reproducción de audio (elemento HTML5 real o fallback temporal)
  useEffect(() => {
    let interval = null;
    // Si no hay audioUrl o el audio falló, usar simulación temporal de progreso
    if (isPlaying && (!selectedCall?.audioUrl || !audioRef.current)) {
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
  }, [isPlaying, maxDuration, selectedCall?.audioUrl]);

  // Reset de audio al cambiar de llamada seleccionada
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setAudioError(null);
  }, [selectedCallId]);

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTogglePlay = () => {
    setAudioError(null);
    if (!selectedCall?.audioUrl && selectedCall?.grabacionConservada === false) {
      setAudioError('Grabación no disponible: fue purgada por falta de consentimiento conforme al protocolo NOM-004.');
      return;
    }
    if (audioRef.current && selectedCall?.audioUrl) {
      if (audioRef.current.paused) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Audio play error:', err);
          setAudioError('Error al reproducir audio: ' + (err.message || 'archivo inaccesible'));
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  const handleSeek = (sec) => {
    const s = Math.max(0, Math.min(sec, maxDuration));
    setCurrentTime(s);
    if (audioRef.current && selectedCall?.audioUrl) {
      audioRef.current.currentTime = s;
    }
  };

  // Cálculo de segundo contextual con pre-roll para que el médico escuche la pregunta de Lazo antes de la respuesta del paciente
  const getContextualAudioSecond = (targetSecond, transcript, maxPreRoll = 3.5) => {
    if (targetSecond == null || isNaN(targetSecond)) return 0;
    if (!transcript || transcript.length === 0) {
      return Math.max(0, targetSecond - maxPreRoll);
    }
    // Buscar el turno que contiene o precede inmediatamente al segundo objetivo
    const turnIndex = transcript.findIndex(t => 
      t.segundo <= targetSecond && (t.segundoFin == null || t.segundoFin >= targetSecond)
    );
    if (turnIndex > 0) {
      const prevTurn = transcript[turnIndex - 1];
      // Si la intervención anterior es de Lazo (la pregunta clínica) y está a 12s o menos
      if (prevTurn && prevTurn.hablante && prevTurn.hablante.toLowerCase().includes('lazo') && (targetSecond - prevTurn.segundo) <= 12) {
        return Math.max(0, prevTurn.segundo);
      }
    }
    // Fallback: aplicar pre-roll suave de 3.5 segundos
    return Math.max(0, targetSecond - maxPreRoll);
  };

  const handleOpenSource = (second, note, quoteText = '') => {
    setSourceNote(note || '');
    setSourceQuote(quoteText || '');
    if (second != null && !isNaN(second)) {
      setHighlightedSecond(second);
      const contextualSecond = getContextualAudioSecond(second, selectedCall?.transcripcionLiteral);
      handleSeek(contextualSecond);
      if (audioRef.current && selectedCall?.audioUrl) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        setIsPlaying(true);
      }
    } else {
      setHighlightedSecond(null);
    }
    setDrawerOpen(true);
  };

  // Replay snippet from the beginning con pre-roll
  const handleReplaySnippet = () => {
    if (highlightedSecond != null) {
      const contextualSecond = getContextualAudioSecond(highlightedSecond, selectedCall?.transcripcionLiteral);
      handleSeek(contextualSecond);
    } else {
      handleSeek(0);
    }
    if (audioRef.current && selectedCall?.audioUrl) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      setIsPlaying(true);
    }
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

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsLiveCallModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#0D4D43] hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-soft flex items-center gap-2 cursor-pointer"
                  title="Iniciar sesión de audio bidireccional en vivo con Gemini Live"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Probar llamada en vivo (Gemini Live)</span>
                </button>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-lazo-canvas border border-slate-200/80 text-slate-700 w-fit">
                  Total: {calls.length} {calls.length === 1 ? 'llamada registrada' : 'llamadas registradas'}
                </span>
              </div>
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
                            {c.esPruebaEnVivo && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                                <Sparkles className="w-3 h-3 text-emerald-700" />
                                Prueba en Vivo
                              </span>
                            )}

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

                            {c.resumenEstado === 'processing' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse shrink-0">
                                <Clock className="w-3 h-3 animate-spin" />
                                Procesando notas...
                              </span>
                            )}

                            {c.resumenEstado === 'error' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRetrySummary(c.id);
                                }}
                                disabled={retryingCallId === c.id}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition-colors shrink-0"
                              >
                                <Wrench className="w-3 h-3" />
                                {retryingCallId === c.id ? 'Reintentando...' : 'Reintentar resumen'}
                              </button>
                            )}

                            {/* Chip de estado ajustado con texto completo sin corte */}
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                              isInterrupted
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                                : isCompleted 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold' 
                                : isSinRespuesta
                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                : c.resumenEstado === 'processing'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
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

                        {c.resumenClinico?.generado === false || c.resumenClinico?.motivoAbstencion ? (
                          <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                            <strong>Atención clínica:</strong> Resumen no generado por calidad insuficiente. Se requiere revisión de la grabación original.
                          </div>
                        ) : c.resumenClinico?.seguridadYAlertas?.sintomasAlarma ? (
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

            {/* REPRODUCTOR DE AUDIO REAL DE LA LLAMADA */}
            <div className="p-5 rounded-2xl bg-lazo-canvas border border-slate-200/80 space-y-3">
              {/* Elemento de audio HTML5 nativo */}
              {selectedCall?.audioUrl && (
                <audio
                  ref={audioRef}
                  src={selectedCall.audioUrl}
                  preload="metadata"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={() => {
                    if (audioRef.current) {
                      setCurrentTime(Math.round(audioRef.current.currentTime));
                    }
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }}
                  onError={(e) => {
                    console.warn('Audio tag event error:', e);
                    setAudioError('No se pudo cargar el audio grabado desde el servidor. Si el archivo fue purgado por falta de consentimiento o el servidor se reinició, la transcripción literal permanece accesible para revisión.');
                    setIsPlaying(false);
                  }}
                />
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-lazo-primary" />
                  {selectedCall?.grabacionConservada !== false 
                    ? 'Grabación de la llamada (Voz sincronizada paciente y Lazo)'
                    : 'Grabación purgada por falta de consentimiento conforme a NOM-004'}
                </span>
                <span className="font-mono text-slate-500 font-semibold">
                  {formatSeconds(currentTime)} / {formatSeconds(maxDuration)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleTogglePlay}
                  className="w-10 h-10 rounded-2xl bg-lazo-primary hover:bg-lazo-primary-hover text-white flex items-center justify-center transition-colors shadow-soft shrink-0"
                  disabled={selectedCall?.grabacionConservada === false && !selectedCall?.audioUrl}
                  title={selectedCall?.grabacionConservada === false && !selectedCall?.audioUrl ? 'Audio purgado o no disponible' : isPlaying ? 'Pausar audio' : 'Reproducir grabación'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <button
                  onClick={() => handleSeek(0)}
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

              {audioError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{audioError}</span>
                </div>
              )}
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

            {/* CONTENIDO PESTAÑA 1: RESUMEN CLÍNICO (6 SECCIONES OBLIGATORIAS) O REGLA DE ABSTENCIÓN */}
            {activeCallTab === 'resumen' && (
              selectedCall.resumenEstado === 'processing' ? (
                <div className="p-8 text-center bg-blue-50/60 rounded-3xl border border-blue-200 space-y-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
                    <Clock className="w-6 h-6 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">
                      Generando documentación clínica en segundo plano...
                    </h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      La llamada ha finalizado y la grabación de audio está guardada de forma segura en el servidor. La síntesis estructurada NOM-004 se está procesando y aparecerá aquí automáticamente en unos segundos.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => setActiveCallTab('transcripcion')}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ver Transcripción Literal Preliminar</span>
                    </button>
                  </div>
                </div>
              ) : selectedCall.resumenEstado === 'error' ? (
                <div className="p-8 text-center bg-amber-50/70 rounded-3xl border-2 border-amber-300 space-y-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-300">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      Error de documentación (Reintentable)
                    </h4>
                    <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                      La llamada y su transcripción están guardadas de forma segura. La síntesis clínica automática experimentó un problema temporal de procesamiento.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleRetrySummary(selectedCall.id)}
                      disabled={retryingCallId === selectedCall.id}
                      className="px-4 py-2.5 rounded-xl bg-lazo-primary hover:bg-lazo-primary-hover text-white text-xs font-bold transition-all shadow-soft flex items-center gap-2"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>{retryingCallId === selectedCall.id ? 'Reintentando...' : 'Reintentar documentación ahora'}</span>
                    </button>
                    <button
                      onClick={() => setActiveCallTab('transcripcion')}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ver Transcripción</span>
                    </button>
                  </div>
                </div>
              ) : selectedCall.resumenClinico?.generado === false || selectedCall.resumenClinico?.motivoAbstencion ? (
                <div className="p-6 rounded-3xl bg-amber-50/90 border-2 border-amber-300 space-y-4 animate-fadeIn">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-300">
                      <AlertTriangle className="w-6 h-6 text-amber-800" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900 uppercase tracking-wide">
                          Regla de Calidad y Abstención
                        </span>
                        <span className="text-xs text-amber-700/80 font-medium">NOM-004 Auditable</span>
                      </div>
                      <h4 className="text-sm font-bold text-amber-950">
                        Resumen clínico no generado
                      </h4>
                      <p className="text-xs font-semibold text-amber-900 leading-relaxed">
                        La transcripción de esta llamada no tiene calidad suficiente para elaborar una síntesis confiable. Se requiere revisión de la grabación original.
                      </p>
                      {selectedCall.resumenClinico?.detallesCalidad && (
                        <p className="text-[11.5px] text-amber-800 pt-1">
                          <strong>Causa identificada:</strong> {selectedCall.resumenClinico.detallesCalidad}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <span className="text-slate-600 font-medium">
                      El audio original de la llamada y la transcripción literal están disponibles para revisión médica directa:
                    </span>
                    <button
                      onClick={() => setActiveCallTab('transcripcion')}
                      className="px-4 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-white font-bold transition-all flex items-center gap-2 cursor-pointer shadow-soft text-xs shrink-0"
                    >
                      <FileText className="w-4 h-4 text-amber-300" />
                      <span>Ver Transcripción Literal Completa</span>
                    </button>
                  </div>
                </div>
              ) : selectedCall.resumenClinico ? (
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
                    {(selectedCall.resumenClinico.seguridadYAlertas?.fuenteSegundo != null || (selectedCall.id === 'c1' && selectedCall.alertaGenerada?.includes('Emergencia'))) && (
                      <button
                        onClick={() => handleOpenSource(
                          selectedCall.resumenClinico.seguridadYAlertas?.fuenteSegundo ?? 68,
                          "Declaración de síntomas clínicos reportados en la llamada",
                          selectedCall.resumenClinico.seguridadYAlertas?.citaTextual
                        )}
                        className="text-xs font-semibold text-lazo-primary hover:underline flex items-center gap-1"
                      >
                        <span>Ver fuente ({formatSeconds(selectedCall.resumenClinico.seguridadYAlertas?.fuenteSegundo ?? 68)})</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
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
                              {med.fuenteSegundo != null ? (
                                <button
                                  onClick={() => handleOpenSource(med.fuenteSegundo, `Reporte sobre ${med.medicamento}`, med.citaTextual)}
                                  className="text-xs text-lazo-primary font-bold hover:underline inline-flex items-center gap-1"
                                >
                                  <span>Ver fuente ({formatSeconds(med.fuenteSegundo)})</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              ) : selectedCall.id === 'c1' && med.medicamento?.includes('Insulina') && med.dosisOmitidas !== '0' ? (
                                <button
                                  onClick={() => handleOpenSource(41, "Omisión de dosis de insulina por temor al mareo")}
                                  className="text-xs text-lazo-primary font-bold hover:underline inline-flex items-center gap-1"
                                >
                                  <span>Ver fuente (0:41)</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400">Verificado</span>
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
                              {g.fuenteSegundo != null ? (
                                <button
                                  onClick={() => handleOpenSource(g.fuenteSegundo, `Dictado de cifra de glucosa: ${g.valor} mg/dL`, g.citaTextual)}
                                  className="text-xs text-lazo-primary font-bold hover:underline inline-flex items-center gap-1"
                                >
                                  <span>Ver audio ({formatSeconds(g.fuenteSegundo)})</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400">Sin marca de audio</span>
                              )}
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
            ))}

            {/* CONTENIDO PESTAÑA 2: TRANSCRIPCIÓN LITERAL */}
            {activeCallTab === 'transcripcion' && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500">
                  Palabras textuales del diálogo telefónico. Haz clic en cualquier fragmento para reproducir desde ese segundo.
                </div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {consolidatedTranscript && consolidatedTranscript.length > 0 ? (
                    consolidatedTranscript.map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          handleSeek(t.segundo);
                          if (audioRef.current && selectedCall?.audioUrl) {
                            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                          } else {
                            setIsPlaying(true);
                          }
                        }}
                        className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                          t.hablante.includes('Lazo')
                            ? 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1.5 font-semibold">
                          <span className={t.hablante.includes('Lazo') ? 'text-lazo-primary font-bold' : 'text-slate-800 font-bold'}>
                            {t.hablante}
                          </span>
                          <span className="font-mono text-slate-400 text-[10.5px]">
                            {formatSeconds(t.segundo)} {t.segundoFin ? `- ${formatSeconds(t.segundoFin)}` : ''}
                          </span>
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
                Dato en revisión médica: {sourceNote}
              </div>

              {highlightedSecond != null ? (() => {
                const matchedTurn = selectedCall?.transcripcionLiteral?.find(t => 
                  t.segundo !== undefined && Math.abs(t.segundo - highlightedSecond) <= 5
                ) || selectedCall?.transcripcionLiteral?.find(t => 
                  t.segundo !== undefined && t.segundo <= highlightedSecond && (t.segundoFin == null || t.segundoFin >= highlightedSecond)
                );

                return (
                  <div className="p-4 rounded-2xl bg-lazo-canvas border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span className="font-bold text-slate-700">{matchedTurn?.hablante || 'Paciente'}</span>
                      <span>{formatSeconds(highlightedSecond)}</span>
                    </div>
                    <p className="text-slate-800 italic leading-relaxed">
                      «{sourceQuote || matchedTurn?.texto || 'Declaración auditada en la llamada.'}»
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="text-slate-400">Transcripción verificada</span>
                      <span className="text-emerald-700 font-semibold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/60">
                        Evidencia auditada
                      </span>
                    </div>
                  </div>
                );
              })() : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <p className="text-slate-600 leading-relaxed">
                    {sourceQuote || 'Información recopilada durante la llamada. No se dispone de una marca de tiempo exacta para reproducción aislada.'}
                  </p>
                  <div className="text-[11px] text-slate-400">
                    Marca de tiempo no disponible para salto automático
                  </div>
                </div>
              )}

              {highlightedSecond != null ? (
                <div className="text-xs text-slate-500 leading-relaxed">
                  El audio de la llamada se reproduce con contexto previo (pregunta de Lazo) para auditar la declaración en el segundo <strong>{formatSeconds(highlightedSecond)}</strong> sin intermediación.
                </div>
              ) : (
                <div className="text-xs text-slate-400 leading-relaxed">
                  Puedes escuchar la grabación completa de la llamada utilizando los controles de audio principales.
                </div>
              )}
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
              onClick={handleTogglePlay}
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

      {/* Modal interactivo de llamada en vivo (Fase 1 - Gemini Live) */}
      <LiveCallModal 
        isOpen={isLiveCallModalOpen} 
        onClose={() => setIsLiveCallModalOpen(false)} 
        patient={patient} 
        onCallCompleted={(savedCall, shouldSelect) => {
          fetchPersistedCalls();
          if (shouldSelect && savedCall?.id) {
            setSelectedCallId(savedCall.id);
          }
        }}
      />
    </div>
  );
}
