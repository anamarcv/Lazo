import React, { useState } from 'react';
import { 
  FlaskConical, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';

export default function TabLaboratorios({ patient }) {
  const [selectedAnalyte, setSelectedAnalyte] = useState('hba1c'); // 'hba1c' | 'lipidos' | 'uacr'
  const [orderedStudies, setOrderedStudies] = useState([]);
  const labs = patient.laboratorios;

  const handleOrderStudy = (estudio) => {
    setOrderedStudies(prev => [...prev, estudio]);
  };

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* 4 Resultados Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {labs?.clave?.map((item) => (
          <div key={item.nombre} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.nombre}</span>
              <FlaskConical className="w-4 h-4 text-lazo-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{item.valor}</span>
              <span className="text-xs text-slate-500 font-semibold">{item.unidad}</span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Meta: {item.meta}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0 ${
                item.fueraMeta ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {item.fueraMeta ? 'Fuera de meta' : 'En meta'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interpretación Clínica Contextualizada */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-lazo-primary flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-lazo-primary" />
          Interpretación General Contextualizada
        </h3>
        <div className="p-4 rounded-2xl bg-lazo-canvas border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
          <p>{labs?.interpretacion}</p>
        </div>
        <p className="text-[11px] text-slate-400">
          Nota de rigor clínico: uACR $\ge$ 30 mg/g corresponde a albuminuria moderadamente aumentada (A2). Un eGFR aislado de 76 mL/min/1.73m² requiere vigilancia temporal.
        </p>
      </div>

      {/* Gráfico Histórico Interactivo con Modo Comparar Lípidos */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Evolución Histórica de Analitos de Laboratorio
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Resultados confirmados por químico/laboratorio (distintos de mediciones capilares)
            </p>
          </div>

          <div className="flex items-center gap-2 bg-lazo-canvas p-1 rounded-2xl border border-slate-200/70">
            <button
              onClick={() => setSelectedAnalyte('hba1c')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedAnalyte === 'hba1c' ? 'bg-white text-lazo-primary shadow-soft' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              HbA1c (%)
            </button>
            <button
              onClick={() => setSelectedAnalyte('lipidos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedAnalyte === 'lipidos' ? 'bg-white text-lazo-primary shadow-soft' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Perfil Lipídico (mg/dL)
            </button>
            <button
              onClick={() => setSelectedAnalyte('uacr')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedAnalyte === 'uacr' ? 'bg-white text-lazo-primary shadow-soft' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              uACR (mg/g)
            </button>
          </div>
        </div>

        {/* Visual Graph Area */}
        <div className="p-6 rounded-2xl bg-lazo-canvas/40 border border-slate-100">
          {selectedAnalyte === 'hba1c' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-slate-700">Trayectoria de HbA1c (Meta individual: &lt; 7.0%)</span>
                <span className="text-emerald-700 font-bold">Tendencia a la baja (-1.1% en 6 meses)</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {labs?.historico?.map((h) => (
                  <div key={h.fecha} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-soft">
                    <p className="text-[11px] text-slate-400 font-medium">{h.fecha}</p>
                    <p className="text-2xl font-extrabold text-lazo-primary mt-1">{h.hba1c}%</p>
                    <p className="text-[11px] text-slate-500 mt-1">Glucosa en ayuno: {h.glucosaLab} mg/dL</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedAnalyte === 'lipidos' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-xs font-semibold mb-2">
                <span className="flex items-center gap-1.5 text-slate-800"><span className="w-3 h-3 rounded bg-amber-500"></span> Colesterol Total</span>
                <span className="flex items-center gap-1.5 text-rose-700"><span className="w-3 h-3 rounded bg-rose-500"></span> LDL</span>
                <span className="flex items-center gap-1.5 text-emerald-700"><span className="w-3 h-3 rounded bg-emerald-500"></span> HDL</span>
                <span className="flex items-center gap-1.5 text-purple-700"><span className="w-3 h-3 rounded bg-purple-500"></span> Triglicéridos</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {labs?.historico?.map((h) => (
                  <div key={h.fecha} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-soft space-y-1.5 text-xs">
                    <p className="text-[11px] text-slate-400 font-bold mb-2">{h.fecha}</p>
                    <p className="flex justify-between"><span>Colesterol:</span> <strong className="text-amber-700">{h.colTotal} mg/dL</strong></p>
                    <p className="flex justify-between"><span>LDL:</span> <strong className="text-rose-700">{h.ldl} mg/dL</strong></p>
                    <p className="flex justify-between"><span>HDL:</span> <strong className="text-emerald-700">{h.hdl} mg/dL</strong></p>
                    <p className="flex justify-between"><span>Triglicéridos:</span> <strong className="text-purple-700">{h.tri} mg/dL</strong></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedAnalyte === 'uacr' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-slate-700">Relación Albúmina / Creatinina Urinaria (uACR)</span>
                <span className="text-amber-800 font-bold">Categoría A2 (30 - 300 mg/g)</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {labs?.historico?.map((h) => (
                  <div key={h.fecha} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-soft">
                    <p className="text-[11px] text-slate-400 font-medium">{h.fecha}</p>
                    <p className="text-2xl font-extrabold text-amber-700 mt-1">{h.uacr} <span className="text-xs font-normal">mg/g</span></p>
                    <p className="text-[11px] text-slate-500 mt-1">eGFR pareado: {h.egfr} mL/min</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Próximos Estudios Sugeridos con Acción Interactiva */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
            Estudios de Laboratorio Próximos o Pendientes
          </h4>
          <div className="space-y-2.5">
            {labs?.proximosEstudios?.map((est, idx) => {
              const isOrdered = orderedStudies.includes(est.estudio);
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{est.estudio}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Fecha sugerida: {est.fechaSugerida}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full font-semibold text-[11px] whitespace-nowrap shrink-0 inline-flex items-center ${
                      isOrdered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {isOrdered ? 'Orden médica firmada' : est.estado}
                    </span>
                    {!isOrdered && (
                      <button
                        onClick={() => handleOrderStudy(est.estudio)}
                        className="px-3.5 py-1.5 rounded-xl bg-lazo-primary text-white text-xs font-semibold hover:bg-lazo-primary-hover transition-colors flex items-center gap-1.5 shadow-soft"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Generar orden médica</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
