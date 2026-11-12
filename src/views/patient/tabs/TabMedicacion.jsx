import React, { useState } from 'react';
import { 
  Pill, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Minus, 
  Clock, 
  AlertCircle,
  FileText,
  Info
} from 'lucide-react';
import { getClaseFarmacologica } from '../../../data/pharmacologicalCatalog';

export default function TabMedicacion({ patient }) {
  const [subView, setSubView] = useState('tratamiento'); // 'tratamiento' | 'adherencia'
  const [selectedCell, setSelectedCell] = useState(null);

  const meds = patient.medicacion || [];
  const daysOfWeek = [
    { key: 'lun', label: 'Lunes' },
    { key: 'mar', label: 'Martes' },
    { key: 'mie', label: 'Miércoles' },
    { key: 'jue', label: 'Jueves' },
    { key: 'vie', label: 'Viernes' },
    { key: 'sab', label: 'Sábado' },
    { key: 'dom', label: 'Domingo' }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-7 animate-fadeIn">
      {/* Sub-Tabs Toggle Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Pill className="w-5 h-5 text-lazo-primary" />
            Tratamiento Farmacológico y Adherencia
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Diferenciación estricta entre indicación médica prescrita y reporte telefónico del paciente
          </p>
        </div>

        {/* Sub-tabs Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-lazo-canvas rounded-2xl border border-slate-200/70 self-start sm:self-center">
          <button
            onClick={() => setSubView('tratamiento')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              subView === 'tratamiento'
                ? 'bg-lazo-primary text-white shadow-soft'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tratamiento Farmacológico
          </button>
          <button
            onClick={() => setSubView('adherencia')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              subView === 'adherencia'
                ? 'bg-lazo-primary text-white shadow-soft'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matriz Semanal de Adherencia
          </button>
        </div>
      </div>

      {/* VISTA 1: TRATAMIENTO FARMACOLÓGICO */}
      {subView === 'tratamiento' && (
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-lazo-canvas/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5 min-w-[210px]">Medicamento / Pauta Prescrita</th>
                  <th className="py-3.5 px-5 min-w-[190px]">Indicación Clínica</th>
                  <th className="py-3.5 px-5 min-w-[200px]">Horarios Prescritos vs. Referidos</th>
                  <th className="py-3.5 px-5 min-w-[170px]">Cambios Recientes</th>
                  <th className="py-3.5 px-5 min-w-[180px]">Efectos Adversos Referidos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {meds.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 text-sm">{med.nombre}</p>
                      <div className="my-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60 leading-normal">
                          {getClaseFarmacologica(med)}
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium text-xs">{med.dosisPrescrita} · {med.frecuencia}</p>
                    </td>

                    <td className="py-4 px-5">
                      <span className="inline-block px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs leading-snug text-left">
                        {med.indicacion}
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <p className="text-slate-700">
                          <strong className="text-slate-400 font-medium">Prescrito:</strong> {med.horarioPrescrito}
                        </p>
                        <p className="text-slate-600">
                          <strong className="text-lazo-primary font-medium">Referido:</strong> {med.horarioReferido}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="text-slate-600">{med.cambiosRecientes}</span>
                    </td>

                    <td className="py-4 px-5">
                      <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-semibold leading-snug text-left border ${
                        med.posiblesEfectos !== 'Ninguno' && med.posiblesEfectos !== 'Ninguno referido'
                          ? 'bg-amber-100 text-amber-900 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                      }`}>
                        {med.posiblesEfectos}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-[11.5px] text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Nota de gobernanza: La aplicación no modifica dosis ni recomienda medicamentos de forma autónoma. Todo ajuste farmacológico es decisión exclusiva del médico tratante.
            </span>
          </div>
        </div>
      )}

      {/* VISTA 2: ADHERENCIA (CALENDARIO SEMANAL UNIFICADO) */}
      {subView === 'adherencia' && (
        <div className="space-y-6">
          {/* Adherence Summary Bar */}
          <div className="p-5 rounded-2xl bg-lazo-sage/40 border border-lazo-sage-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-lazo-primary">
                Adherencia Global Autorreportada
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-lazo-primary">
                  {patient.kpisSeguimiento?.adherenciaDosis?.porcentaje}%
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  ({patient.kpisSeguimiento?.adherenciaDosis?.tomadas} de {patient.kpisSeguimiento?.adherenciaDosis?.total} dosis con información válida)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Toma reportada
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Omisión reportada
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Sin dato / no contestó
              </span>
            </div>
          </div>

          {/* Unified Weekly Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border border-slate-100 rounded-2xl overflow-hidden">
              <thead className="bg-lazo-canvas text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-4 px-5 text-left w-56">Medicamento</th>
                  {daysOfWeek.map(d => (
                    <th key={d.key} className="py-4 px-3 font-semibold">{d.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {meds.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-5 text-left">
                      <p className="font-bold text-slate-900">{med.nombre}</p>
                      <p className="text-[11px] text-slate-400">{med.dosisPrescrita}</p>
                    </td>

                    {daysOfWeek.map(d => {
                      const status = med.adherenciaSemanal?.[d.key] || 'sin_dato';
                      return (
                        <td 
                          key={d.key} 
                          className="py-4 px-2 cursor-pointer hover:bg-lazo-sage/30 transition-colors"
                          onClick={() => setSelectedCell({ med: med.nombre, dia: d.label, status, motivo: med.motivoOmision })}
                        >
                          <div className="flex items-center justify-center">
                            {status === 'tomada' && (
                              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}
                            {status === 'omitida' && (
                              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold" title="Omisión reportada">
                                <XCircle className="w-4 h-4" />
                              </div>
                            )}
                            {status === 'sin_dato' && (
                              <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                                <Minus className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Cell Modal/Drawer popup */}
          {selectedCell && (
            <div className="p-4 rounded-2xl bg-lazo-canvas border border-slate-200 flex items-center justify-between text-xs animate-fadeIn">
              <div>
                <p className="font-bold text-slate-900">
                  {selectedCell.med} · {selectedCell.dia}
                </p>
                <p className="text-slate-600 mt-0.5">
                  Estado registrado: <strong>{selectedCell.status === 'tomada' ? 'Toma confirmada por el paciente' : selectedCell.status === 'omitida' ? `Dosis omitida (${selectedCell.motivo})` : 'Sin reporte en llamada'}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
