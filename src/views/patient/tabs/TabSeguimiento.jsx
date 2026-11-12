import React, { useState } from 'react';
import { 
  Activity, 
  Pill, 
  Target, 
  Calendar, 
  Heart, 
  AlertTriangle, 
  Info, 
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

export default function TabSeguimiento({ patient, onNavigateTab }) {
  const [contextFilter, setContextFilter] = useState('todos'); // 'todos' | 'ayuno' | 'posprandial'
  const [selectedPoint, setSelectedPoint] = useState(null);

  const kpis = patient.kpisSeguimiento;
  const lecturas = patient.lecturasGlucosa || [];

  const filteredLecturas = lecturas.filter(l => {
    if (contextFilter === 'ayuno') return l.contexto === 'ayuno';
    if (contextFilter === 'posprandial') return l.contexto === 'posprandial';
    return true;
  });

  // Calculate SVG coordinates for capillary glucose chart
  const minVal = 60;
  const maxVal = 360;
  const chartHeight = 200;
  const chartWidth = 650;
  const padLeft = 45;
  const padBottom = 25;
  const padTop = 15;
  const padRight = 20;

  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const getY = (val) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return padTop + innerH - ((clamped - minVal) / (maxVal - minVal)) * innerH;
  };

  const getX = (idx, total) => {
    if (total <= 1) return padLeft + innerW / 2;
    return padLeft + (idx / (total - 1)) * innerW;
  };

  const ayunoMinY = getY(patient.metasIndividuales?.ayunoMin || 80);
  const ayunoMaxY = getY(patient.metasIndividuales?.ayunoMax || 130);

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* 4 KPIs with Explicit Denominators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Adherencia al Tratamiento</span>
            <Pill className="w-4 h-4 text-lazo-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-lazo-text tracking-tight">
              {kpis.adherenciaDosis.porcentaje}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({kpis.adherenciaDosis.tomadas} de {kpis.adherenciaDosis.total} dosis)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Dosis reportadas tomadas en 14 días</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lecturas en Meta</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-800 tracking-tight">
              {kpis.glucosaEnMeta.porcentaje}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({kpis.glucosaEnMeta.enMeta} de {kpis.glucosaEnMeta.total} lecturas)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Objetivo individualizado asignado</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bitácoras de Glucosa</span>
            <Calendar className="w-4 h-4 text-lazo-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-lazo-text tracking-tight">
              {kpis.bitacorasDias.conRegistro}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              de {kpis.bitacorasDias.totalDias} días
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Días con $\ge$ 1 medición capilar</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presión Domiciliaria</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-lazo-text tracking-tight">
              {kpis.presionDomiciliaria.sistolica}/{kpis.presionDomiciliaria.diastolica}
            </span>
            <span className="text-xs text-slate-400 font-medium">mmHg</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {kpis.presionDomiciliaria.fuente} ({kpis.presionDomiciliaria.lecturas} tomas)
          </p>
        </div>
      </div>

      {/* Capillary Glucose Evolution Chart */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-lazo-primary" />
              Evolución de Glucosa Capilar Autorreportada
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mediciones puntuales captadas por voz en llamadas. No equivale a monitor continuo (TIR).
            </p>
          </div>

          {/* Quick Context Filter Chips */}
          <div className="flex items-center gap-2 bg-lazo-canvas p-1 rounded-2xl border border-slate-200/60 self-start md:self-center">
            <button
              onClick={() => setContextFilter('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                contextFilter === 'todos' ? 'bg-white text-lazo-primary shadow-soft' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todas ({lecturas.length})
            </button>
            <button
              onClick={() => setContextFilter('ayuno')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                contextFilter === 'ayuno' ? 'bg-white text-lazo-primary shadow-soft' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              En Ayunas ({lecturas.filter(l => l.contexto === 'ayuno').length})
            </button>
            <button
              onClick={() => setContextFilter('posprandial')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                contextFilter === 'posprandial' ? 'bg-white text-lazo-primary shadow-soft' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Posprandial ({lecturas.filter(l => l.contexto === 'posprandial').length})
            </button>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="relative overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56 select-none">
            {/* Shaded Target Range Band (80 - 130 mg/dL) */}
            <rect
              x={padLeft}
              y={ayunoMaxY}
              width={innerW}
              height={ayunoMinY - ayunoMaxY}
              fill="#EBF5F3"
              opacity="0.8"
            />
            <text x={padLeft + 8} y={ayunoMaxY + 14} fontSize="9" fill="#0D4744" fontWeight="600">
              Rango meta en ayuno (80 - 130 mg/dL)
            </text>

            {/* Grid Lines */}
            {[70, 130, 200, 300].map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line x1={padLeft} y1={y} x2={chartWidth - padRight} y2={y} stroke="#F1F5F9" strokeDasharray="3 3" />
                  <text x={padLeft - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94A3B8" fontWeight="500">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Connecting line */}
            {filteredLecturas.length > 1 && (
              <polyline
                fill="none"
                stroke="#0D4744"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={filteredLecturas
                  .map((l, i) => `${getX(i, filteredLecturas.length)},${getY(l.valor)}`)
                  .join(' ')}
              />
            )}

            {/* Interactive Data Points */}
            {filteredLecturas.map((l, i) => {
              const cx = getX(i, filteredLecturas.length);
              const cy = getY(l.valor);
              const isOut = !l.dentroMeta;
              const isSelected = selectedPoint?.id === l.id;

              return (
                <g 
                  key={l.id} 
                  className="cursor-pointer group"
                  onClick={() => setSelectedPoint(l)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 7 : (isOut ? 5.5 : 4.5)}
                    fill={isOut ? (l.valor >= 300 ? '#DC2626' : '#EA580C') : '#0D4744'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all duration-150 group-hover:scale-125"
                  />
                  {/* Date Label on Bottom */}
                  <text
                    x={cx}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    fontSize="8.5"
                    fill="#94A3B8"
                    fontWeight="500"
                  >
                    {l.fecha.slice(5)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Selected Point Inspector Card */}
          {selectedPoint && (
            <div className="mt-4 p-4 rounded-2xl bg-lazo-canvas border border-slate-200/80 flex items-center justify-between text-xs animate-fadeIn">
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1.5 rounded-xl font-bold text-sm ${
                  selectedPoint.valor >= 300 ? 'bg-red-100 text-red-700' :
                  !selectedPoint.dentroMeta ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedPoint.valor} mg/dL
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {selectedPoint.fecha} a las {selectedPoint.hora} hrs ({selectedPoint.contexto})
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {selectedPoint.nota || 'Sin observaciones adicionales registradas.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-slate-400 hover:text-slate-600 font-semibold text-xs"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle Row: 3 Independent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Síntomas Reportados */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-lazo-primary mb-3">
              Síntomas Reportados
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs mb-3">
              <span className="font-semibold text-slate-800">Estado actual:</span>
              <p className="text-slate-600 mt-1">{patient.sintomasReportados?.estadoActual || 'Ninguno referido'}</p>
            </div>
            <p className="text-xs text-slate-500">
              <strong>Histórico de alertas:</strong> {patient.sintomasReportados?.alertasHistoricas || 'Sin eventos previos'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Diferenciar ausencia de síntomas de ausencia de registro.
          </div>
        </div>

        {/* Efectos Adversos */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-lazo-primary mb-3">
              Efectos Adversos Sospechados
            </h4>
            {patient.efectosAdversos?.length > 0 ? (
              patient.efectosAdversos.map((ea, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs mb-3">
                  <p className="font-bold text-amber-900">{ea.sintoma}</p>
                  <p className="text-slate-600 mt-1">Fármaco asociado por paciente: <strong>{ea.medicamentoSospechado}</strong></p>
                  <p className="text-[11px] text-slate-500 mt-1">Gravedad referida: {ea.gravedad} · {ea.persistencia}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-3">No se refieren molestias asociadas a fármacos.</p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Nunca atribuir causalidad médica automática.
          </div>
        </div>

        {/* Barreras o Necesidades */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-lazo-primary mb-3">
              Barreras o Necesidades
            </h4>
            {patient.barreras?.length > 0 ? (
              patient.barreras.map((b, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-lazo-sage text-lazo-primary text-[10px] font-bold uppercase">
                    {b.tipo}
                  </span>
                  <p className="font-semibold text-slate-800 mt-2">{b.descripcion}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{b.evolucion}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-3">Sin barreras activas identificadas.</p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Canalización con Trabajo Social cuando proceda.
          </div>
        </div>
      </div>

      {/* Franja Inferior: Último Seguimiento */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-lazo-sage text-lazo-primary flex items-center justify-center font-bold text-sm shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Último contacto telefónico registrado</p>
            <p className="text-sm font-bold text-slate-800">
              {patient.llamadas?.[0]?.fechaHora} ({patient.llamadas?.[0]?.direccion})
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('llamadas')}
          className="px-4 py-2.5 rounded-2xl bg-lazo-primary text-white text-xs font-semibold hover:bg-lazo-primary-hover transition-colors flex items-center gap-2 self-start sm:self-center shadow-soft"
        >
          <span>Ver llamada completa y transcripción</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
