import React, { useState } from 'react';
import { 
  PhoneCall, 
  CheckCircle, 
  XCircle, 
  PhoneOutgoing, 
  PhoneIncoming, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Wrench,
  Users,
  ChevronRight,
  ShieldCheck,
  Filter,
  Check,
  AlertOctagon,
  Settings2,
  ExternalLink
} from 'lucide-react';
import { CALL_OPERATIONS_DATA } from '../data/mockReports';

export default function CallOperationsView({ onSelectPatient }) {
  const [period, setPeriod] = useState('6m'); // '3m' | '6m' | '12m'
  const [threshold, setThreshold] = useState(2); // Umbral configurable de incidencias para generar recordatorio
  
  // Lista interactiva de pacientes con incidencias de contacto
  const [pacientesIncidencias, setPacientesIncidencias] = useState(
    CALL_OPERATIONS_DATA.pacientesIncidenciasContacto || []
  );

  const data = CALL_OPERATIONS_DATA;

  // Toggle estado de recordatorio entre 'Pendiente' y 'Resuelto'
  const handleToggleEstado = (pacienteId) => {
    setPacientesIncidencias(prev => prev.map(p => {
      if (p.id === pacienteId) {
        return {
          ...p,
          estadoRecordatorio: p.estadoRecordatorio === 'Pendiente' ? 'Resuelto' : 'Pendiente'
        };
      }
      return p;
    }));
  };

  // Filtrado de meses para la gráfica principal según el periodo seleccionado
  const getMesesGrafica = () => {
    const raw = data.evolucionMensual || [];
    if (period === '3m') return raw.slice(-3);
    if (period === '6m') return raw;
    if (period === '12m') {
      // 12 meses proyectados / anual
      return [
        { mes: "Dic '25", completadas: 130, incompletas: 24, alertas: 5, total: 154 },
        { mes: "Ene '26", completadas: 142, incompletas: 26, alertas: 6, total: 168 },
        { mes: "Feb '26", completadas: 148, incompletas: 27, alertas: 7, total: 175 },
        { mes: "Mar '26", completadas: 155, incompletas: 29, alertas: 8, total: 184 },
        { mes: "Abr '26", completadas: 160, incompletas: 30, alertas: 8, total: 190 },
        { mes: "May '26", completadas: 162, incompletas: 29, alertas: 7, total: 191 },
        ...raw
      ];
    }
    return raw;
  };

  const mesesFiltrados = getMesesGrafica();
  const maxBarValue = Math.max(...mesesFiltrados.map(m => m.completadas), 200);

  // Filtrar pacientes que cumplan el umbral seleccionado
  const pacientesFiltrados = pacientesIncidencias.filter(p => p.incidencias >= threshold);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header General */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Monitoreo Operativo de Telefonía Automatizada
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de infraestructura de voz humana, completitud, incidencias de contacto y control técnico de contingencias
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Periodo de consulta:</span>
          <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-soft">
            <button
              onClick={() => setPeriod('3m')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                period === '3m' ? 'bg-lazo-primary text-white shadow-soft' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Últimos 3 meses
            </button>
            <button
              onClick={() => setPeriod('6m')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                period === '6m' ? 'bg-lazo-primary text-white shadow-soft' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semestral (6m)
            </button>
            <button
              onClick={() => setPeriod('12m')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                period === '12m' ? 'bg-lazo-primary text-white shadow-soft' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Anual (12m)
            </button>
          </div>
        </div>
      </div>

      {/* BLOQUE 1: SEIS INDICADORES COMPACTOS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Llamadas</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{data.kpis.llamadasTotales}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Acumulado del mes</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completadas</span>
          <p className="text-2xl font-extrabold text-emerald-800 mt-1">{data.kpis.completadas}</p>
          <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">{data.kpis.tasaCompletadas}% tasa global</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Incompletas</span>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{data.kpis.incompletas}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">14.9% (no emergencia)</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Salientes</span>
          <p className="text-2xl font-extrabold text-lazo-primary mt-1">{data.kpis.salientes}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Programadas</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Entrantes</span>
          <p className="text-2xl font-extrabold text-lazo-primary mt-1">{data.kpis.entrantes}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Línea abierta (6-23h)</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Promedio / Pac.</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{data.kpis.promedioPorPaciente}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Llamadas / paciente mes</p>
        </div>
      </div>

      {/* BLOQUE 2: GRÁFICA PRINCIPAL DE EVOLUCIÓN MENSUAL CON BARRAS AGRUPADAS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-lazo-sage text-lazo-primary">
                Elemento Central Operativo
              </span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Evolución Mensual de Telefonía Automatizada
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparativa de volumen de llamadas completadas, llamadas incompletas y alertas clínicas generadas
            </p>
          </div>

          {/* Leyenda interactiva */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-3.5 h-3.5 rounded-md bg-lazo-primary"></span>
              Completadas
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-300"></span>
              Incompletas
            </span>
            <span className="flex items-center gap-1.5 text-red-600 font-bold">
              <span className="w-3.5 h-3.5 rounded-md bg-red-500"></span>
              Alertas Generadas
            </span>
          </div>
        </div>

        {/* Gráfica de Barras Agrupadas */}
        <div className="pt-2">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${mesesFiltrados.length}, minmax(0, 1fr))` }}>
            {mesesFiltrados.map((m) => {
              const hCompletadas = Math.round((m.completadas / maxBarValue) * 160);
              const hIncompletas = Math.round((m.incompletas / maxBarValue) * 160);
              const hAlertas = Math.max(Math.round((m.alertas / maxBarValue) * 160), 10);

              return (
                <div key={m.mes} className="flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{m.total || (m.completadas + m.incompletas)}</span>
                  
                  {/* Contenedor de barras agrupadas */}
                  <div className="w-full h-44 bg-slate-50/80 rounded-2xl flex items-end justify-center gap-1.5 p-2 border border-slate-100">
                    {/* Barra 1: Completadas */}
                    <div 
                      style={{ height: `${hCompletadas}px` }} 
                      className="w-1/3 max-w-[20px] bg-lazo-primary hover:bg-lazo-primary-hover rounded-t-lg transition-all group relative cursor-pointer"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded font-mono pointer-events-none transition-opacity whitespace-nowrap z-10">
                        {m.completadas} comp.
                      </div>
                    </div>

                    {/* Barra 2: Incompletas */}
                    <div 
                      style={{ height: `${hIncompletas}px` }} 
                      className="w-1/3 max-w-[20px] bg-slate-300 hover:bg-slate-400 rounded-t-lg transition-all group relative cursor-pointer"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded font-mono pointer-events-none transition-opacity whitespace-nowrap z-10">
                        {m.incompletas} incomp.
                      </div>
                    </div>

                    {/* Barra 3: Alertas */}
                    <div 
                      style={{ height: `${hAlertas}px` }} 
                      className="w-1/3 max-w-[20px] bg-red-500 hover:bg-red-600 rounded-t-lg transition-all group relative cursor-pointer"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-red-700 text-white text-[10px] py-0.5 px-1.5 rounded font-mono pointer-events-none transition-opacity whitespace-nowrap z-10">
                        {m.alertas} alertas
                      </div>
                    </div>
                  </div>

                  {/* Etiqueta del mes y tasa */}
                  <span className="text-xs font-bold text-slate-800">{m.mes}</span>
                  <span className="text-[10px] font-semibold text-emerald-800">
                    {Math.round((m.completadas / (m.total || (m.completadas + m.incompletas))) * 100)}% comp.
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BLOQUE 3: TABLA «PACIENTES CON INCIDENCIAS DE CONTACTO» Y RECORDATORIOS AUTOMÁTICOS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-700" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Pacientes con Incidencias de Contacto
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                {pacientesFiltrados.length} en seguimiento
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generación de recordatorios automáticos para revisión en próxima consulta sin programar citas ni llamadas no autorizadas
            </p>
          </div>

          {/* Configuración interactiva del umbral de incidencias */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-slate-400" />
              Umbral para recordatorio:
            </span>
            <div className="flex items-center gap-1 bg-lazo-canvas p-1 rounded-2xl border border-slate-200/80">
              <button
                onClick={() => setThreshold(2)}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  threshold === 2 ? 'bg-amber-100 text-amber-900 shadow-soft' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Recomendado por protocolo de contacto"
              >
                ≥ 2 incidencias (Piloto)
              </button>
              <button
                onClick={() => setThreshold(3)}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  threshold === 3 ? 'bg-amber-100 text-amber-900 shadow-soft' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ≥ 3 incidencias
              </button>
              <button
                onClick={() => setThreshold(4)}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  threshold === 4 ? 'bg-amber-100 text-amber-900 shadow-soft' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ≥ 4 incidencias
              </button>
            </div>
          </div>
        </div>

        {/* Tabla estructurada */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-100 rounded-2xl overflow-hidden">
            <thead className="bg-lazo-canvas text-slate-600 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Paciente</th>
                <th className="py-3.5 px-4">Problema Recurrente</th>
                <th className="py-3.5 px-4 text-center">Incidencias</th>
                <th className="py-3.5 px-4">Última Llamada</th>
                <th className="py-3.5 px-4">Estado del Recordatorio</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pacientesFiltrados.map((p) => {
                const isPendiente = p.estadoRecordatorio === 'Pendiente';
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{p.nombre}</p>
                      <span className="font-mono text-[11px] text-slate-400">ID: {p.id}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-700">
                      <p className="font-semibold">{p.problemaRecurrente}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.causaDetallada}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 font-bold border border-amber-200">
                        {p.incidencias}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                      {p.ultimaFecha}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleEstado(p.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs ${
                          isPendiente
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                        }`}
                        title="Haz clic para alternar entre Pendiente y Resuelto"
                      >
                        {isPendiente ? <Clock className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        <span>{p.estadoRecordatorio}</span>
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {onSelectPatient ? (
                        <button
                          onClick={() => onSelectPatient(p.id, 'resumen')}
                          className="px-3 py-1.5 rounded-xl bg-lazo-canvas hover:bg-slate-100 text-lazo-primary hover:text-lazo-primary-hover font-bold border border-slate-200/80 transition-colors inline-flex items-center gap-1"
                        >
                          <span>Expediente</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-slate-400 font-mono">{p.id}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Nota informativa sobre recordatorios y gobernanza */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-lazo-primary shrink-0" />
            <span><strong>Regla de no-duplicación:</strong> No se generan nuevos recordatorios mientras exista uno Pendiente por la misma causa.</span>
          </span>
          <span className="text-[11px] text-slate-400">Umbral activo: ≥ {threshold} eventos</span>
        </div>
      </div>

      {/* BLOQUE 4: LOS TRES ANÁLISIS EXISTENTES (EDAD, MOTIVOS NO COMPLETADAS, INCIDENCIAS TÉCNICAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Tabla por Grupo de Edad */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-lazo-primary mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-lazo-primary" />
              Completitud por Grupo de Edad
            </h4>
            <div className="space-y-3">
              {data.porGrupoEdad.map((g) => (
                <div key={g.grupo} className="p-3.5 rounded-2xl bg-lazo-canvas border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{g.grupo}</span>
                    <span className="font-bold text-emerald-800">{g.tasa}</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{g.completadas} completadas de {g.llamadas} intentos</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Población adulta mayor mantiene alta aceptabilidad telefónica sin app móvil.
          </p>
        </div>

        {/* 2. Motivos de no completadas */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-lazo-primary mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-lazo-primary" />
              Causas de Llamadas No Completadas
            </h4>
            <div className="space-y-2.5">
              {data.motivosNoCompletadas.map((m) => (
                <div key={m.motivo} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span className="truncate pr-2">{m.motivo}</span>
                    <span className="text-slate-600 font-bold">{m.porcentaje}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{m.conteo} llamadas en el periodo</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Regla: Una llamada no contestada activa flujo según riesgo, nunca una falsa emergencia.
          </p>
        </div>

        {/* 3. Incidencias Técnicas */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-lazo-primary mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-lazo-primary" />
              Incidencias Técnicas y Filtros de IA
            </h4>
            <div className="space-y-3">
              {data.incidenciasTecnicas.map((inc, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-900">{inc.casos} casos</span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-amber-800 text-[10px] font-bold border border-amber-200">Resuelto</span>
                  </div>
                  <p className="text-slate-700 font-medium mb-1">{inc.tipo}</p>
                  <p className="text-[11px] text-slate-500">{inc.resolucion}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Cualquier respuesta ambigua pasa a revisión humana sin inferencias automáticas.
          </p>
        </div>
      </div>
    </div>
  );
}
