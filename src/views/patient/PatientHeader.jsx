import React from 'react';
import { 
  User, 
  CalendarPlus, 
  FileEdit, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  ChevronLeft,
  ArrowLeft,
  Edit3
} from 'lucide-react';

export default function PatientHeader({ 
  patient, 
  activeTab, 
  setActiveTab, 
  onBack, 
  onOpenAgendarModal, 
  onOpenNotaModal,
  onOpenEditModal
}) {
  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'antecedentes', label: 'Historia Clínica' },
    { id: 'antropometria', label: 'Antropometría y Estilo de Vida' },
    { id: 'medicacion', label: 'Medicación' },
    { id: 'seguimiento', label: 'Seguimiento' },
    { id: 'laboratorios', label: 'Laboratorios' },
    { id: 'llamadas', label: 'Llamadas' },
    { id: 'notas', label: 'Notas' }
  ];

  const isEmergencia = patient.prioridadClinica === 'Emergencia';
  const isPrioritaria = patient.prioridadClinica === 'Prioritaria';
  const isBaseline = patient.isBaseline === true || ["LZ-0482", "LZ-0319", "LZ-0195", "LZ-0512", "LZ-0513", "LZ-0514"].includes(patient.id);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 pb-0 space-y-6">
      {/* Top back navigation and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-lazo-canvas hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            title="Regresar al directorio"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-lazo-sage text-lazo-primary flex items-center justify-center font-bold text-lg border border-lazo-mint/60">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {patient.nombre}
                </h2>
                {isBaseline ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Referencia (Solo lectura)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Expediente Evaluador
                  </span>
                )}
                {patient.estadoAlta === 'borrador' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Borrador pendiente
                  </span>
                )}
                {isEmergencia && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-lazo-emergency-light text-lazo-emergency border border-lazo-emergency-border">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    Emergencia activa
                  </span>
                )}
                {isPrioritaria && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-lazo-sage text-lazo-primary border border-lazo-sage-border">
                    <Clock className="w-3.5 h-3.5" />
                    Valoración prioritaria
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span className="font-semibold text-slate-700">ID: {patient.id}</span>
                <span>·</span>
                <span>{patient.edad ? `${patient.edad} años` : 'Edad no reg.'} ({patient.sexo || 'No esp.'})</span>
                <span>·</span>
                <span className="text-lazo-primary font-medium">{patient.diagnosticoPrincipal || 'Sin diagnóstico'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Buttons: Editar datos, Agregar nota, Agendar consulta */}
        <div className="flex items-center gap-3">
          {onOpenEditModal && (
            <button
              onClick={() => !isBaseline && onOpenEditModal()}
              disabled={isBaseline}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-colors flex items-center gap-2 ${
                isBaseline
                  ? "bg-slate-50 text-slate-300 border-slate-200/60 cursor-not-allowed"
                  : "bg-lazo-canvas hover:bg-slate-100 text-slate-700 border-slate-200/80"
              }`}
              title={isBaseline ? "Los pacientes de referencia clínica son de solo lectura" : "Editar datos del paciente"}
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              <span>{isBaseline ? "Solo lectura" : "Editar datos"}</span>
            </button>
          )}

          <button
            onClick={onOpenNotaModal}
            className="px-4 py-2.5 rounded-2xl bg-lazo-canvas hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-colors flex items-center gap-2"
          >
            <FileEdit className="w-3.5 h-3.5 text-slate-500" />
            <span>Agregar nota</span>
          </button>

          <button
            onClick={onOpenAgendarModal}
            className="px-4 py-2.5 rounded-2xl bg-lazo-primary hover:bg-lazo-primary-hover text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-soft"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Agendar consulta</span>
          </button>
        </div>
      </div>

      {/* Internal Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 pt-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-5 text-xs font-semibold transition-all relative border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-lazo-primary text-lazo-primary font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
              }`}
            >
              {tab.label}
              {tab.id === 'llamadas' && patient.alertaActiva && (
                <span className="ml-2 w-2 h-2 rounded-full bg-lazo-emergency inline-block"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
