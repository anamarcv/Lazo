import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Bell, 
  Sliders, 
  Lock, 
  Info, 
  AlertTriangle,
  Building,
  Check
} from 'lucide-react';
import { CURRENT_DOCTOR } from '../data/mockPatients';

export default function SettingsView() {
  const [unidadGlucosa, setUnidadGlucosa] = useState('mg/dL');
  const [autoAudio, setAutoAudio] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleToggleUnidad = () => {
    setUnidadGlucosa(prev => prev === 'mg/dL' ? 'mmol/L' : 'mg/dL');
    showNotice();
  };

  const handleToggleAudio = () => {
    setAutoAudio(prev => !prev);
    showNotice();
  };

  const showNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-7 animate-fadeIn">
      {savedNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Preferencia actualizada correctamente.</span>
        </div>
      )}

      {/* Perfil Profesional */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-lazo-primary flex items-center gap-2">
          <User className="w-4 h-4 text-lazo-primary" />
          Perfil Profesional del Médico Tratante
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-lazo-canvas border border-slate-100">
            <span className="text-slate-400 font-medium">Nombre Completo</span>
            <p className="text-sm font-bold text-slate-900 mt-1">{CURRENT_DOCTOR.name}</p>
          </div>
          <div className="p-4 rounded-2xl bg-lazo-canvas border border-slate-100">
            <span className="text-slate-400 font-medium">Cédula Profesional</span>
            <p className="text-sm font-bold text-slate-900 mt-1">{CURRENT_DOCTOR.cedula}</p>
          </div>
          <div className="p-4 rounded-2xl bg-lazo-canvas border border-slate-100">
            <span className="text-slate-400 font-medium">Especialidad</span>
            <p className="text-sm font-bold text-slate-900 mt-1">{CURRENT_DOCTOR.especialidad}</p>
          </div>
          <div className="p-4 rounded-2xl bg-lazo-canvas border border-slate-100">
            <span className="text-slate-400 font-medium">Institución Adscrita</span>
            <p className="text-sm font-bold text-slate-900 mt-1">{CURRENT_DOCTOR.institucion}</p>
          </div>
        </div>
      </div>

      {/* Parámetros del Protocolo y Restricciones V1 (Sólo Lectura) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-lazo-primary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-lazo-primary" />
            Parámetros del Protocolo de Seguridad (V1)
          </h3>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
            Protegido / Sólo Lectura
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Lock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-slate-800">Frecuencia de llamadas automatizadas</p>
              <p className="text-slate-500 mt-0.5">
                Onboarding: 2 llamadas semanales (primeros 15 días). Seguimiento posterior: 1 llamada semanal (o quincenal con justificación clínica).
                <strong className="text-slate-700"> No es editable libremente por el usuario para resguardar la validez del piloto.</strong>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Lock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-slate-800">Alertas clínicas de urgencia obligatorias</p>
              <p className="text-slate-500 mt-0.5">
                Las alertas de seguridad ante criterios de peligro (hiperglucemia &gt;250 con síntomas, hipoglucemia &lt;54 mg/dL o sospecha de cetoacidosis)
                <strong className="text-slate-700"> no pueden desactivarse ni silenciarse.</strong>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Lock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-slate-800">Mensajes auditivos pregrabados validados</p>
              <p className="text-slate-500 mt-0.5">
                Las instrucciones de emergencia reproducidas al paciente son grabaciones humanas certificadas por el comité clínico; la IA no improvisa consejos de voz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preferencias de Visualización Interactivas */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-lazo-primary flex items-center gap-2">
          <Sliders className="w-4 h-4 text-lazo-primary" />
          Preferencias de Consulta
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-lazo-canvas border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Unidades de glucemia</p>
              <p className="text-slate-400 text-[11px]">Estándar mexicano para glucosa plasmática y capilar</p>
            </div>
            <button
              onClick={handleToggleUnidad}
              className="font-bold text-lazo-primary bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-soft hover:bg-lazo-sage/30 transition-colors"
            >
              {unidadGlucosa}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-lazo-canvas border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Reproducción de audios</p>
              <p className="text-slate-400 text-[11px]">Carga previa del reproductor al abrir detalle de llamada</p>
            </div>
            <button
              onClick={handleToggleAudio}
              className={`font-bold px-4 py-2 rounded-xl border shadow-soft transition-colors ${
                autoAudio ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {autoAudio ? 'Habilitado' : 'Deshabilitado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
