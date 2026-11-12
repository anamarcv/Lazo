import React, { useState } from 'react';
import { 
  Heart, 
  ShieldAlert, 
  Users, 
  User, 
  Scissors, 
  Calendar, 
  FileText, 
  Syringe, 
  Plus, 
  Check, 
  X, 
  ClipboardList, 
  Apple, 
  CircleSlash,
  Edit3
} from 'lucide-react';

export default function TabAntecedentes({ patient }) {
  const ant = patient?.antecedentes || {};

  // APNP default data if not present on patient
  const defaultApnp = {
    datosGenerales: {
      originaria: "Ciudad de México",
      residencia: "Ciudad de México",
      escolaridad: "Secundaria",
      ocupacion: "Ama de casa",
      religion: "Católica",
      estadoCivil: "Soltera",
      tipoSanguineo: "O+",
      verificacionTipoSanguineo: "Verificado en cartilla",
      zoonosis: "Niega",
      biomasa: "Niega"
    },
    habitosVida: {
      alimentacion: "3 comidas al día, predominio de comida casera",
      consumoAgua: "~1.5 L/día",
      actividadFisica: "Caminata 3 veces por semana (30 min)",
      habitosHigienicos: "Adecuados (baño diario, higiene bucal 2 veces al día)"
    },
    sustancias: {
      tabaco: "Niega consumo",
      alcohol: "Ocasional (1–2 copas/mes)",
      otrasSustancias: "Niega"
    }
  };

  const [apnp, setApnp] = useState(ant?.apnp || defaultApnp);
  const [alergias, setAlergias] = useState(
    ant?.alergias?.length > 0 
      ? ant.alergias 
      : [
          { 
            sustancia: "Penicilina", 
            reaccion: "Exantema maculopapular y prurito", 
            confirmacion: "Referida por el paciente" 
          },
          { 
            sustancia: "Nueces", 
            reaccion: "Choque anafiláctico tras la ingestión de nueces.", 
            confirmacion: "Confirmada / Documentada",
            notaAdicional: "Cuenta con autoinyector de epinefrina (EpiPen®) y plan de manejo en caso de exposición accidental."
          }
        ]
  );

  const [tamizajes, setTamizajes] = useState(
    ant?.tamizajes?.filter(t => !t.prueba.toLowerCase().includes('vacun')) || [
      { prueba: "Exploración monofilamento de pies", fecha: "2026-06-12", resultado: "Sensibilidad conservada en ambos pies, sin callosidades ni lesiones activas" },
      { prueba: "Fondo de ojo (Retinografía)", fecha: "2025-08-10", resultado: "Retinopatía no proliferativa leve. Cita de tamizaje anual pendiente" }
    ]
  );

  const [vacunacion, setVacunacion] = useState(
    ant?.vacunacion || ant?.tamizajes?.filter(t => t.prueba.toLowerCase().includes('vacun')) || [
      { prueba: "Vacunación Influenza", fecha: "2025-11-04", resultado: "Aplicada temporada 2025-2026" },
      { prueba: "Vacunación Neumococo", fecha: "2023-04-18", resultado: "Dosis única aplicada" }
    ]
  );

  const [activeModal, setActiveModal] = useState(null);
  const [notice, setNotice] = useState('');

  // Temp form state for APNP editing
  const [apnpForm, setApnpForm] = useState(apnp);

  // Temp form state for general modal editing
  const [genericFormTitle, setGenericFormTitle] = useState('');
  const [genericFormInput, setGenericFormInput] = useState('');

  const handleOpenApnpModal = () => {
    setApnpForm(JSON.parse(JSON.stringify(apnp)));
    setActiveModal('apnp');
  };

  const handleSaveApnp = (e) => {
    e.preventDefault();
    setApnp(apnpForm);
    setActiveModal(null);
    setNotice('Antecedentes Personales No Patológicos (APNP) actualizados con éxito.');
    setTimeout(() => setNotice(''), 3000);
  };

  const handleOpenGenericModal = (sectionTitle) => {
    setGenericFormTitle(sectionTitle);
    setGenericFormInput('');
    setActiveModal('generic');
  };

  const handleSaveGeneric = (e) => {
    e.preventDefault();
    setActiveModal(null);
    setNotice(`Se registró la actualización en: ${genericFormTitle}`);
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center justify-between animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button 
            onClick={() => setNotice('')}
            className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid: 2 Columnas y 4 Filas exactamente como la imagen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        
        {/* ========================================================================= */}
        {/* FILA 1 - IZQUIERDA: CONDICIONES CRÓNICAS                                  */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-900" />
                Condiciones Crónicas
              </h3>
              <button 
                onClick={() => handleOpenGenericModal('Condiciones Crónicas')}
                className="text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar / Editar</span>
              </button>
            </div>

            <div className="space-y-3">
              {ant?.cronicos?.map((c, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{c.condicion}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.estado}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    Año {c.anio}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILA 1 - DERECHA: ALERGIAS Y REACCIONES ADVERSAS DOCUMENTADAS            */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-900" />
                Alergias y Reacciones Adversas Documentadas
              </h3>
              <button 
                onClick={() => handleOpenGenericModal('Alergias y Reacciones Adversas')}
                className="text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar / Editar</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-3">
              {alergias.map((a, i) => (
                <div key={i} className={i > 0 ? "pt-2.5 border-t border-slate-200/50" : ""}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-amber-900">{a.sustancia}</span>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap shrink-0 inline-flex items-center ${
                      a.confirmacion?.includes('Confirmada') 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70' 
                        : 'bg-amber-50 text-amber-800 border-amber-200/70'
                    }`}>
                      {a.confirmacion}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/90 font-medium">{a.reaccion}</p>
                  {a.notaAdicional && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Cuenta con autoinyector de <span className="font-bold text-slate-800">epinefrina</span> (EpiPen®) y plan de manejo en caso de exposición accidental.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILA 2 - IZQUIERDA: ANTECEDENTES HEREDOFAMILIARES                         */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-900" />
                Antecedentes Heredofamiliares
              </h3>
              <button 
                onClick={() => handleOpenGenericModal('Antecedentes Heredofamiliares')}
                className="text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar / Editar</span>
              </button>
            </div>

            <div className="space-y-3">
              {ant?.familiares?.map((f, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 text-xs">
                  <span className="font-bold text-slate-900">{f.parentesco}: </span>
                  <span className="text-slate-700">{f.enfermedad}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILA 2 - DERECHA: ANTECEDENTES PERSONALES NO PATOLÓGICOS (APNP)           */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-900" />
                Antecedentes Personales No Patológicos (APNP)
              </h3>
              <button 
                onClick={handleOpenApnpModal}
                className="text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar / Editar</span>
              </button>
            </div>

            <div className="space-y-3">
              {/* Grupo A: Datos generales y exposiciones */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900 text-xs mb-0.5">Datos generales y exposiciones</p>
                  <p>
                    <span className="font-bold text-slate-800">Originaria:</span> {apnp.datosGenerales.originaria}.{' '}
                    <span className="font-bold text-slate-800">Residencia:</span> {apnp.datosGenerales.residencia}.{' '}
                    <span className="font-bold text-slate-800">Escolaridad:</span> {apnp.datosGenerales.escolaridad}.{' '}
                    <span className="font-bold text-slate-800">Ocupación:</span> {apnp.datosGenerales.ocupacion}.{' '}
                    <span className="font-bold text-slate-800">Religión:</span> {apnp.datosGenerales.religion}.{' '}
                    <span className="font-bold text-slate-800">Estado civil:</span> {apnp.datosGenerales.estadoCivil}.{' '}
                    <span className="font-bold text-slate-800">Grupo sanguíneo y Rh:</span> {apnp.datosGenerales.tipoSanguineo}.{' '}
                    <span className="font-bold text-slate-800">Zoonosis:</span> {apnp.datosGenerales.zoonosis}.{' '}
                    <span className="font-bold text-slate-800">Exposición a biomasa:</span> {apnp.datosGenerales.biomasa}.
                  </p>
                </div>
              </div>

              {/* Grupo B: Alimentación y hábitos de vida */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Apple className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900 text-xs mb-0.5">Alimentación y hábitos de vida</p>
                  <p>
                    <span className="font-bold text-slate-800">Alimentación:</span> {apnp.habitosVida.alimentacion}.{' '}
                    <span className="font-bold text-slate-800">Consumo de agua:</span> {apnp.habitosVida.consumoAgua}.{' '}
                    <span className="font-bold text-slate-800">Actividad física:</span> {apnp.habitosVida.actividadFisica}.{' '}
                    <span className="font-bold text-slate-800">Hábitos higiénicos:</span> {apnp.habitosVida.habitosHigienicos}.
                  </p>
                </div>
              </div>

              {/* Grupo C: Consumo de sustancias */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <CircleSlash className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900 text-xs mb-0.5">Consumo de sustancias</p>
                  <p>
                    <span className="font-bold text-slate-800">Tabaco:</span> {apnp.sustancias.tabaco}.{' '}
                    <span className="font-bold text-slate-800">Alcohol:</span> {apnp.sustancias.alcohol}.{' '}
                    <span className="font-bold text-slate-800">Otras sustancias:</span> {apnp.sustancias.otrasSustancias}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILA 3 - IZQUIERDA: ANTECEDENTES QUIRÚRGICOS                              */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-emerald-900" />
                Antecedentes Quirúrgicos
              </h3>
              <button 
                onClick={() => handleOpenGenericModal('Antecedentes Quirúrgicos')}
                className="text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar / Editar</span>
              </button>
            </div>

            <div className="space-y-3">
              {ant?.quirurgicos?.map((q, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{q.procedimiento}</span>
                  <span className="text-slate-500 font-medium">Año {q.anio}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILA 3 - DERECHA: ANTECEDENTES MÉDICOS DE IMPORTANCIA                     */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-900" />
                Antecedentes Médicos de Importancia
              </h3>
              <button 
                onClick={() => handleOpenGenericModal('Antecedentes Médicos de Importancia')}
                className="text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar / Editar</span>
              </button>
            </div>

            <div className="space-y-3">
              {ant?.medicos?.map((m, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{m.evento}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{m.institucion}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    {m.fecha}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILA 4 - IZQUIERDA: TAMIZAJES CLÍNICOS                                    */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-900" />
                Tamizajes Clínicos
              </h3>
              <button 
                onClick={() => handleOpenGenericModal('Tamizajes Clínicos')}
                className="text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar / Editar</span>
              </button>
            </div>

            <div className="space-y-3">
              {tamizajes.map((t, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.prueba}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.resultado}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    {t.fecha}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILA 4 - DERECHA: VACUNACIÓN                                              */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Syringe className="w-4 h-4 text-emerald-900" />
                Vacunación
              </h3>
              <button 
                onClick={() => handleOpenGenericModal('Vacunación')}
                className="text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar / Editar</span>
              </button>
            </div>

            <div className="space-y-3">
              {vacunacion.map((v, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{v.prueba}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{v.resultado}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    {v.fecha}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL INTERACTIVO: EDITAR APNP                                            */}
      {/* ========================================================================= */}
      {activeModal === 'apnp' && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Editar Antecedentes Personales No Patológicos (APNP)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registrar o modificar datos generales, hábitos y exposiciones clínicas
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveApnp} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              
              {/* Grupo A: Datos generales y exposiciones */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <ClipboardList className="w-4 h-4 text-emerald-800" />
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                    Grupo A. Datos generales y exposiciones
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Originaria</label>
                    <input 
                      type="text" 
                      value={apnpForm.datosGenerales.originaria}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        datosGenerales: { ...apnpForm.datosGenerales, originaria: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Residencia</label>
                    <input 
                      type="text" 
                      value={apnpForm.datosGenerales.residencia}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        datosGenerales: { ...apnpForm.datosGenerales, residencia: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Escolaridad</label>
                    <select
                      value={apnpForm.datosGenerales.escolaridad}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        datosGenerales: { ...apnpForm.datosGenerales, escolaridad: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    >
                      <option value="Primaria">Primaria</option>
                      <option value="Secundaria">Secundaria</option>
                      <option value="Preparatoria / Bachillerato">Preparatoria / Bachillerato</option>
                      <option value="Licenciatura">Licenciatura</option>
                      <option value="Posgrado">Posgrado</option>
                      <option value="Sin dato">Sin dato</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Ocupación</label>
                    <input 
                      type="text" 
                      value={apnpForm.datosGenerales.ocupacion}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        datosGenerales: { ...apnpForm.datosGenerales, ocupacion: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Religión</label>
                    <select
                      value={apnpForm.datosGenerales.religion}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        datosGenerales: { ...apnpForm.datosGenerales, religion: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    >
                      <option value="Católica">Católica</option>
                      <option value="Cristiana">Cristiana</option>
                      <option value="Otra">Otra</option>
                      <option value="Ninguna">Ninguna</option>
                      <option value="No interrogado">No interrogado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Estado civil</label>
                    <select
                      value={apnpForm.datosGenerales.estadoCivil}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        datosGenerales: { ...apnpForm.datosGenerales, estadoCivil: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    >
                      <option value="Soltera">Soltera</option>
                      <option value="Soltero">Soltero</option>
                      <option value="Casada / Casado">Casada / Casado</option>
                      <option value="Unión libre">Unión libre</option>
                      <option value="Viuda / Viudo">Viuda / Viudo</option>
                      <option value="Divorciada / Divorciado">Divorciada / Divorciado</option>
                      <option value="No interrogado">No interrogado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Grupo sanguíneo y Rh</label>
                    <select
                      value={apnpForm.datosGenerales.tipoSanguineo}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        datosGenerales: { ...apnpForm.datosGenerales, tipoSanguineo: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="Sin dato">Sin dato</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Verificación de Grupo Sanguíneo</label>
                    <input 
                      type="text" 
                      value={apnpForm.datosGenerales.verificacionTipoSanguineo || 'Verificado en cartilla'}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        datosGenerales: { ...apnpForm.datosGenerales, verificacionTipoSanguineo: e.target.value }
                      })}
                      placeholder="Ej: Verificado en cartilla / Referido por el paciente"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Zoonosis</label>
                    <select
                      value={apnpForm.datosGenerales.zoonosis}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        datosGenerales: { ...apnpForm.datosGenerales, zoonosis: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    >
                      <option value="Niega">Niega</option>
                      <option value="Convivencia con caninos">Convivencia con caninos</option>
                      <option value="Convivencia con felinos">Convivencia con felinos</option>
                      <option value="Positiva (otros animales)">Positiva (otros animales)</option>
                      <option value="No interrogado">No interrogado</option>
                      <option value="Sin dato">Sin dato</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Exposición a biomasa</label>
                    <select
                      value={apnpForm.datosGenerales.biomasa}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        datosGenerales: { ...apnpForm.datosGenerales, biomasa: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    >
                      <option value="Niega">Niega</option>
                      <option value="Positiva (humo de leña histórico)">Positiva (humo de leña histórico)</option>
                      <option value="Positiva activa">Positiva activa</option>
                      <option value="No interrogado">No interrogado</option>
                      <option value="Sin dato">Sin dato</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grupo B: Alimentación y hábitos de vida */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <Apple className="w-4 h-4 text-emerald-800" />
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                    Grupo B. Alimentación y hábitos de vida
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Alimentación</label>
                    <input 
                      type="text" 
                      value={apnpForm.habitosVida.alimentacion}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        habitosVida: { ...apnpForm.habitosVida, alimentacion: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Consumo de agua</label>
                      <input 
                        type="text" 
                        value={apnpForm.habitosVida.consumoAgua}
                        onChange={(e) => setApnpForm({
                          ...apnpForm,
                          habitosVida: { ...apnpForm.habitosVida, consumoAgua: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Actividad física</label>
                      <input 
                        type="text" 
                        value={apnpForm.habitosVida.actividadFisica}
                        onChange={(e) => setApnpForm({
                          ...apnpForm,
                          habitosVida: { ...apnpForm.habitosVida, actividadFisica: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Hábitos higiénicos</label>
                    <input 
                      type="text" 
                      value={apnpForm.habitosVida.habitosHigienicos}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        habitosVida: { ...apnpForm.habitosVida, habitosHigienicos: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Grupo C: Consumo de sustancias */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <CircleSlash className="w-4 h-4 text-emerald-800" />
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                    Grupo C. Consumo de sustancias
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Tabaco</label>
                    <select
                      value={apnpForm.sustancias.tabaco}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        sustancias: { ...apnpForm.sustancias, tabaco: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    >
                      <option value="Niega consumo">Niega consumo</option>
                      <option value="Exfumador">Exfumador</option>
                      <option value="Fumador activo ocasional">Fumador activo ocasional</option>
                      <option value="Fumador activo diario">Fumador activo diario</option>
                      <option value="No interrogado">No interrogado</option>
                      <option value="Sin dato">Sin dato</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Alcohol</label>
                    <select
                      value={apnpForm.sustancias.alcohol}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        sustancias: { ...apnpForm.sustancias, alcohol: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    >
                      <option value="Niega consumo">Niega consumo</option>
                      <option value="Ocasional (1–2 copas/mes)">Ocasional (1–2 copas/mes)</option>
                      <option value="Semanal moderado">Semanal moderado</option>
                      <option value="Consumo de riesgo">Consumo de riesgo</option>
                      <option value="No interrogado">No interrogado</option>
                      <option value="Sin dato">Sin dato</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Otras sustancias</label>
                    <select
                      value={apnpForm.sustancias.otrasSustancias}
                      onChange={(e) => setApnpForm({
                        ...apnpForm,
                        sustancias: { ...apnpForm.sustancias, otrasSustancias: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800"
                    >
                      <option value="Niega">Niega</option>
                      <option value="Uso terapéutico regulado">Uso terapéutico regulado</option>
                      <option value="Positiva">Positiva</option>
                      <option value="No interrogado">No interrogado</option>
                      <option value="Sin dato">Sin dato</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-950 text-white font-semibold hover:bg-emerald-900 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar APNP</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL GENÉRICO: AGREGAR / EDITAR EN OTRAS SECCIONES                       */}
      {/* ========================================================================= */}
      {activeModal === 'generic' && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Agregar / Editar: {genericFormTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500">Actualización en expediente clínico</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGeneric} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Descripción o nuevo registro clínico
                </label>
                <textarea
                  rows={3}
                  value={genericFormInput}
                  onChange={(e) => setGenericFormInput(e.target.value)}
                  placeholder={`Ingrese la actualización o nuevo antecedente para ${genericFormTitle}...`}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 text-slate-800 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-950 text-white font-semibold hover:bg-emerald-900 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar registro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

