import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Calendar,
  Phone,
  MapPin,
  Heart,
  Scale,
  Ruler,
  AlertCircle,
  CheckCircle2,
  FileEdit,
  Save,
  UserPlus,
  ShieldCheck,
  Info
} from 'lucide-react';
import {
  calculateClientBMI,
  calculateClientWHR,
  createPatientApi,
  updatePatientApi
} from '../../services/patientApiService';

export default function PatientFormModal({
  isOpen,
  onClose,
  onPatientSaved,
  patientToEdit = null,
  existingPatients = []
}) {
  const isEditing = Boolean(patientToEdit);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    fechaNacimiento: '',
    sexo: 'Masculino',
    curp: '',
    telefono: '',
    cuidador: '',
    direccion: '',
    diagnosticoPrincipal: 'Diabetes Mellitus Tipo 2',
    diagnosticosSecundarios: '',
    medicoTratante: 'Dra. Anamar Cordero',
    prioridadClinica: 'Rutina',
    peso: '',
    talla: '',
    cintura: '',
    cadera: '',
    notasInternas: ''
  });

  const [errors, setErrors] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form
  useEffect(() => {
    if (patientToEdit) {
      // Find latest anthropometry
      const latestMed = patientToEdit.antropometria?.mediciones?.slice(-1)[0] || {};
      setFormData({
        id: patientToEdit.id || '',
        nombre: patientToEdit.nombre || '',
        fechaNacimiento: patientToEdit.fechaNacimiento || '',
        sexo: patientToEdit.sexo || 'Masculino',
        curp: patientToEdit.curp || '',
        telefono: patientToEdit.telefono || '',
        cuidador: patientToEdit.cuidador || '',
        direccion: patientToEdit.direccion || '',
        diagnosticoPrincipal: patientToEdit.diagnosticoPrincipal || '',
        diagnosticosSecundarios: Array.isArray(patientToEdit.diagnosticosSecundarios)
          ? patientToEdit.diagnosticosSecundarios.join(', ')
          : (patientToEdit.diagnosticosSecundarios || ''),
        medicoTratante: patientToEdit.medicoTratante || 'Dra. Anamar Cordero',
        prioridadClinica: patientToEdit.prioridadClinica || 'Rutina',
        peso: latestMed.peso ? String(latestMed.peso) : '',
        talla: latestMed.talla ? String(latestMed.talla) : '',
        cintura: latestMed.cintura ? String(latestMed.cintura) : '',
        cadera: latestMed.cadera ? String(latestMed.cadera) : '',
        notasInternas: patientToEdit.notasInternas || ''
      });
    } else {
      setFormData({
        id: '',
        nombre: '',
        fechaNacimiento: '',
        sexo: 'Masculino',
        curp: '',
        telefono: '',
        cuidador: '',
        direccion: '',
        diagnosticoPrincipal: 'Diabetes Mellitus Tipo 2',
        diagnosticosSecundarios: '',
        medicoTratante: 'Dra. Anamar Cordero',
        prioridadClinica: 'Rutina',
        peso: '',
        talla: '',
        cintura: '',
        cadera: '',
        notasInternas: ''
      });
    }
    setErrors({});
    setDuplicateWarning(null);
  }, [patientToEdit, isOpen]);

  if (!isOpen) return null;

  // Real-time client calculations
  const liveBMI = calculateClientBMI(formData.peso, formData.talla, formData.sexo);
  const liveWHR = calculateClientWHR(formData.cintura, formData.cadera, formData.sexo);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    setDuplicateWarning(null);
  };

  // Validate duplicate locally against known existing patients
  const checkLocalDuplicates = () => {
    if (!formData.nombre.trim()) return null;
    const cleanName = formData.nombre.trim().toLowerCase();
    const dob = formData.fechaNacimiento;
    const curp = formData.curp.trim().toUpperCase();

    for (const p of existingPatients) {
      if (isEditing && p.id === patientToEdit.id) continue;
      if (curp && p.curp && p.curp.trim().toUpperCase() === curp) {
        return `Ya existe un paciente con la CURP "${curp}" (${p.nombre}, ID: ${p.id}).`;
      }
      if (dob && p.fechaNacimiento === dob && p.nombre.trim().toLowerCase() === cleanName) {
        return `Ya existe un paciente registrado con el nombre "${p.nombre}" y fecha de nacimiento ${dob} (ID: ${p.id}).`;
      }
    }
    return null;
  };

  const handleSave = async (isDraft = false) => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre completo es obligatorio.';
    }

    if (!isDraft) {
      if (!formData.fechaNacimiento) {
        newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida para el alta formal.';
      }
      if (!formData.telefono.trim()) {
        newErrors.telefono = 'El teléfono de contacto es requerido para seguimiento telefónico.';
      }
      if (!formData.diagnosticoPrincipal.trim()) {
        newErrors.diagnosticoPrincipal = 'Debe especificar el diagnóstico principal.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const localDup = checkLocalDuplicates();
    if (localDup) {
      setDuplicateWarning(localDup);
      return;
    }

    setIsSubmitting(true);
    setDuplicateWarning(null);

    try {
      const payload = {
        ...formData,
        notasInternas: formData.notasInternas || '',
        esBorrador: isDraft,
        diagnosticosSecundarios: formData.diagnosticosSecundarios
          ? formData.diagnosticosSecundarios.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };
      delete payload.notas;

      let result;
      if (isEditing) {
        result = await updatePatientApi(patientToEdit.id, payload);
      } else {
        result = await createPatientApi(payload);
      }

      setIsSubmitting(false);
      onPatientSaved(result);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      if (err.status === 409 || err.message?.includes('Ya existe')) {
        setDuplicateWarning(err.message);
      } else {
        setDuplicateWarning(`Error al guardar: ${err.message}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-modal w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-lazo-canvas/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lazo-sage text-lazo-primary flex items-center justify-center font-bold">
              {isEditing ? <FileEdit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? `Editar Paciente: ${patientToEdit.nombre}` : 'Alta de Nuevo Paciente'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing 
                  ? `Expediente: ${patientToEdit.id} · Actualización de datos demográficos y clínicos`
                  : 'Registra un paciente en la consulta presencial con trazabilidad duradera'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6">
          {duplicateWarning && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Atención con el registro:</p>
                <p className="mt-0.5">{duplicateWarning}</p>
              </div>
            </div>
          )}

          {/* Sección 1: Datos de Identificación Personal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-lazo-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Identificación y Datos Personales
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Roberto Méndez Silva"
                  className={`w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border text-xs text-slate-800 focus:outline-none focus:border-lazo-primary transition-colors ${
                    errors.nombre ? 'border-red-400' : 'border-slate-200/80'
                  }`}
                />
                {errors.nombre && <p className="text-[11px] text-red-500 mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Identificador / Expediente {isEditing && '(Fijo)'}
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  disabled={isEditing}
                  placeholder="Auto-generado (ej. LZ-0483)"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 focus:outline-none disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border text-xs text-slate-800 focus:outline-none focus:border-lazo-primary transition-colors ${
                    errors.fechaNacimiento ? 'border-red-400' : 'border-slate-200/80'
                  }`}
                />
                {errors.fechaNacimiento && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.fechaNacimiento}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sexo biológico <span className="text-red-500">*</span>
                </label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CURP (Opcional)
                </label>
                <input
                  type="text"
                  name="curp"
                  value={formData.curp}
                  onChange={handleChange}
                  maxLength={18}
                  placeholder="18 caracteres alfanuméricos"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 uppercase focus:outline-none focus:border-lazo-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono de contacto <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej. 55 1234 5678"
                  className={`w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border text-xs text-slate-800 focus:outline-none focus:border-lazo-primary transition-colors ${
                    errors.telefono ? 'border-red-400' : 'border-slate-200/80'
                  }`}
                />
                {errors.telefono && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.telefono}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contacto familiar / Cuidador
                </label>
                <input
                  type="text"
                  name="cuidador"
                  value={formData.cuidador}
                  onChange={handleChange}
                  placeholder="Ej. Carmen Méndez (Hija)"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dirección / Municipio
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Ej. Gustavo A. Madero, CDMX"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Datos Clínicos y Asignación */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Heart className="w-4 h-4 text-lazo-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Diagnóstico y Seguimiento Clínico
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnóstico principal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="diagnosticoPrincipal"
                  value={formData.diagnosticoPrincipal}
                  onChange={handleChange}
                  placeholder="Ej. Diabetes Mellitus Tipo 2"
                  className={`w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border text-xs text-slate-800 focus:outline-none focus:border-lazo-primary ${
                    errors.diagnosticoPrincipal ? 'border-red-400' : 'border-slate-200/80'
                  }`}
                />
                {errors.diagnosticoPrincipal && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.diagnosticoPrincipal}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prioridad clínica inicial
                </label>
                <select
                  name="prioridadClinica"
                  value={formData.prioridadClinica}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                >
                  <option value="Rutina">Rutina / Estable</option>
                  <option value="Prioritaria">Valoración prioritaria</option>
                  <option value="Emergencia">Emergencia activa</option>
                  <option value="Seguimiento de contacto">Seguimiento de contacto</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnósticos secundarios o comorbilidades (separados por coma)
                </label>
                <input
                  type="text"
                  name="diagnosticosSecundarios"
                  value={formData.diagnosticosSecundarios}
                  onChange={handleChange}
                  placeholder="Ej. Hipertensión Arterial Sistémica, Dislipidemia"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Médico tratante
                </label>
                <input
                  type="text"
                  name="medicoTratante"
                  value={formData.medicoTratante}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Antropometría Basal y Cálculos Automáticos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-lazo-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  3. Antropometría Inicial (Consulta Presencial)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Cálculos automáticos con NOM-008 talla baja
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  placeholder="Ej. 74.5"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Talla (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  name="talla"
                  value={formData.talla}
                  onChange={handleChange}
                  placeholder="Ej. 165"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cintura (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  name="cintura"
                  value={formData.cintura}
                  onChange={handleChange}
                  placeholder="Ej. 88"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cadera (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  name="cadera"
                  value={formData.cadera}
                  onChange={handleChange}
                  placeholder="Ej. 102"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                />
              </div>
            </div>

            {/* Live Calculations Preview Card */}
            {(liveBMI || liveWHR) && (
              <div className="p-4 rounded-2xl bg-lazo-mint/20 border border-lazo-mint/60 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs font-bold text-lazo-primary">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Resultados Deterministas Calculados</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {liveBMI && (
                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                      <div className="flex items-baseline justify-between">
                        <span className="font-semibold text-slate-700">Índice de Masa Corporal (IMC):</span>
                        <span className="text-base font-extrabold text-lazo-primary">{liveBMI.bmi} kg/m²</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-600 mt-1">
                        Clasificación: <strong className="text-slate-800">{liveBMI.clasificacion}</strong>
                      </p>
                      {liveBMI.esTallaBaja && (
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                          <span>⚠️ Criterio Talla Baja Mexicana (NOM-008-SSA3-2017)</span>
                        </div>
                      )}
                    </div>
                  )}

                  {liveWHR && (
                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                      <div className="flex items-baseline justify-between">
                        <span className="font-semibold text-slate-700">Índice Cintura-Cadera (ICC):</span>
                        <span className="text-base font-extrabold text-lazo-primary">{liveWHR.whr}</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-600 mt-1">
                        {liveWHR.interpretacion}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Umbral OMS ({formData.sexo}): &lt;{liveWHR.umbralICC}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-7 py-4 border-t border-slate-100 bg-lazo-canvas/30 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-3">
            {!isEditing && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSave(true)}
                className="px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200 transition-colors flex items-center gap-1.5"
                title="Guarda la información capturada como borrador para continuar después"
              >
                <Save className="w-3.5 h-3.5 text-amber-700" />
                <span>Guardar como Borrador</span>
              </button>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(false)}
              className="px-5 py-2.5 rounded-2xl bg-lazo-primary hover:bg-lazo-primary-hover text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-soft disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Guardando...</span>
              ) : isEditing ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Dar de Alta Paciente</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
