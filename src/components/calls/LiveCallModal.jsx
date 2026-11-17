import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  AlertCircle, 
  Sparkles, 
  Volume2, 
  X, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  ShieldCheck,
  Key,
  FileText,
  ChevronRight
} from "lucide-react";
import { LiveAudioStreamer } from "../../services/audioStreamer";
import LazoLogo from "../common/LazoLogo";

export default function LiveCallModal({ isOpen, onClose, patient, onCallCompleted }) {
  const [callStatus, setCallStatus] = useState("idle"); // idle | requesting_mic | connecting | active | interrupted | saved | missing_key | error | ended
  const [errorMessage, setErrorMessage] = useState("");
  const [transcripts, setTranscripts] = useState([]);
  const [volume, setVolume] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [consentStatus, setConsentStatus] = useState("pending"); // pending | granted | denied
  const [savedCall, setSavedCall] = useState(null);
  const [timeWarning, setTimeWarning] = useState(null);

  const streamerRef = useRef(null);
  const timerRef = useRef(null);

  const activePatient = patient || {
    id: "LZ-0482",
    nombre: "Roberto Méndez Silva",
    edad: 60,
    diagnosticoPrincipal: "Diabetes Mellitus Tipo 2"
  };

  const isBaselinePatient = activePatient.isBaseline === true || 
    ["LZ-0482", "LZ-0319", "LZ-0195", "LZ-0512", "LZ-0513", "LZ-0514"].includes(activePatient.id);

  useEffect(() => {
    if (!isOpen) {
      handleEndCall();
      setSavedCall(null);
      setConsentStatus("pending");
      setTimeWarning(null);
    }
    return () => {
      handleEndCall();
    };
  }, [isOpen]);

  useEffect(() => {
    if (callStatus === "active" || callStatus === "interrupted") {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => {
          if (prev + 1 >= 270 && !timeWarning) {
            setTimeWarning("Límite de 5 minutos próximo a cumplirse");
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleStartCall = async () => {
    if (isBaselinePatient) {
      setErrorMessage("Los pacientes de referencia clínica son de solo lectura. Cree un paciente de prueba para realizar llamadas en vivo.");
      setCallStatus("error");
      return;
    }

    setErrorMessage("");
    setTranscripts([]);
    setCallDuration(0);
    setConsentStatus("pending");
    setSavedCall(null);
    setTimeWarning(null);

    const streamer = new LiveAudioStreamer({
      onStatusChange: (status) => {
        setCallStatus(status);
      },
      onWarning: (msg) => {
        setTimeWarning(msg.message || "Límite de duración próximo a cumplirse");
      },
      onTranscript: (msg) => {
        setTranscripts(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

          if (msg.type === "transcript_final") {
            // Sellar el turno final
            if (lastIdx >= 0 && updated[lastIdx].speaker === msg.speaker) {
              updated[lastIdx] = {
                ...updated[lastIdx],
                text: msg.text,
                isFinal: true,
                endSecond: msg.endSecond
              };
              return updated;
            }
            return [
              ...updated,
              {
                speaker: msg.speaker,
                text: msg.text,
                second: msg.second,
                endSecond: msg.endSecond,
                isFinal: true,
                time: currentTime
              }
            ];
          }

          // Actualización en tiempo real (transcript_update o transcript)
          if (lastIdx >= 0 && updated[lastIdx].speaker === msg.speaker) {
            updated[lastIdx] = {
              ...updated[lastIdx],
              text: msg.text,
              isFinal: false
            };
            return updated;
          }

          // Nuevo turno conversacional (únicamente cuando cambia el hablante)
          return [
            ...updated,
            {
              speaker: msg.speaker,
              text: msg.text,
              second: msg.second,
              isFinal: false,
              time: currentTime
            }
          ];
        });
      },
      onConsentChange: (msg) => {
        setConsentStatus(msg.consent);
      },
      onCallSaved: (call) => {
        console.log("[LiveCallModal] Llamada confirmada y guardada:", call);
        setSavedCall(call);
        setCallStatus("saved");
        if (onCallCompleted) {
          onCallCompleted(call);
        }
      },
      onError: (err) => {
        setErrorMessage(err);
        setCallStatus("error");
      },
      onVolume: (vol) => {
        setVolume(vol);
      }
    });

    streamerRef.current = streamer;
    await streamer.start({ patientId: activePatient.id });
  };

  const handleEndCall = () => {
    if (streamerRef.current) {
      streamerRef.current.stop();
      streamerRef.current = null;
    }
    if (callStatus !== "saved") {
      setCallStatus("idle");
    }
    setVolume(0);
  };

  const handleGoToCallDetail = () => {
    const callToView = savedCall;
    handleEndCall();
    onClose();
    if (onCallCompleted && callToView) {
      onCallCompleted(callToView, true); // true = seleccionar inmediatamente
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full p-6 md:p-7 space-y-5 animate-scaleUp relative overflow-hidden">
        
        {/* Glow de fondo para llamada activa */}
        {(callStatus === "active" || callStatus === "interrupted") && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-20 -mt-20 pointer-events-none blur-3xl animate-pulse"></div>
        )}

        {/* Encabezado */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-soft transition-colors ${
              callStatus === "active" 
                ? "bg-[#0D4D43] text-white animate-pulse" 
                : callStatus === "saved"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-emerald-50 text-emerald-800"
            }`}>
              {callStatus === "saved" ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : <Phone className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Llamada en Vivo — Lazo (Gemini Live)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  NOM-004
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulación interactiva con {activePatient.nombre} ({activePatient.id})
              </p>
            </div>
          </div>

          <button 
            onClick={() => { handleEndCall(); onClose(); }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Estado y visualizador central */}
        <div className="py-1 text-center space-y-4">
          
          {/* IDLE: Listo para iniciar */}
          {callStatus === "idle" && (
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-3">
              <LazoLogo variant="color" className="h-12 w-auto mx-auto drop-shadow-xs" />
              <p className="text-sm font-bold text-slate-800">
                Llamada de voz bidireccional en tiempo real
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Hablarás como el paciente <strong className="text-slate-800">{activePatient.nombre}</strong> con la asistente clínica <strong className="text-emerald-800">Lazo</strong> impulsada por Gemini Live API.
              </p>

              {isBaselinePatient ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Expediente de Referencia Clínica (Solo Lectura)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Este paciente es parte de la cohorte basal de referencia médica inmutable. Para interactuar en vivo con la telefonía y evaluar la documentación, por favor cree un nuevo paciente de prueba en la sección "Pacientes".
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-xs text-left space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Protocolo de llamada (Máx. 5 minutos):
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    1. Lazo te saludará automáticamente por voz.<br />
                    2. Te pedirá confirmar tu nombre y fecha de nacimiento.<br />
                    3. Solicitará consentimiento para registrar el diálogo.<br />
                    4. La llamada concluye automáticamente a los 5 minutos (aviso a los 4m 30s).
                  </p>
                </div>
              )}
            </div>
          )}

          {/* REQUESTING MIC / CONNECTING */}
          {(callStatus === "requesting_mic" || callStatus === "connecting") && (
            <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-emerald-900">
                {callStatus === "requesting_mic" ? "Solicitando acceso al micrófono..." : "Conectando con Gemini Live Gateway..."}
              </p>
              <p className="text-[11px] text-emerald-700">
                Lazo iniciará el saludo en cuanto se confirme la sesión
              </p>
            </div>
          )}

          {/* ACTIVE CALL */}
          {(callStatus === "active" || callStatus === "interrupted") && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-card">
              <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Llamada en curso
                </span>

                {/* Chip de Consentimiento en tiempo real */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                  consentStatus === "granted"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : consentStatus === "denied"
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {consentStatus === "granted" ? "Consentimiento: Otorgado" : consentStatus === "denied" ? "Consentimiento: Denegado" : "Esperando consentimiento..."}
                </span>

                <span className="font-mono font-bold text-slate-200">
                  {formatDuration(callDuration)} / 5:00
                </span>
              </div>

              {/* Barra de progreso de tiempo hacia los 5 minutos (300 segundos) */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    callDuration >= 270 ? "bg-amber-400" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, (callDuration / 300) * 100)}%` }}
                />
              </div>

              {/* Advertencia de 270s (4m 30s) */}
              {(callDuration >= 270 || timeWarning) && (
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center justify-between gap-2 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                    <span className="text-[11.5px]">
                      Límite de 5 min próximo: restan <strong>{Math.max(0, 300 - callDuration)}s</strong>. La llamada se cerrará automáticamente.
                    </span>
                  </div>
                </div>
              )}

              {/* Visualizador de Ondas de Voz */}
              <div className="flex items-center justify-center gap-1.5 h-14">
                {[20, 45, 80, 100, 75, 40, 60, 90, 50, 30].map((h, i) => {
                  const dynamicHeight = Math.max(12, Math.min(56, Math.round((h * volume) / 50)));
                  return (
                    <div 
                      key={i} 
                      style={{ height: `${dynamicHeight}px` }}
                      className="w-1.5 bg-emerald-400 rounded-full transition-all duration-75"
                    />
                  );
                })}
              </div>

              <p className="text-xs text-slate-300 font-medium">
                {callStatus === "interrupted" 
                  ? "⚡ Interrupción detectada: Lazo te está escuchando..."
                  : "Habla libremente por tu micrófono... Lazo te responderá por voz."}
              </p>
            </div>
          )}

          {/* LLAMADA GUARDADA CON ÉXITO */}
          {callStatus === "saved" && savedCall && (
            <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-left space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-900 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span className="text-sm">Llamada registrada y persistida en el expediente</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                La llamada <strong className="font-mono">{savedCall.id}</strong> ({savedCall.duracion}) ha sido procesada con su grabación de audio sincronizada, transcripción literal y resumen clínico.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] p-3 bg-white rounded-xl border border-emerald-100 text-slate-600">
                <div>
                  <span className="text-slate-400 block font-semibold">Estado:</span>
                  <span className="font-bold text-slate-800">{savedCall.estado}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Grabación:</span>
                  <span className="font-bold text-slate-800">{savedCall.grabacionConservada ? "Audio WAV guardado" : "No conservada"}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-100">
                  <span className="text-slate-400 block font-semibold">Alerta clínica generada:</span>
                  <span className="font-bold text-emerald-800">{savedCall.alertaGenerada}</span>
                </div>
              </div>

              <button
                onClick={handleGoToCallDetail}
                className="w-full py-2.5 rounded-xl bg-[#0D4D43] hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft transition-all"
              >
                <span>Ver llamada y escuchar audio en el expediente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* MISSING API KEY */}
          {callStatus === "missing_key" && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Key className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Configuración de GEMINI_API_KEY requerida</span>
              </div>
              <p className="text-amber-800 text-[11.5px] leading-relaxed">
                El backend Gateway está activo, pero aún no tiene configurada tu clave de Google AI Studio en <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">server/.env</code>.
              </p>
            </div>
          )}

          {/* ERROR GENERAL */}
          {callStatus === "error" && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-red-800 font-bold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Error en la sesión de llamada</span>
              </div>
              <p className="text-red-700 text-[11.5px]">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Transcripción en vivo limpia (Una sola caja por turno) */}
        {transcripts.length > 0 && (
          <div className="max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2.5 text-xs text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Transcripción en vivo (Una caja por turno)
            </span>
            {transcripts.map((t, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-2xl border transition-all ${
                  t.speaker === "lazo"
                    ? "bg-emerald-50/70 border-emerald-100/90 text-slate-800"
                    : "bg-white border-slate-200/80 text-slate-800 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200/30 text-[11px]">
                  <span className={`font-bold ${t.speaker === "lazo" ? "text-emerald-800" : "text-slate-800"}`}>
                    {t.speaker === "lazo" ? "Lazo (IA)" : "Tú (Paciente)"}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {t.time}
                    {!t.isFinal && (
                      <span className="text-emerald-600 font-semibold animate-pulse ml-1.5">● hablando...</span>
                    )}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700">
                  {t.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Botones de acción inferiores */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            {callStatus === "active" ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 animate-pulse" /> Micrófono abierto
              </span>
            ) : (
              <span>NOM-004-SSA3-2012</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {callStatus === "active" || callStatus === "interrupted" ? (
              <button
                onClick={handleEndCall}
                className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-soft"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Colgar y registrar</span>
              </button>
            ) : callStatus === "saved" ? (
              <button
                onClick={() => { handleEndCall(); onClose(); }}
                className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors"
              >
                Cerrar
              </button>
            ) : (
              <>
                <button
                  onClick={() => { handleEndCall(); onClose(); }}
                  className="px-4 py-2 rounded-2xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  disabled={isBaselinePatient}
                  onClick={handleStartCall}
                  className="px-5 py-2.5 rounded-2xl bg-[#0D4D43] hover:bg-emerald-900 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isBaselinePatient ? "Solo lectura (Referencia)" : "Iniciar conversación"}</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
