import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  ChevronRight, 
  AlertOctagon, 
  Clock, 
  CheckCircle, 
  PhoneMissed,
  FileText,
  AlertCircle,
  UserPlus,
  Edit3
} from 'lucide-react';
import { MOCK_PATIENTS } from '../data/mockPatients';

export default function PatientsDirectoryView({ 
  patients = MOCK_PATIENTS, 
  onSelectPatient,
  onOpenNewPatientModal,
  onOpenEditPatientModal 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('todos');

  const patientList = patients && patients.length > 0 ? patients : MOCK_PATIENTS;

  const filteredPatients = patientList.filter(p => {
    const matchesSearch = (p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.diagnosticoPrincipal || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'todos' || 
      (priorityFilter === 'emergencia' && p.prioridadClinica === 'Emergencia') ||
      (priorityFilter === 'prioritaria' && p.prioridadClinica === 'Prioritaria') ||
      (priorityFilter === 'rutina' && p.prioridadClinica === 'Rutina') ||
      (priorityFilter === 'contacto' && p.prioridadClinica === 'Seguimiento de contacto') ||
      (priorityFilter === 'borrador' && p.estadoAlta === 'borrador');

    return matchesSearch && matchesPriority;
  });

  const totalPatients = patientList.length;
  const draftCount = patientList.filter(p => p.estadoAlta === 'borrador').length;

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* 2 Single KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pacientes Registrados</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-lazo-text tracking-tight">{totalPatients}</span>
              {draftCount > 0 && (
                <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {draftCount} en borrador
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Directorio activo de medicina familiar y primer nivel</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-lazo-sage flex items-center justify-center text-lazo-primary">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Seguimiento Telefónico Activo</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-emerald-800 tracking-tight">100%</span>
              <span className="text-xs text-slate-500 font-medium">({totalPatients} de {totalPatients} con expediente)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Monitoreo periódico asistido por Lazo</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search, Filters and + Nuevo Paciente Button */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, ID o diagnóstico..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs font-medium focus:outline-none focus:border-lazo-primary transition-colors text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs font-medium text-slate-700 focus:outline-none focus:border-lazo-primary"
            >
              <option value="todos">Todas las prioridades</option>
              <option value="emergencia">Emergencia activa</option>
              <option value="prioritaria">Valoración prioritaria</option>
              <option value="contacto">Seguimiento de contacto</option>
              <option value="rutina">Rutina / Estable</option>
              {draftCount > 0 && <option value="borrador">Borradores pendientes ({draftCount})</option>}
            </select>
          </div>

          <button
            onClick={onOpenNewPatientModal}
            className="px-4 py-2.5 rounded-2xl bg-lazo-primary hover:bg-lazo-primary-hover text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-soft shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Nuevo paciente</span>
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-lazo-canvas/60 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-4 px-6">Paciente</th>
                <th className="py-4 px-6">Diagnóstico Principal</th>
                <th className="py-4 px-6">Último Seguimiento</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6">Prioridad Clínica</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => {
                const isEmergencia = patient.prioridadClinica === 'Emergencia';
                const isPrioritaria = patient.prioridadClinica === 'Prioritaria';
                const isContacto = patient.prioridadClinica === 'Seguimiento de contacto';
                const isBorrador = patient.estadoAlta === 'borrador';

                return (
                  <tr key={patient.id} className="hover:bg-lazo-canvas/50 transition-colors">
                    {/* Paciente con icono neutro de persona */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-lazo-sage/80 text-lazo-primary flex items-center justify-center font-bold text-xs shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 text-sm">{patient.nombre}</p>
                            {isBorrador && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                Borrador
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">
                            ID: {patient.id} · {patient.edad ? `${patient.edad} años` : 'Edad no reg.'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Diagnóstico principal */}
                    <td className="py-4 px-6">
                      <span className="font-medium text-slate-700">{patient.diagnosticoPrincipal || 'Por registrar'}</span>
                      {patient.diagnosticosSecundarios?.length > 0 && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {Array.isArray(patient.diagnosticosSecundarios)
                            ? patient.diagnosticosSecundarios.join(', ')
                            : patient.diagnosticosSecundarios}
                        </p>
                      )}
                    </td>

                    {/* Último seguimiento */}
                    <td className="py-4 px-6">
                      {patient.llamadas?.[0] ? (
                        <div>
                          <p className="font-medium text-slate-700">{patient.llamadas[0].fechaHora.split('·')[0]}</p>
                          <p className="text-[11px] text-slate-400">{patient.llamadas[0].tipo}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">Sin llamadas registradas</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        {patient.estadoSeguimiento || 'Activo'}
                      </span>
                    </td>

                    {/* Prioridad Clínica con texto explícito */}
                    <td className="py-4 px-6">
                      {isEmergencia && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-lazo-emergency-light text-lazo-emergency border border-lazo-emergency-border">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          Emergencia activa
                        </span>
                      )}
                      {isPrioritaria && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-lazo-sage text-lazo-primary border border-lazo-sage-border">
                          <Clock className="w-3.5 h-3.5" />
                          Valoración prioritaria
                        </span>
                      )}
                      {isContacto && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <PhoneMissed className="w-3.5 h-3.5" />
                          Seguimiento de contacto
                        </span>
                      )}
                      {!isEmergencia && !isPrioritaria && !isContacto && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Seguimiento de rutina
                        </span>
                      )}
                    </td>

                    {/* Columna Acciones: Editar, Ver alerta, Ver expediente */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onOpenEditPatientModal && (
                          <button
                            onClick={() => onOpenEditPatientModal(patient)}
                            className="p-1.5 rounded-xl bg-lazo-canvas hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-colors"
                            title="Editar datos del paciente"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {patient.alertaActiva && (
                          <button
                            onClick={() => onSelectPatient(patient.id, 'llamadas')}
                            className="px-3 py-1.5 rounded-xl bg-red-50 text-lazo-emergency hover:bg-red-100 text-xs font-semibold flex items-center gap-1 border border-red-200 transition-colors"
                            title="Ver alerta clínica activa"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Ver alerta</span>
                          </button>
                        )}

                        <button
                          onClick={() => onSelectPatient(patient.id, 'resumen')}
                          className="px-3.5 py-1.5 rounded-xl bg-lazo-canvas text-lazo-primary hover:bg-lazo-sage text-xs font-semibold border border-slate-200/80 transition-colors flex items-center gap-1"
                        >
                          <span>Ver expediente</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
