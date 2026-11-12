import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  AlertTriangle, 
  Download, 
  CheckCircle2, 
  HelpCircle, 
  Activity, 
  Scale,
  Stethoscope,
  ClipboardCheck,
  Calendar,
  Eye,
  Footprints,
  FlaskConical,
  Bell,
  ArrowRight,
  ArrowUpRight,
  FileSpreadsheet,
  FileText,
  X,
  Check
} from 'lucide-react';
import { POPULATION_REPORTS_DATA } from '../data/mockReports';

export default function PopulationReportsView() {
  const [activeReportTab, setActiveReportTab] = useState('clinicos'); // 'clinicos' | 'adherencia' | 'barreras'
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState('hba1c');
  const data = POPULATION_REPORTS_DATA;

  const handleDownload = (format) => {
    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
      setShowExportModal(false);
    }, 1800);
  };

  return (
    <div className="space-y-7 animate-fadeIn relative">
      {/* Header and Sub-Tabs Bar */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EBF7F2] text-[#0D4D43] flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Reportes Clínicos Poblacionales
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Resultados clínicos, evolución, complicaciones y acciones preventivas de la cohorte en Lazo
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-lazo-canvas rounded-2xl border border-slate-200/70">
            <button
              onClick={() => setActiveReportTab('clinicos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeReportTab === 'clinicos' ? 'bg-[#0D4D43] text-white shadow-soft' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resultados Clínicos
            </button>
            <button
              onClick={() => setActiveReportTab('adherencia')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeReportTab === 'adherencia' ? 'bg-[#0D4D43] text-white shadow-soft' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Adherencia
            </button>
            <button
              onClick={() => setActiveReportTab('barreras')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeReportTab === 'barreras' ? 'bg-[#0D4D43] text-white shadow-soft' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Barreras y Apoyo
            </button>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 rounded-2xl bg-lazo-canvas hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar reporte</span>
          </button>
        </div>
      </div>

      {/* 4 Indicadores Superiores (Fila de 4 tarjetas con icono circular en verde) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#EBF7F2] text-[#0D4D43] flex items-center justify-center shrink-0 mt-0.5">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600">Pacientes en programa</span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">{data.kpis.pacientesPrograma}</p>
            <p className="text-xs text-slate-400 mt-1">Cohorte activa de primer nivel</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#EBF7F2] text-[#0D4D43] flex items-center justify-center shrink-0 mt-0.5">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600">Adherencia poblacional</span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">{data.kpis.adherenciaPoblacional}%</p>
            <p className="text-xs text-slate-400 mt-1">Dosis reportadas tomadas / válidas</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#EBF7F2] text-[#0D4D43] flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600">Pacientes en meta clínica (HbA1c)</span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">{data.kpis.porcentajeEnMeta}%</p>
            <p className="text-xs text-slate-400 mt-1">{data.kpis.pacientesEnMeta} de {data.kpis.pacientesPrograma} con HbA1c en objetivo</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#EBF7F2] text-[#0D4D43] flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600">Alertas clínicas en periodo</span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">{data.kpis.alertasTotalesPeriodo}</p>
            <p className="text-xs text-slate-400 mt-1">Identificadas inter-consultas</p>
          </div>
        </div>
      </div>

      {/* PESTAÑA 1: RESULTADOS CLÍNICOS (TABLERO UNIFICADO PRINCIPAL) */}
      {activeReportTab === 'clinicos' && (
        <div className="space-y-6 animate-fadeIn">
          {/* PRIMERA FILA: EVOLUCIÓN LONGITUDINAL Y COMPARATIVA PAREADA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Izquierda (Col 8): Evolución longitudinal de resultados clínicos */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-card p-6 md:p-7 space-y-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-5 h-5 text-[#0D4D43]" />
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Evolución longitudinal de resultados clínicos
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Porcentaje de pacientes en meta a lo largo del seguimiento desde el ingreso a Lazo.
                </p>
              </div>

              {/* Selector de Indicadores Clínicos */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 border border-slate-200/70 rounded-2xl w-fit">
                {[
                  { id: 'hba1c', label: 'HbA1c' },
                  { id: 'glucosa', label: 'Glucosa' },
                  { id: 'hta', label: 'Presión (HTA)' },
                  { id: 'renal', label: 'Función Renal' },
                  { id: 'ldl', label: 'LDL' },
                  { id: 'hdl', label: 'HDL' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedIndicator(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedIndicator === tab.id
                        ? 'bg-[#0D4D43] text-white shadow-soft'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Contenedor Gráfica + Tarjeta Lateral de Resumen */}
              {(() => {
                const currentInd = data.evolucionLongitudinal?.[selectedIndicator] || data.evolucionLongitudinal?.hba1c;
                if (!currentInd) return null;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-2">
                    {/* Gráfica de Barras con Eje Y (Col 8) */}
                    <div className="md:col-span-8">
                      <div className="flex">
                        {/* Eje Y con porcentajes */}
                        <div className="flex flex-col justify-between pr-3 py-1 text-right text-[11px] font-medium text-slate-400 h-44 select-none shrink-0 w-12">
                          <span>100%</span>
                          <span>80%</span>
                          <span>60%</span>
                          <span>40%</span>
                          <span>20%</span>
                          <span>0%</span>
                        </div>

                        {/* Área de barras con líneas de guía horizontales */}
                        <div className="flex-1 relative h-44 flex items-end justify-between border-l border-b border-slate-200/80 px-2 sm:px-4">
                          {/* Líneas de guía horizontales */}
                          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                            <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
                            <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
                            <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
                            <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
                            <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
                            <div className="w-full h-0"></div>
                          </div>

                          {/* 7 Columnas de datos */}
                          {currentInd.series.map((item, idx) => {
                            let barPercent = item.enMeta;
                            let displayLabel = `${item.enMeta}%`;

                            if (selectedIndicator === 'renal') {
                              barPercent = Math.min(100, Math.round((item.egfr / 100) * 100));
                              displayLabel = `${item.egfr}`;
                            } else if (selectedIndicator === 'hdl') {
                              barPercent = Math.min(100, Math.round((item.valorPromedio / 60) * 100));
                              displayLabel = `${item.valorPromedio}`;
                            }

                            const barHeightPixels = Math.max(16, Math.round((barPercent / 100) * 140));

                            return (
                              <div key={idx} className="flex flex-col items-center z-10 w-9 sm:w-11">
                                <span className="text-[11px] font-extrabold text-slate-800 mb-1.5 whitespace-nowrap">
                                  {displayLabel}
                                </span>
                                <div 
                                  style={{ height: `${barHeightPixels}px` }}
                                  className="w-full bg-[#0D4D43] hover:bg-emerald-900 rounded-t-lg transition-all cursor-pointer shadow-xs"
                                  title={`${item.periodo}: ${displayLabel} (${item.nEvaluables} pacientes)`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Eje X: Etiquetas de periodo y n de pacientes */}
                      <div className="flex pl-12 pr-2 sm:pr-4 pt-2 justify-between">
                        {currentInd.series.map((item, idx) => (
                          <div key={idx} className="w-9 sm:w-11 text-center">
                            <p className="text-xs font-bold text-slate-800 leading-tight">
                              {item.periodo}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              n = {item.nEvaluables}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tarjeta Derecha: Resumen clínico del indicador (Col 4) */}
                    <div className="md:col-span-4 p-4 rounded-2xl border border-slate-200/80 bg-[#F8FAFC]/60 space-y-3.5">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                          Resumen clínico del indicador
                        </h4>
                        <p className="text-xs font-bold text-slate-800 mt-1">
                          {currentInd.nombre}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {currentInd.tipoMeta}
                        </p>
                      </div>

                      <div className="space-y-2.5 pt-1 border-t border-slate-200/60 text-xs">
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="text-[11.5px]">En meta al ingreso:</span>
                          <span className="font-bold text-slate-900">{currentInd.metaAlIngreso}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#EBF7F2] text-[#0D4D43] font-bold text-xs flex justify-between items-center">
                          <span>En meta al mes 6:</span>
                          <span className="text-sm font-extrabold">{currentInd.metaUltimoSeguimiento}</span>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[11.5px] text-slate-600">Cambio observado:</span>
                          <div className="flex items-center gap-1 font-bold text-emerald-700 text-xs text-right">
                            <span>{currentInd.cambioObservado}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-slate-600">
                          <span className="text-[11.5px]">Pacientes evaluables:</span>
                          <span className="font-bold text-slate-900">{currentInd.totalEvaluables}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Derecha (Col 4): Comparativa de resultados clínicos pareados */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-card p-6 md:p-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <Scale className="w-5 h-5 text-[#0D4D43]" />
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Comparativa de resultados clínicos pareados
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cambio de mediciones en los mismos pacientes (n = {data.resultadosClinicosPareados.nCohorte}).
                </p>
              </div>

              {/* 4 Indicadores Clínicos Pareados Simultáneos */}
              <div className="space-y-3">
                {data.resultadosClinicosPareados.indicadores.map((ind) => (
                  <div 
                    key={ind.indicador}
                    className="flex items-center justify-between py-3 px-3.5 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50/60 transition-colors gap-2"
                  >
                    <span className="font-bold text-slate-800 text-xs">
                      {ind.indicador}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 shrink-0">
                      <span>{ind.basal}</span>
                      <span className="text-slate-300 font-normal">→</span>
                      <span className="text-slate-900 font-bold">{ind.actual}</span>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl bg-[#EBF7F2] text-[#0D4D43] font-bold text-xs whitespace-nowrap shrink-0 border border-emerald-200/50">
                      {ind.cambio}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[10.5px] text-slate-400 border-t border-slate-100 pt-3">
                Evaluación en cohorte con registros completos basal y corte a 6 meses.
              </p>
            </div>
          </div>

          {/* SEGUNDA FILA: COMPLICACIONES Y TAMIZAJES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Izquierda (Col 6): Complicaciones — evolución en la cohorte */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-card p-6 md:p-7 space-y-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="w-5 h-5 text-[#0D4D43]" />
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Complicaciones: evolución en la cohorte
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Prevalencia al ingreso, nuevas detecciones y progresión durante el seguimiento (6 meses).
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-100 rounded-2xl overflow-hidden">
                  <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-3">Complicación</th>
                      <th className="py-3 px-3 text-center">Al ingreso<br/><span className="font-normal text-[10px] text-slate-400">n (%)</span></th>
                      <th className="py-3 px-3 text-center">Nuevas detecciones<br/><span className="font-normal text-[10px] text-slate-400">(sospecha)</span></th>
                      <th className="py-3 px-3 text-center">Nuevas confirmadas<br/><span className="font-normal text-[10px] text-slate-400">n (%)</span></th>
                      <th className="py-3 px-3 text-center">Progresión<br/><span className="font-normal text-[10px] text-slate-400">de la enfermedad n (%)</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.complicacionesCohorte.map((c) => (
                      <tr key={c.complicacion} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-3 font-bold text-slate-800">
                          {c.complicacion}
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-600 whitespace-nowrap">
                          {c.alIngreso}
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-amber-700 whitespace-nowrap">
                          {c.nuevasSospechas}
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-700 whitespace-nowrap">
                          {c.nuevasConfirmadas}
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-700 whitespace-nowrap">
                          {c.progresion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Las sospechas corresponden a tamizajes telefónicos dirigidos (DNS positivo o reporte visual) pendientes de confirmación diagnóstica en consulta médica presencial.
                </span>
              </div>
            </div>

            {/* Derecha (Col 6): Tamizajes y prevención */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-card p-6 md:p-7 space-y-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <ClipboardCheck className="w-5 h-5 text-[#0D4D43]" />
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Tamizajes y prevención
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Seguimiento de tamizajes recomendados por Lazo y su realización.
                </p>
              </div>

              {/* 4 Contadores en Fila */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-100 text-center shadow-xs">
                  <Calendar className="w-4 h-4 text-emerald-700 mx-auto" />
                  <p className="text-xl font-extrabold text-slate-900 mt-1">{data.tamizajesPrevencion.recomendados}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">Recomendados por Lazo</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-100 text-center shadow-xs">
                  <Eye className="w-4 h-4 text-emerald-700 mx-auto" />
                  <p className="text-xl font-extrabold text-slate-900 mt-1">{data.tamizajesPrevencion.revisadosMedico}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">Revisados por el médico</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-100 text-center shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 mx-auto" />
                  <p className="text-xl font-extrabold text-slate-900 mt-1">{data.tamizajesPrevencion.realizados}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">Realizados</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-100 text-center shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mx-auto" />
                  <p className="text-xl font-extrabold text-slate-900 mt-1">{data.tamizajesPrevencion.hallazgosRelevantes}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">Hallazgos relevantes</p>
                </div>
              </div>

              {/* Bloque inferior: Progreso a la izquierda y desglose por tipo a la derecha */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 pt-3 border-t border-slate-100 items-center">
                {/* Izquierda: Progreso global */}
                <div className="sm:col-span-5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Tamizajes realizados / recomendados</span>
                    <span className="text-lg font-black text-slate-900">{data.tamizajesPrevencion.tasaRealizados}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${data.tamizajesPrevencion.tasaRealizados}%` }} 
                      className="h-full bg-[#0D4D43] rounded-full transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    {data.tamizajesPrevencion.realizados} de {data.tamizajesPrevencion.recomendados} estudios completados con reporte clínico.
                  </p>
                </div>

                {/* Derecha: Desglose por tipo */}
                <div className="sm:col-span-7 space-y-2 sm:border-l sm:border-slate-100 sm:pl-5">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">Tamizajes por tipo</h4>
                  <div className="space-y-1.5 text-xs">
                    {data.tamizajesPrevencion.porTipo.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2 text-slate-700">
                          {item.id === 'ojo' && <Eye className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                          {item.id === 'pies' && <Footprints className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                          {item.id === 'renal' && <Activity className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                          {item.id === 'albuminuria' && <FlaskConical className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                          <span className="font-medium">{item.tipo}</span>
                        </div>
                        <span className="font-semibold text-slate-800">
                          {item.realizados} / {item.recomendados} ({item.porcentaje}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: ADHERENCIA (DOS TABLAS SEPARADAS: EDAD Y SEXO) */}
      {activeReportTab === 'adherencia' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 animate-fadeIn">
          {/* Tabla Adherencia por Grupo de Edad */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[#0D4D43]">
              Adherencia por Grupo de Edad
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-lazo-canvas text-slate-600 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Grupo de Edad</th>
                    <th className="py-3 px-4">Pacientes</th>
                    <th className="py-3 px-4">Adherencia Media</th>
                    <th className="py-3 px-4 text-right">Apego Alto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.adherenciaPorEdad.map((g) => (
                    <tr key={g.grupo} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{g.grupo}</td>
                      <td className="py-3.5 px-4 text-slate-600">{g.pacientes}</td>
                      <td className="py-3.5 px-4 font-extrabold text-[#0D4D43]">{g.adherenciaMedia}%</td>
                      <td className="py-3.5 px-4 text-right font-medium text-emerald-700">{g.altaApego} pacientes</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla Adherencia por Sexo */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[#0D4D43]">
              Adherencia por Sexo
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-lazo-canvas text-slate-600 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Sexo</th>
                    <th className="py-3 px-4">Pacientes</th>
                    <th className="py-3 px-4">Adherencia Media</th>
                    <th className="py-3 px-4 text-right">Apego Alto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.adherenciaPorSexo.map((s) => (
                    <tr key={s.sexo} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{s.sexo}</td>
                      <td className="py-3.5 px-4 text-slate-600">{s.pacientes}</td>
                      <td className="py-3.5 px-4 font-extrabold text-[#0D4D43]">{s.adherenciaMedia}%</td>
                      <td className="py-3.5 px-4 text-right font-medium text-emerald-700">{s.altaApego} pacientes</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: BARRERAS Y APOYO */}
      {activeReportTab === 'barreras' && (
        <div className="space-y-7 animate-fadeIn">
          {/* Frecuencia de Barreras */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[#0D4D43]">
              Prevalencia de Barreras de Adherencia en Población DM2
            </h3>
            <div className="space-y-3">
              {data.barrerasFrecuentes.map((b) => (
                <div key={b.barrera} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{b.barrera}</span>
                    <span className="text-[#0D4D43] font-bold">{b.porcentaje}% ({b.casos} pacientes)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${b.porcentaje}%` }} 
                      className="h-full bg-[#0D4D43] rounded-full transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla de Intervenciones con Trabajo Social */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[#0D4D43]">
              Pacientes con Gestión de Apoyo Interinstitucional
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-lazo-canvas text-slate-600 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Paciente</th>
                    <th className="py-3 px-4">Barrera Notificada</th>
                    <th className="py-3 px-4">Necesidad / Plan de Apoyo</th>
                    <th className="py-3 px-4 text-right">Estado de la Intervención</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.intervencionesBarreras.map((ib, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{ib.paciente}</td>
                      <td className="py-3.5 px-4 text-slate-600">{ib.barrera}</td>
                      <td className="py-3.5 px-4 text-slate-700">{ib.necesidad}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-3 py-1 rounded-full bg-lazo-sage text-lazo-primary font-semibold text-[11px]">
                          {ib.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exportación */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Exportar Reporte Poblacional
              </h3>
              <button 
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {exportSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <p className="font-bold text-slate-800 text-sm">¡Reporte descargado con éxito!</p>
                <p className="text-xs text-slate-400">El archivo se guardó en tu carpeta de descargas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Selecciona el formato deseado para generar el reporte de la cohorte DM2:
                </p>

                <div className="space-y-2.5">
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="w-full p-4 rounded-2xl bg-lazo-canvas hover:bg-lazo-sage/50 border border-slate-200 text-left flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs group-hover:text-lazo-primary">Informe Clínico Ejecutivo (PDF)</p>
                      <p className="text-[11px] text-slate-400">Incluye gráficos, tablas pareadas y resumen de alertas</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDownload('csv')}
                    className="w-full p-4 rounded-2xl bg-lazo-canvas hover:bg-lazo-sage/50 border border-slate-200 text-left flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs group-hover:text-lazo-primary">Base de Datos Tabulada (Excel / CSV)</p>
                      <p className="text-[11px] text-slate-400">Ideal para análisis estadístico o informe institucional</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
