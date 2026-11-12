import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  User, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  X,
  FileText
} from 'lucide-react';
import { TODAY_APPOINTMENTS, MOCK_PATIENTS } from '../data/mockPatients';

export default function CalendarView({ onSelectPatient, onOpenNewAppointmentModal }) {
  const [viewMode, setViewMode] = useState('semana'); // 'semana' | 'mes'
  const [weekNumber, setWeekNumber] = useState(45);
  const [selectedAppointment, setSelectedAppointment] = useState(TODAY_APPOINTMENTS[0]);
  const [cancelledApts, setCancelledApts] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState(TODAY_APPOINTMENTS);

  // Compute dynamic day dates based on weekNumber
  const baseDayNumber = 2 + (weekNumber - 45) * 7;
  const days = [
    { name: 'Lunes', date: `${Math.max(1, baseDayNumber)} Nov`, isToday: weekNumber === 45 && false },
    { name: 'Martes', date: `${Math.max(1, baseDayNumber + 1)} Nov`, isToday: weekNumber === 45 },
    { name: 'Miércoles', date: `${Math.max(1, baseDayNumber + 2)} Nov`, isToday: false },
    { name: 'Jueves', date: `${Math.max(1, baseDayNumber + 3)} Nov`, isToday: false },
    { name: 'Viernes', date: `${Math.max(1, baseDayNumber + 4)} Nov`, isToday: false }
  ];

  const handleCancelAppointment = (id) => {
    if (confirm('¿Confirmas la cancelación de esta consulta médica?')) {
      setCancelledApts(prev => [...prev, id]);
    }
  };

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Calendario — Agenda de Consultas Médicas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Citas presenciales en unidad médica de atención primaria
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-lazo-canvas rounded-2xl border border-slate-200/70">
            <button
              onClick={() => setViewMode('semana')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'semana' ? 'bg-white text-lazo-primary shadow-soft' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('mes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'mes' ? 'bg-white text-lazo-primary shadow-soft' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mes
            </button>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
            <button 
              onClick={() => setWeekNumber(prev => Math.max(40, prev - 1))}
              className="p-2 rounded-xl bg-lazo-canvas hover:bg-slate-100 text-slate-600 transition-colors"
              title="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-2 min-w-[170px] text-center">
              Semana {weekNumber} · Noviembre 2026
            </span>
            <button 
              onClick={() => setWeekNumber(prev => Math.min(52, prev + 1))}
              className="p-2 rounded-xl bg-lazo-canvas hover:bg-slate-100 text-slate-600 transition-colors"
              title="Semana siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewAppointmentModal}
            className="px-4 py-2.5 rounded-2xl bg-lazo-primary text-white text-xs font-semibold hover:bg-lazo-primary-hover transition-colors flex items-center gap-2 shadow-soft shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva cita médica</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Weekly Calendar on Left (2/3), Today's List & Detail on Right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Main Calendar View Area */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-card p-6 overflow-x-auto">
          {viewMode === 'semana' ? (
            <div className="grid grid-cols-5 gap-3 min-w-[500px]">
              {days.map((day) => (
                <div key={day.name} className="flex flex-col">
                  <div className={`p-3 rounded-2xl text-center mb-3 ${
                    day.isToday ? 'bg-lazo-primary text-white font-bold shadow-soft' : 'bg-lazo-canvas text-slate-700'
                  }`}>
                    <p className="text-xs font-semibold uppercase">{day.name}</p>
                    <p className="text-sm font-extrabold">{day.date}</p>
                  </div>

                  {/* Day Slots */}
                  <div className="space-y-2.5 min-h-[380px]">
                    {day.isToday && appointmentsList.map((apt) => {
                      const isCancelled = cancelledApts.includes(apt.id);
                      const isSelected = selectedAppointment?.id === apt.id;
                      return (
                        <div
                          key={apt.id}
                          onClick={() => setSelectedAppointment(apt)}
                          className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                            isCancelled
                              ? 'bg-slate-50 border-slate-200 opacity-50 line-through'
                              : isSelected
                              ? 'bg-lazo-sage/70 border-lazo-primary shadow-soft ring-1 ring-lazo-primary/30'
                              : 'bg-white border-slate-200/80 hover:border-lazo-mint'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-slate-800 text-[11px] mb-1">
                            <span>{apt.hora}</span>
                            <span className="text-slate-400 font-normal">{apt.duracion}</span>
                          </div>
                          <p className="font-bold text-slate-900 text-xs truncate">{apt.pacienteNombre}</p>
                          <p className="text-slate-500 text-[10px] truncate mt-0.5">{apt.motivo}</p>
                        </div>
                      );
                    })}

                    {!day.isToday && (
                      <div className="h-full border border-dashed border-slate-200 rounded-2xl p-4 flex items-center justify-center text-slate-300 text-[11px]">
                        Sin consultas
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Month View Grid */
            <div className="space-y-3">
              <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
                <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 30 }, (_, i) => {
                  const dayNum = i + 1;
                  const isCurrentDay = dayNum === 3;
                  const hasApts = dayNum === 3;
                  return (
                    <div
                      key={dayNum}
                      className={`p-3 min-h-[80px] rounded-2xl border text-xs flex flex-col justify-between transition-all ${
                        isCurrentDay ? 'bg-lazo-sage/40 border-lazo-primary font-bold' : 'bg-lazo-canvas/50 border-slate-100'
                      }`}
                    >
                      <span className={isCurrentDay ? 'text-lazo-primary' : 'text-slate-600'}>{dayNum}</span>
                      {hasApts && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-lazo-primary text-white font-medium truncate">
                          3 citas
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Detalle de Cita Seleccionada */}
        <div className="space-y-6">
          {selectedAppointment && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-lazo-primary">
                  Detalle de la Consulta
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  cancelledApts.includes(selectedAppointment.id)
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-50 text-emerald-800'
                }`}>
                  {cancelledApts.includes(selectedAppointment.id) ? 'Cancelada' : 'Confirmada'}
                </span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {selectedAppointment.pacienteNombre}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  ID: {selectedAppointment.pacienteId} · Horario: {selectedAppointment.hora} hrs ({selectedAppointment.duracion})
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-lazo-canvas border border-slate-100 text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-800">Motivo de consulta:</p>
                <p>{selectedAppointment.motivo}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-lazo-primary">Contexto del seguimiento telefónico:</p>
                <p className="text-[11.5px]">{selectedAppointment.resumenLlamada}</p>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onSelectPatient(selectedAppointment.pacienteId, 'resumen')}
                  className="w-full py-2.5 px-4 rounded-2xl bg-lazo-primary text-white text-xs font-semibold hover:bg-lazo-primary-hover flex items-center justify-center gap-2 shadow-soft transition-colors"
                >
                  <span>Abrir expediente clínico</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {!cancelledApts.includes(selectedAppointment.id) && (
                  <button
                    onClick={() => handleCancelAppointment(selectedAppointment.id)}
                    className="w-full py-2 px-4 rounded-2xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-semibold transition-colors"
                  >
                    Cancelar consulta médica
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Resumen de carga semanal */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider text-slate-400">
              Carga Semanal de Consultas
            </h4>
            <div className="flex justify-between text-slate-600 pt-1">
              <span>Total programadas esta semana:</span>
              <strong className="text-slate-900 font-bold">18 consultas</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Consultas derivadas de alertas Lazo:</span>
              <strong className="text-lazo-primary font-bold">3 pacientes</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
