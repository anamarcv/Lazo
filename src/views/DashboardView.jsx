import React from 'react';
import { 
  AlertOctagon, 
  Clock, 
  PhoneMissed, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  ChevronRight,
  TrendingUp,
  User,
  HeartPulse,
  PhoneForwarded,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { MOCK_PATIENTS, TODAY_APPOINTMENTS } from '../data/mockPatients';

export default function DashboardView({ onSelectPatient, onNavigateToPatients }) {
  const roberto = MOCK_PATIENTS.find(p => p.id === 'LZ-0482');
  const elena = MOCK_PATIENTS.find(p => p.id === 'LZ-0319');
  const carlos = MOCK_PATIENTS.find(p => p.id === 'LZ-0195');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top 4 KPI Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">Pacientes Activos</span>
            <div className="w-8 h-8 rounded-xl bg-lazo-sage flex items-center justify-center text-lazo-primary">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-lazo-text tracking-tight">142</span>
            <span className="text-xs text-slate-400 font-medium">asignados</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            100% con protocolo DM2 activo
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">Seguimiento al Día</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-800 tracking-tight">91.5%</span>
            <span className="text-xs text-slate-400 font-medium">(130 de 142)</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Llamada completada en los últimos 7 días
          </p>
        </div>

        {/* Emergencias: RED RESERVED */}
        <div className="bg-white p-6 rounded-3xl border border-red-200/80 shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-8 -mt-8 pointer-events-none"></div>
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold tracking-wider uppercase text-lazo-emergency flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-lazo-emergency animate-ping"></span>
              Emergencias
            </span>
            <div className="w-8 h-8 rounded-xl bg-lazo-emergency-light flex items-center justify-center text-lazo-emergency">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-lazo-emergency tracking-tight">1</span>
            <span className="text-xs text-red-600 font-semibold">Requiere confirmación</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Derivación protocolizada emitida hoy
          </p>
        </div>

        {/* Urgencias / Valoración prioritaria */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">Valoración Prioritaria</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight">3</span>
            <span className="text-xs text-slate-500 font-medium">casos pendientes</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Síntomas no agudos o barreras críticas
          </p>
        </div>
      </div>

      {/* Middle Row: The 3 Differentiated Priority Modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-lazo-text tracking-tight">
            Priorización Clínica del Día
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Clasificación estructurada por reglas fijas
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Module 1: EMERGENCIA (Rojo exclusivo, texto explícito, icono) */}
          <div className="bg-white rounded-3xl border-2 border-red-200 shadow-card p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-lazo-emergency"></div>
            <div>
              <div className="flex items-center justify-between mb-3 mt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-lazo-emergency-light text-lazo-emergency border border-lazo-emergency-border uppercase tracking-wider">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Emergencia Clínica
                </span>
                <span className="text-xs text-slate-400 font-medium">Hoy 08:42</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2">
                {roberto?.nombre}
              </h3>
              <p className="text-xs text-slate-500 mb-3">ID: {roberto?.id} · 62 años</p>

              <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-100/80 mb-4 text-xs text-red-950 leading-relaxed">
                <p className="font-semibold text-red-900 mb-1">
                  Glucemia 340 mg/dL + Vómitos repetidos
                </p>
                <p className="text-[11.5px] text-red-800">
                  Estado: <strong className="font-bold underline">«Derivación a urgencias indicada»</strong>. El paciente refirió imposibilidad de retener líquidos y omitió insulina.
                </p>
              </div>

              <p className="text-xs text-slate-600 mb-4">
                Instrucción auditiva pregrabada de acudir a Urgencias reproducida con éxito al paciente y cuidadora.
              </p>
            </div>

            <button
              onClick={() => onSelectPatient('LZ-0482', 'llamadas')}
              className="w-full py-3 px-4 rounded-2xl bg-lazo-emergency text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-soft"
            >
              <span>Ver alerta y transcripción</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Module 2: URGENCIAS / VALORACIÓN PRIORITARIA (Borde petróleo, contraste tipográfico, badge salvia) */}
          <div className="bg-white rounded-3xl border border-lazo-primary/30 shadow-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-lazo-sage text-lazo-primary border border-lazo-sage-border uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  Valoración Prioritaria
                </span>
                <span className="text-xs text-slate-400 font-medium">Ayer 16:20</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2">
                {elena?.nombre}
              </h3>
              <p className="text-xs text-slate-500 mb-3">ID: {elena?.id} · 58 años</p>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 mb-4 text-xs text-slate-700 leading-relaxed">
                <p className="font-semibold text-lazo-primary mb-1">
                  Visión borrosa progresiva + Sin tiras reactivas
                </p>
                <p className="text-[11.5px] text-slate-600">
                  Cambio visual no súbito de 3 semanas. Barrera económica activa para automonitoreo.
                </p>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Sugerencia clínica: canalizar a oftalmología y proveer insumos institucionales mediante Trabajo Social.
              </p>
            </div>

            <button
              onClick={() => onSelectPatient('LZ-0319', 'resumen')}
              className="w-full py-3 px-4 rounded-2xl bg-lazo-primary text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-lazo-primary-hover transition-colors shadow-soft"
            >
              <span>Valorar consulta anticipada</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Module 3: SEGUIMIENTO DE CONTACTO (Estilo operacional tenue) */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-card p-6 flex flex-col justify-between opacity-95">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                  <PhoneMissed className="w-3.5 h-3.5" />
                  Seguimiento de Contacto
                </span>
                <span className="text-xs text-slate-400 font-medium">Hoy 11:10</span>
              </div>

              <h3 className="text-base font-bold text-slate-800 mt-2">
                {carlos?.nombre}
              </h3>
              <p className="text-xs text-slate-500 mb-3">ID: {carlos?.id} · 66 años</p>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/50 mb-4 text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-800 mb-1">
                  2 llamadas no contestadas con alerta previa
                </p>
                <p className="text-[11.5px] text-slate-500">
                  Antecedente de glucemia 265 mg/dL. La falta de respuesta no se equipara a emergencia médica.
                </p>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Ruta protocolizada: turno a enfermería para intento manual y posterior búsqueda activa por promotor.
              </p>
            </div>

            <button
              onClick={() => onSelectPatient('LZ-0195', 'seguimiento')}
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
            >
              <span>Ver expediente del paciente</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Consultas de Hoy */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-lazo-text tracking-tight flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-lazo-primary" />
              Consultas Médicas de Hoy
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Información sintetizada del seguimiento inter-consultas para preparar la consulta
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-lazo-sage text-lazo-primary">
            3 consultas programadas
          </span>
        </div>

        <div className="space-y-4">
          {TODAY_APPOINTMENTS.map((apt) => (
            <div
              key={apt.id}
              className="p-5 rounded-2xl border border-slate-100/90 hover:border-lazo-mint transition-all bg-lazo-canvas/40 hover:bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start md:items-center gap-4">
                <div className="w-16 h-12 rounded-2xl bg-lazo-sage/80 text-lazo-primary font-bold text-sm flex items-center justify-center border border-lazo-mint/40 shrink-0">
                  {apt.hora}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-slate-900">{apt.pacienteNombre}</h4>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {apt.duracion}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{apt.motivo}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-lazo-primary" />
                    <span className="text-slate-500">{apt.resumenLlamada}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <button
                  onClick={() => onSelectPatient(apt.pacienteId, 'resumen')}
                  className="px-4 py-2.5 rounded-xl bg-lazo-primary text-white text-xs font-semibold hover:bg-lazo-primary-hover transition-colors flex items-center gap-2 shadow-soft"
                >
                  <span>Preparar consulta</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
