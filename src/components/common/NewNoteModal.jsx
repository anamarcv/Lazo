import React, { useState } from 'react';
import { X, FileText, Link as LinkIcon, User, ShieldCheck } from 'lucide-react';
import { CURRENT_DOCTOR } from '../../data/mockPatients';

export default function NewNoteModal({ isOpen, onClose, patient, onSaveNote }) {
  const [tipo, setTipo] = useState('Nota de seguimiento');
  const [contenido, setContenido] = useState('');
  const [vinculadaLlamada, setVinculadaLlamada] = useState(patient?.llamadas?.[0]?.id || '');

  if (!isOpen || !patient) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contenido.trim()) return;

    onSaveNote({
      id: `not-${Date.now()}`,
      tipo,
      fechaHora: 'Hoy · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hrs',
      autor: CURRENT_DOCTOR.name,
      vinculadaLlamada: vinculadaLlamada || null,
      contenido,
      estado: 'Firmada'
    });
    setContenido('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-xl w-full p-7 space-y-6 animate-scaleUp">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lazo-sage text-lazo-primary flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Redactar Nota Clínica (NOM-004)
              </h3>
              <p className="text-[11px] text-slate-400">Paciente: {patient.nombre} (ID: {patient.id})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Tipo de Nota
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-lazo-primary"
              >
                <option value="Nota de seguimiento">Nota de seguimiento telefónico</option>
                <option value="Consulta médica">Consulta médica presencial</option>
                <option value="Educación en salud">Educación en salud / Enfermería</option>
                <option value="Administrativa">Administrativa / Trabajo Social</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Vincular a Llamada (Opcional)
              </label>
              <select
                value={vinculadaLlamada}
                onChange={(e) => setVinculadaLlamada(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-lazo-primary"
              >
                <option value="">Sin vinculación a llamada</option>
                {patient.llamadas?.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fechaHora.split('·')[0]} - {c.tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Contenido Clínico de la Nota
            </label>
            <textarea
              rows="6"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Describa la evolución, hallazgos verificados, ajuste terapéutico o plan acordado con el paciente..."
              className="w-full p-4 rounded-2xl bg-lazo-canvas border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-lazo-primary leading-relaxed"
              required
            ></textarea>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-slate-700">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Firmante: <strong>{CURRENT_DOCTOR.name}</strong>
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Trazabilidad legal garantizada
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
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
              Guardar y Firmar Nota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
