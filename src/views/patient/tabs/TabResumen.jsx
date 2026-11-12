import React from 'react';
import { 
  AlertOctagon, 
  Clock, 
  Calendar, 
  Phone, 
  MessageSquare, 
  FileText, 
  ChevronRight, 
  CheckCircle, 
  HelpCircle, 
  Activity, 
  ArrowRight,
  ExternalLink,
  Pill,
  FlaskConical,
  Info
} from 'lucide-react';

export default function TabResumen({ patient, onNavigateTab, onOpenAgendarModal }) {
  const isEmergencia = patient.prioridadClinica === 'Emergencia';

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* 1. Información General — Ancho completo */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Información general
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Datos sociodemográficos y descripción clínica</p>
        </div>

        {/* 4 recuadros en una fila */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Edad / Sexo</span>
            <p className="text-sm font-bold text-slate-900 mt-1">{patient.edad} años · {patient.sexo}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Fecha de Nacimiento</span>
            <p className="text-sm font-bold text-slate-900 mt-1">{patient.fechaNacimiento}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Fecha de Registro</span>
            <p className="text-sm font-bold text-slate-900 mt-1">{patient.fechaRegistro}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Médico Tratante</span>
            <p className="text-sm font-bold text-slate-900 mt-1">{patient.medicoTratante}</p>
          </div>
        </div>

        {/* Canales de comunicación y consentimiento */}
        <div className="pt-2">
          <h4 className="text-sm font-bold text-slate-900 mb-3">
            Canales de comunicación y consentimiento
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-800 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Llamadas telefónicas por voz</p>
                  <p className="text-xs text-slate-500 mt-0.5">{patient.telefono} (Teléfono verificado)</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium text-xs whitespace-nowrap">
                Consentimiento firmado
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Bitácora SMS (Recepción)</p>
                  <p className="text-xs text-slate-500 mt-0.5">Canal complementario en fase de estudio técnico</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 font-medium text-xs whitespace-nowrap">
                Pendiente de protocolo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Estado clínico actual y Próximas acciones sugeridas — dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Izquierda: Estado clínico actual */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-5">
          <h3 className="text-lg font-bold text-slate-900">
            Estado clínico actual
          </h3>

          {patient.alertaActiva ? (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isEmergencia ? 'bg-red-50/50 border-red-200' : 'bg-emerald-50/40 border-emerald-200'
            }`}>
              <div className="flex items-center gap-2">
                {isEmergencia ? (
                  <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-emerald-800 shrink-0" />
                )}
                <h4 className={`text-xs font-bold uppercase tracking-wide ${
                  isEmergencia ? 'text-red-700' : 'text-emerald-900'
                }`}>
                  {patient.alertaActiva.titulo}
                </h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {patient.alertaActiva.motivo}
              </p>
              <div className="p-3 rounded-xl bg-white border border-red-100 text-xs text-slate-700 space-y-1.5">
                <p><span className="font-bold text-slate-900">Acción realizada:</span> {patient.alertaActiva.accionSistema}</p>
                <p><span className="font-bold text-slate-900">Confirmación enfermería:</span> {patient.alertaActiva.confirmacionEnfermeria}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-emerald-950 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">Sin alertas de seguridad activas</p>
                <p className="text-emerald-700 mt-0.5">Seguimiento ordinario en curso dentro de parámetros esperados.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-xs pt-1">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Prioridad clínica actual</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{patient.prioridadClinica}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Siguiente llamada sugerida</span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {isEmergencia ? 'Pausada por derivación' : 'En 7 días'}
              </p>
            </div>
          </div>
        </div>

        {/* Derecha: Próximas acciones sugeridas */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-5">
          {patient.recordatoriosContacto?.map((rec) => (
            <div key={rec.id} className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-900">Recordatorio de Contacto (Para Próxima Consulta)</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rec.estado === 'Pendiente' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {rec.estado}
                    </span>
                  </div>
                  <p className="text-slate-800 mt-1 font-semibold">{rec.problema}</p>
                  <p className="text-slate-600 mt-0.5 text-[11px]">{rec.accionSugerida}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Generado automáticamente por acumulación de {rec.incidencias} incidencias de contacto.</p>
                </div>
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Próximas acciones sugeridas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sugerencias estructuradas para valoración del médico (nunca decisiones automáticas)
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-emerald-800 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Valorar consulta de seguimiento y control de HbA1c</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Última HbA1c: 7.8%. Evaluar titulación de insulina tras resolución del cuadro agudo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('laboratorios')}
                className="px-3.5 py-2 rounded-xl bg-lazo-primary text-white text-xs font-semibold hover:bg-lazo-primary-hover transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Ver laboratorios</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-emerald-800 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Reforzar educación sobre Insulina Basal ("Sick-Day Rules")</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    El paciente omitió la insulina basal por temor al mareo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('medicacion')}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <Pill className="w-3.5 h-3.5 text-slate-500" />
                <span>Revisar pauta</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-emerald-800 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Tamizaje Retiniano Anual Vencido</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    14 meses desde el último fondo de ojo registrado.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('antecedentes')}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <span>Ver tamizajes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Actividad reciente — ancho completo al final */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Actividad reciente
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Cronología trazable de llamadas, alertas y notas clínicas</p>
          </div>
          <button 
            onClick={() => onNavigateTab('llamadas')}
            className="text-xs font-bold text-slate-800 hover:text-emerald-800 flex items-center gap-1 transition-colors"
          >
            <span>Ver todo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {patient.llamadas?.map((llamada) => {
            const isLlamadaEmergencia = llamada.alertaGenerada?.includes('Emergencia');
            return (
              <div 
                key={llamada.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isLlamadaEmergencia
                    ? 'bg-red-50/50 border-red-200'
                    : 'bg-[#F8FAFC] border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{llamada.tipo}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Estado: <span className="text-slate-700 font-medium">{llamada.estado}</span> · Duración: {llamada.duracion}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    {llamada.fechaHora}
                  </span>
                </div>

                {llamada.alertaGenerada && llamada.alertaGenerada !== 'Ninguna' && (
                  <div className="mt-3 pt-2.5 border-t border-red-100 flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      isLlamadaEmergencia ? 'text-red-600' : 'text-amber-800'
                    }`}>
                      {llamada.alertaGenerada}
                    </span>
                    <button
                      onClick={() => onNavigateTab('llamadas')}
                      className="text-xs text-slate-900 font-bold hover:text-red-700 flex items-center gap-1 transition-colors"
                    >
                      <span>Auditar audio y transcripción</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {patient.notas?.map((nota) => (
            <div key={nota.id} className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-emerald-800 shrink-0">
                  {nota.tipo.toLowerCase().includes('consulta') ? (
                    <Info className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{nota.tipo}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{nota.contenido}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap shrink-0">
                {nota.fechaHora}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
