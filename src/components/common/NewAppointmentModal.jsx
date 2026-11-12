import React, { useState } from 'react';
import { X, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';
import { MOCK_PATIENTS } from '../../data/mockPatients';

export default function NewAppointmentModal({ isOpen, onClose, initialPatientId, onSaveAppointment }) {
  const [patientId, setPatientId] = useState(initialPatientId || MOCK_PATIENTS[0].id);
  const [fecha, setFecha] = useState('2026-11-04');
  const [hora, setHora] = useState('10:00');
  const [duracion, setDuracion] = useState('20 min');
  const [motivo, setMotivo] = useState('Consulta de seguimiento y revisión de tratamiento DM2');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const patient = MOCK_PATIENTS.find(p => p.id === patientId);
    onSaveAppointment({
      id: `apt-${Date.now()}`,
      hora,
      pacienteId: patientId,
      pacienteNombre: patient?.nombre || 'Paciente',
      motivo,
      estado: 'Confirmada',
      duracion,
      resumenLlamada: 'Cita médica agendada desde el portal Lazo'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full p-7 space-y-6 animate-scaleUp">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lazo-sage text-lazo-primary flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Agendar Nueva Consulta Médica
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Paciente
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-lazo-primary"
            >
              {MOCK_PATIENTS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} (ID: {p.id}) · {p.prioridadClinica}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Fecha de Consulta
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-lazo-primary"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Horario
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-lazo-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Duración Estimada
            </label>
            <select
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-lazo-primary"
            >
              <option value="15 min">15 minutos (Seguimiento breve)</option>
              <option value="20 min">20 minutos (Consulta ordinaria)</option>
              <option value="30 min">30 minutos (Revisión integral)</option>
              <option value="45 min">45 minutos (Educación e inicio de insulina)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Motivo Clínico de la Cita
            </label>
            <textarea
              rows="3"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full p-3 rounded-2xl bg-lazo-canvas border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-lazo-primary"
              required
            ></textarea>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-lazo-primary text-white font-semibold hover:bg-lazo-primary-hover shadow-soft"
            >
              Guardar en Agenda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
