import React, { useState, useEffect } from 'react';
import {
  Scale,
  Ruler,
  Activity,
  Apple,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Edit3,
  Check,
  X,
  Info,
  Calendar,
  ShieldCheck,
  Flame,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import {
  calculateClientBMI,
  calculateClientWHR,
  calculateClientMifflin,
  addAnthropometryApi,
  updateLifestyleApi,
  validateFieldApi
} from '../../../services/patientApiService';

export default function TabAntropometriaEstiloVida({ patient, onPatientUpdated }) {
  const [selectedActivityFactor, setSelectedActivityFactor] = useState(1.2);
  const [isMedicionModalOpen, setIsMedicionModalOpen] = useState(false);
  const [isLifestyleModalOpen, setIsLifestyleModalOpen] = useState(null); // 'actividad' | 'alimentacion'
  const [activeEvolutionTab, setActiveEvolutionTab] = useState('peso'); // 'peso' | 'imc' | 'cintura'

  // New Measurement Form State
  const [newMedForm, setNewMedForm] = useState({
    peso: '',
    talla: '',
    cintura: '',
    cadera: '',
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'seguimiento',
    fuente: 'medico',
    notas: ''
  });
  const [medError, setMedError] = useState('');
  const [isSubmittingMed, setIsSubmittingMed] = useState(false);

  // Lifestyle Form State
  const [lifestyleForm, setLifestyleForm] = useState({
    tipoActividad: '',
    diasSemana: '',
    minutosSesion: '',
    intensidad: 'Moderada',
    ejerciciosFuerza: '',
    limitaciones: '',
    habitosGenerales: '',
    bebidasAzucaradas: '',
    alimentosFrecuentes: '',
    alergiasIntolerancias: '',
    fuente: 'medico'
  });

  const mediciones = patient?.antropometria?.mediciones || [];
  const latestMed = mediciones.length > 0 ? mediciones[mediciones.length - 1] : null;

  // Sync new measurement default talla from latest measurement or patient
  useEffect(() => {
    if (latestMed?.talla) {
      setNewMedForm(prev => ({ ...prev, talla: String(latestMed.talla) }));
    }
  }, [latestMed]);

  // Calculations for latest measurement
  const bmiCalc = latestMed
    ? calculateClientBMI(latestMed.peso, latestMed.talla, patient?.sexo)
    : null;
  const whrCalc = latestMed
    ? calculateClientWHR(latestMed.cintura, latestMed.cadera, patient?.sexo)
    : null;

  // Energy requirements calculation (Mifflin–St Jeor 1990)
  const energyCalc = latestMed
    ? calculateClientMifflin(
        latestMed.peso,
        latestMed.talla,
        patient?.edad,
        patient?.sexo,
        selectedActivityFactor
      )
    : { calculable: false, mensaje: 'Sin medición antropométrica basal registrada.' };

  // Handlers for New Anthropometry Measurement
  const handleOpenMedicionModal = () => {
    setNewMedForm({
      peso: '',
      talla: latestMed?.talla ? String(latestMed.talla) : '',
      cintura: '',
      cadera: '',
      fecha: new Date().toISOString().split('T')[0],
      tipo: mediciones.length === 0 ? 'basal' : 'seguimiento',
      fuente: 'medico',
      notas: ''
    });
    setMedError('');
    setIsMedicionModalOpen(true);
  };

  const handleSaveMedicion = async (e) => {
    e.preventDefault();
    if (!newMedForm.peso || !newMedForm.talla) {
      setMedError('El peso (kg) y la talla (cm) son obligatorios.');
      return;
    }

    setIsSubmittingMed(true);
    setMedError('');
    try {
      const res = await addAnthropometryApi(patient.id, newMedForm);
      if (onPatientUpdated) {
        onPatientUpdated(res.patient);
      }
      setIsSubmittingMed(false);
      setIsMedicionModalOpen(false);
    } catch (err) {
      setIsSubmittingMed(false);
      setMedError(err.message || 'Error al guardar la medición');
    }
  };

  // Handlers for Lifestyle Form
  const handleOpenLifestyleModal = (section) => {
    const estilo = patient?.estiloVida || {};
    if (section === 'actividad') {
      const act = estilo.actividadFisica || {};
      setLifestyleForm(prev => ({
        ...prev,
        tipoActividad: act.tipoActividad || '',
        diasSemana: act.diasSemana !== undefined ? String(act.diasSemana) : '',
        minutosSesion: act.minutosSesion !== undefined ? String(act.minutosSesion) : '',
        intensidad: act.intensidad || 'Moderada',
        ejerciciosFuerza: act.ejerciciosFuerza || '',
        limitaciones: act.limitaciones || '',
        fuente: 'medico'
      }));
    } else {
      const ali = estilo.alimentacion || {};
      setLifestyleForm(prev => ({
        ...prev,
        habitosGenerales: ali.habitosGenerales || '',
        bebidasAzucaradas: ali.bebidasAzucaradas || '',
        alimentosFrecuentes: ali.alimentosFrecuentes || '',
        alergiasIntolerancias: ali.alergiasIntolerancias || '',
        fuente: 'medico'
      }));
    }
    setIsLifestyleModalOpen(section);
  };

  const handleSaveLifestyle = async (e) => {
    e.preventDefault();
    try {
      let payload = {};
      if (isLifestyleModalOpen === 'actividad') {
        payload = {
          actividadFisica: {
            tipoActividad: lifestyleForm.tipoActividad,
            diasSemana: parseInt(lifestyleForm.diasSemana, 10) || 0,
            minutosSesion: parseInt(lifestyleForm.minutosSesion, 10) || 0,
            intensidad: lifestyleForm.intensidad,
            ejerciciosFuerza: lifestyleForm.ejerciciosFuerza,
            limitaciones: lifestyleForm.limitaciones
          },
          fuente: lifestyleForm.fuente
        };
      } else {
        payload = {
          alimentacion: {
            habitosGenerales: lifestyleForm.habitosGenerales,
            bebidasAzucaradas: lifestyleForm.bebidasAzucaradas,
            alimentosFrecuentes: lifestyleForm.alimentosFrecuentes,
            alergiasIntolerancias: lifestyleForm.alergiasIntolerancias
          },
          fuente: lifestyleForm.fuente
        };
      }

      const res = await updateLifestyleApi(patient.id, payload);
      if (onPatientUpdated) {
        onPatientUpdated(res.patient);
      }
      setIsLifestyleModalOpen(null);
    } catch (err) {
      alert(`Error al guardar: ${err.message}`);
    }
  };

  const handleValidateField = async (section) => {
    if (!window.confirm(`¿Confirmas la validación médica de la información de ${section === 'actividadFisica' ? 'actividad física' : 'alimentación'} reportada por el paciente?`)) {
      return;
    }
    try {
      const res = await validateFieldApi(patient.id, {
        section,
        notas: 'Validado por médico tratante en revisión clínica'
      });
      if (onPatientUpdated) {
        onPatientUpdated(res.patient);
      }
    } catch (err) {
      alert(`Error al validar: ${err.message}`);
    }
  };

  // Preview for modal
  const liveModalBMI = calculateClientBMI(newMedForm.peso, newMedForm.talla, patient?.sexo);
  const liveModalWHR = calculateClientWHR(newMedForm.cintura, newMedForm.cadera, patient?.sexo);

  const actFisica = patient?.estiloVida?.actividadFisica || {};
  const alimentacion = patient?.estiloVida?.alimentacion || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. SECCIÓN: ANTROPOMETRÍA */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lazo-sage text-lazo-primary flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  1. Antropometría y Composición Corporal
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  {latestMed ? `Última toma: ${latestMed.fecha}` : 'Sin mediciones'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Seguimiento de peso, talla, cintura, cadera y relaciones biométricas proporcionales
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenMedicionModal}
            className="px-4 py-2.5 rounded-2xl bg-lazo-primary hover:bg-lazo-primary-hover text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-soft shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Medición</span>
          </button>
        </div>

        {/* Current Measurements Cards Grid */}
        {latestMed ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Peso */}
            <div className="bg-lazo-canvas/70 p-4 rounded-2xl border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Peso Actual</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">{latestMed.peso}</span>
                <span className="text-xs font-bold text-slate-500">kg</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Toma: {latestMed.tipo || 'seguimiento'}</p>
            </div>

            {/* Talla */}
            <div className="bg-lazo-canvas/70 p-4 rounded-2xl border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Talla</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">{latestMed.talla}</span>
                <span className="text-xs font-bold text-slate-500">cm</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {bmiCalc?.esTallaBaja ? (
                  <span className="text-amber-700 font-bold">Talla baja ({patient?.sexo})</span>
                ) : (
                  'Estatura estándar'
                )}
              </p>
            </div>

            {/* IMC */}
            <div className={`p-4 rounded-2xl border ${
              bmiCalc?.bmi >= 30 
                ? 'bg-amber-50/70 border-amber-200' 
                : bmiCalc?.bmi >= 25 
                  ? 'bg-yellow-50/70 border-yellow-200' 
                  : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">IMC</p>
                {bmiCalc?.esTallaBaja && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900" title="Criterio NOM-008-SSA3-2017">
                    NOM-008
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">{latestMed.imc || bmiCalc?.bmi}</span>
                <span className="text-xs font-bold text-slate-500">kg/m²</span>
              </div>
              <p className="text-[11px] font-bold text-slate-800 mt-1 truncate" title={bmiCalc?.clasificacion}>
                {bmiCalc?.clasificacion || 'No calculado'}
              </p>
            </div>

            {/* Cintura */}
            <div className="bg-lazo-canvas/70 p-4 rounded-2xl border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cintura</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  {latestMed.cintura ? latestMed.cintura : '--'}
                </span>
                <span className="text-xs font-bold text-slate-500">cm</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {whrCalc?.riesgoCintura ? (
                  <span className="text-red-700 font-bold">Riesgo (≥{whrCalc.umbralCintura}cm)</span>
                ) : latestMed.cintura ? (
                  <span className="text-emerald-700 font-semibold">Dentro de límite</span>
                ) : (
                  'No registrada'
                )}
              </p>
            </div>

            {/* Cadera */}
            <div className="bg-lazo-canvas/70 p-4 rounded-2xl border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cadera</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  {latestMed.cadera ? latestMed.cadera : '--'}
                </span>
                <span className="text-xs font-bold text-slate-500">cm</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Circunferencia glútea</p>
            </div>

            {/* ICC */}
            <div className="bg-lazo-canvas/70 p-4 rounded-2xl border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Índice C/C (ICC)</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  {latestMed.icc || whrCalc?.whr || '--'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {whrCalc ? (
                  whrCalc.riesgoICC ? (
                    <span className="text-red-700 font-bold">Riesgo visceral</span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">Bajo riesgo</span>
                  )
                ) : (
                  'Requiere cadera'
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-lazo-canvas/40 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500">No hay mediciones antropométricas registradas para este paciente.</p>
            <button
              onClick={handleOpenMedicionModal}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lazo-primary text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar primera medición</span>
            </button>
          </div>
        )}

        {/* Disclaimer / Clarification Notice */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-600 leading-relaxed">
            <p>
              <strong>Criterio normativo aplicado:</strong> Las clasificaciones de IMC incorporan los puntos de corte ajustados de la <strong>NOM-008-SSA3-2017</strong> y <strong>NOM-015-SSA2-2010</strong> para adultos de talla baja en población mexicana (mujeres &lt;1.50 m y hombres &lt;1.60 m: sobrepeso 23.0–24.9 kg/m² y obesidad ≥25.0 kg/m²). La relación cintura-cadera utiliza umbrales de riesgo cardiovascular de la OMS (≥0.90 en hombres, ≥0.85 en mujeres). <em>Este módulo es de monitoreo referencial e informativo y no emite diagnósticos terapéuticos automatizados.</em>
            </p>
          </div>
        </div>

        {/* Historical Measurements Table */}
        {mediciones.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Historial de Mediciones Registradas ({mediciones.length})
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-lazo-canvas/60 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Peso</th>
                    <th className="py-3 px-4">Talla</th>
                    <th className="py-3 px-4">IMC (kg/m²)</th>
                    <th className="py-3 px-4">Cintura</th>
                    <th className="py-3 px-4">Cadera</th>
                    <th className="py-3 px-4">ICC</th>
                    <th className="py-3 px-4">Fuente / Estado</th>
                    <th className="py-3 px-4">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mediciones.map((m, idx) => (
                    <tr key={m.id || idx} className="hover:bg-lazo-canvas/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">{m.fecha}</td>
                      <td className="py-3 px-4 capitalize text-slate-600">{m.tipo || 'seguimiento'}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{m.peso} kg</td>
                      <td className="py-3 px-4 text-slate-700">{m.talla} cm</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800">{m.imc || '--'}</span>
                        {m.imcDetalle?.clasificacion && (
                          <span className="text-[10px] text-slate-500 block">
                            {m.imcDetalle.clasificacion}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{m.cintura ? `${m.cintura} cm` : '--'}</td>
                      <td className="py-3 px-4 text-slate-700">{m.cadera ? `${m.cadera} cm` : '--'}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{m.icc || '--'}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
                            m.fuente === 'llamada'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {m.fuente === 'llamada' ? 'Llamada telefónica' : 'Consulta médica'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {m.estadoValidacion === 'validado' ? 'Validado' : 'Reportado por paciente'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate" title={m.notas}>
                        {m.notas || '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2. SECCIÓN: REQUERIMIENTOS ENERGÉTICOS (Mifflin–St Jeor 1990) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  2. Estimación de Requerimientos Energéticos
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                  Mifflin–St Jeor (1990)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cálculo determinista de Gasto Energético en Reposo (GER) y Gasto Energético Total (GET)
              </p>
            </div>
          </div>

          {/* Activity Factor Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Factor de actividad:</span>
            <select
              value={selectedActivityFactor}
              onChange={(e) => setSelectedActivityFactor(parseFloat(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs font-semibold text-slate-800 focus:outline-none focus:border-lazo-primary"
            >
              <option value="1.2">Sedentario (1.20) - Poco o ningún ejercicio</option>
              <option value="1.375">Ligero (1.375) - Ejercicio 1–3 días/sem</option>
              <option value="1.55">Moderado (1.55) - Ejercicio 3–5 días/sem</option>
              <option value="1.725">Intenso (1.725) - Ejercicio 6–7 días/sem</option>
            </select>
          </div>
        </div>

        {energyCalc.calculable ? (
          <div className="space-y-6">
            {/* Energy KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* GER */}
              <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-200/80">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Gasto Energético en Reposo (GER / TMB)
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-black text-amber-950 tracking-tight">
                    {energyCalc.gerKcal}
                  </span>
                  <span className="text-sm font-bold text-amber-800">kcal/día</span>
                </div>
                <p className="text-xs text-amber-800/80 mt-2">
                  Energía mínima requerida para el mantenimiento de funciones vitales basales.
                </p>
              </div>

              {/* GET */}
              <div className="p-6 rounded-3xl bg-lazo-mint/20 border border-lazo-mint/70">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-lazo-primary uppercase tracking-wider">
                    Gasto Energético Total Estimado (GET)
                  </p>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-lazo-mint text-lazo-primary">
                    Factor {selectedActivityFactor}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">
                    {energyCalc.getKcal}
                  </span>
                  <span className="text-sm font-bold text-lazo-primary">kcal/día</span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  {energyCalc.variablesUtilizadas.descripcionFactor}
                </p>
              </div>
            </div>

            {/* Formula and Variables Breakdown */}
            <div className="bg-lazo-canvas/60 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Desglose de Ecuación y Variables Utilizadas
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="font-semibold text-slate-500">Fórmula de cálculo:</span>
                  <p className="font-mono font-bold text-slate-900 bg-slate-50 p-2 rounded-lg text-[11px]">
                    {energyCalc.formulaEcuacion}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Mifflin MD, St Jeor ST, et al. Am J Clin Nutr 1990.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="font-semibold text-slate-500">Variables clínicas aplicadas:</span>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    <li>• <strong>Peso:</strong> {energyCalc.variablesUtilizadas.pesoKg} kg (toma del {latestMed?.fecha})</li>
                    <li>• <strong>Talla:</strong> {energyCalc.variablesUtilizadas.tallaCm} cm</li>
                    <li>• <strong>Edad:</strong> {energyCalc.variablesUtilizadas.edadAños} años</li>
                    <li>• <strong>Sexo:</strong> {energyCalc.variablesUtilizadas.sexo}</li>
                  </ul>
                </div>
              </div>

              {/* Explicit Medical Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900">
                <p>
                  <strong>Advertencia clínica:</strong> {energyCalc.avisoClinico}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-xs text-slate-600 font-medium">{energyCalc.mensaje}</p>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. SECCIÓN: ACTIVIDAD FÍSICA */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  3. Actividad Física y Movilidad
                </h2>
                {/* Provenance Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  actFisica.fuente === 'llamada'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Fuente: {actFisica.fuente === 'llamada' ? 'Llamada telefónica' : 'Consulta médica'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  actFisica.estadoValidacion === 'validado'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {actFisica.estadoValidacion === 'validado' ? 'Validado por médico' : 'Reportado por paciente'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Patrón semanal de ejercicio aeróbico, fuerza, duración e intolerancias al esfuerzo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actFisica.estadoValidacion === 'reportado_paciente' && (
              <button
                onClick={() => handleValidateField('actividadFisica')}
                className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Validar reporte</span>
              </button>
            )}
            <button
              onClick={() => handleOpenLifestyleModal('actividad')}
              className="px-3.5 py-2 rounded-2xl bg-lazo-canvas hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Editar actividad</span>
            </button>
          </div>
        </div>

        {/* Structured Activity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-lazo-canvas/60 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tipo de Actividad</span>
            <p className="text-sm font-bold text-slate-900">{actFisica.tipoActividad || 'No especificada'}</p>
            <p className="text-[11px] text-slate-500">Intensidad: <strong>{actFisica.intensidad || 'Moderada'}</strong></p>
          </div>

          <div className="bg-lazo-canvas/60 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Frecuencia y Duración</span>
            <p className="text-sm font-bold text-slate-900">
              {actFisica.diasSemana ? `${actFisica.diasSemana} días por semana` : 'No registrada'}
            </p>
            <p className="text-[11px] text-slate-500">
              {actFisica.minutosSesion ? `${actFisica.minutosSesion} minutos por sesión` : '--'}
            </p>
          </div>

          <div className="bg-lazo-canvas/60 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Fuerza y Limitaciones</span>
            <p className="text-xs font-medium text-slate-800">
              Fuerza: {actFisica.ejerciciosFuerza || 'No realiza'}
            </p>
            <p className="text-[11px] text-amber-800">
              Limitaciones: {actFisica.limitaciones || 'Sin limitaciones referidas'}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECCIÓN: ALIMENTACIÓN */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  4. Alimentación y Hábitos Nutricionales
                </h2>
                {/* Provenance Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  alimentacion.fuente === 'llamada'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Fuente: {alimentacion.fuente === 'llamada' ? 'Llamada telefónica' : 'Consulta médica'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  alimentacion.estadoValidacion === 'validado'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {alimentacion.estadoValidacion === 'validado' ? 'Validado por médico' : 'Reportado por paciente'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Consumo básico, bebidas azucaradas, alimentos mexicanos habituales y alergias alimentarias
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {alimentacion.estadoValidacion === 'reportado_paciente' && (
              <button
                onClick={() => handleValidateField('alimentacion')}
                className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Validar reporte</span>
              </button>
            )}
            <button
              onClick={() => handleOpenLifestyleModal('alimentacion')}
              className="px-3.5 py-2 rounded-2xl bg-lazo-canvas hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Editar hábitos</span>
            </button>
          </div>
        </div>

        {/* Structured Nutrition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-lazo-canvas/60 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Hábitos Generales y Frecuencia
            </span>
            <p className="text-xs text-slate-800 leading-relaxed">
              {alimentacion.habitosGenerales || 'No especificados'}
            </p>
          </div>

          <div className="bg-lazo-canvas/60 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Bebidas Azucaradas y Líquidos
            </span>
            <p className="text-xs text-slate-800 leading-relaxed">
              {alimentacion.bebidasAzucaradas || 'Niega consumo'}
            </p>
          </div>

          <div className="bg-lazo-canvas/60 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Alimentos Habituales (Dieta Tradicional Mexicana)
            </span>
            <p className="text-xs text-slate-800 leading-relaxed">
              {alimentacion.alimentosFrecuentes || 'Tortillas de maíz, frijoles de la olla, verduras de temporada'}
            </p>
          </div>

          <div className="bg-lazo-canvas/60 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Alergias e Intolerancias Alimentarias
            </span>
            <p className="text-xs text-slate-800 leading-relaxed">
              {alimentacion.alergiasIntolerancias || 'Sin alergias alimentarias conocidas'}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECCIÓN: PLAN NUTRICIONAL (Fase V3 en desarrollo) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  5. Plan Nutricional Individualizado
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                  Fase V3 en desarrollo
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Prescripción clínica de macronutrientes, equivalentes y metas terapéuticas
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-lazo-primary shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800">
              Prescripción exclusivamente facultativa:
            </p>
            <p>
              El módulo de Plan Nutricional formal se encuentra reservado para la Fase V3. Por directriz de seguridad clínica, <strong>LAZO no genera dietas sintéticas ni menús automatizados sin supervisión directa</strong>. La pauta de equivalentes y planes de alimentación debe ser formulada directamente por el médico o nutriólogo tratante en la consulta clínica.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECCIÓN: EVOLUCIÓN HISTÓRICA (Gráficas interactivas SVG) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-card p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lazo-mint/50 text-lazo-primary flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                6. Evolución Temporal de Parámetros Antropométricos
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Trayectoria cronológica de mediciones persistidas en el expediente
              </p>
            </div>
          </div>

          {/* Metric Selector for Chart */}
          <div className="flex items-center gap-1.5 bg-lazo-canvas p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveEvolutionTab('peso')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeEvolutionTab === 'peso'
                  ? 'bg-white text-lazo-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Peso (kg)
            </button>
            <button
              onClick={() => setActiveEvolutionTab('imc')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeEvolutionTab === 'imc'
                  ? 'bg-white text-lazo-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              IMC (kg/m²)
            </button>
            <button
              onClick={() => setActiveEvolutionTab('cintura')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeEvolutionTab === 'cintura'
                  ? 'bg-white text-lazo-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cintura (cm)
            </button>
          </div>
        </div>

        {/* Chart Visualization */}
        {mediciones.length > 0 ? (
          <div className="space-y-4">
            <EvolutionChart
              data={mediciones}
              metric={activeEvolutionTab}
              sexo={patient?.sexo}
            />

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                  Consulta presencial
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
                  Reportado en llamada telefónica
                </span>
              </div>
              <span>Total de puntos persistidos: {mediciones.length}</span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-lazo-canvas/40 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500">
              No hay puntos históricos registrados para graficar evolución.
            </p>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR MEDICIÓN ANTROPOMÉTRICA */}
      {/* ========================================================================= */}
      {isMedicionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-modal w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-lazo-canvas/50">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-lazo-primary" />
                <h3 className="text-sm font-bold text-slate-900">Registrar Medición Antropométrica</h3>
              </div>
              <button
                onClick={() => setIsMedicionModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMedicion} className="p-6 space-y-4">
              {medError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                  {medError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peso (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newMedForm.peso}
                    onChange={(e) => setNewMedForm({ ...newMedForm, peso: e.target.value })}
                    placeholder="Ej. 82.5"
                    className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Talla (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newMedForm.talla}
                    onChange={(e) => setNewMedForm({ ...newMedForm, talla: e.target.value })}
                    placeholder="Ej. 172"
                    className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cintura (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newMedForm.cintura}
                    onChange={(e) => setNewMedForm({ ...newMedForm, cintura: e.target.value })}
                    placeholder="Ej. 94"
                    className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cadera (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newMedForm.cadera}
                    onChange={(e) => setNewMedForm({ ...newMedForm, cadera: e.target.value })}
                    placeholder="Ej. 104"
                    className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Toma</label>
                  <input
                    type="date"
                    value={newMedForm.fecha}
                    onChange={(e) => setNewMedForm({ ...newMedForm, fecha: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fuente</label>
                  <select
                    value={newMedForm.fuente}
                    onChange={(e) => setNewMedForm({ ...newMedForm, fuente: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                  >
                    <option value="medico">Consulta presencial (Médico)</option>
                    <option value="llamada">Reportada por paciente (Llamada)</option>
                  </select>
                </div>
              </div>

              {/* Real-time Calculation Preview */}
              {(liveModalBMI || liveModalWHR) && (
                <div className="p-3 rounded-xl bg-lazo-mint/20 border border-lazo-mint/60 space-y-1 text-xs">
                  {liveModalBMI && (
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">IMC estimado:</span>
                      <span className="font-bold text-lazo-primary">
                        {liveModalBMI.bmi} kg/m² ({liveModalBMI.clasificacion})
                      </span>
                    </div>
                  )}
                  {liveModalWHR && (
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">ICC estimado:</span>
                      <span className="font-bold text-lazo-primary">{liveModalWHR.whr}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas clínicas (opcional)</label>
                <textarea
                  rows={2}
                  value={newMedForm.notas}
                  onChange={(e) => setNewMedForm({ ...newMedForm, notas: e.target.value })}
                  placeholder="Ej. Medición en ayuno con báscula calibrada de consultorio."
                  className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMedicionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMed}
                  className="px-4 py-2 rounded-xl bg-lazo-primary text-white text-xs font-bold hover:bg-lazo-primary-hover shadow-soft"
                >
                  {isSubmittingMed ? 'Guardando...' : 'Guardar Medición'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR ESTILO DE VIDA (ACTIVIDAD O ALIMENTACIÓN) */}
      {/* ========================================================================= */}
      {isLifestyleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-modal w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-lazo-canvas/50">
              <div className="flex items-center gap-2">
                {isLifestyleModalOpen === 'actividad' ? (
                  <Activity className="w-5 h-5 text-emerald-700" />
                ) : (
                  <Apple className="w-5 h-5 text-orange-700" />
                )}
                <h3 className="text-sm font-bold text-slate-900">
                  {isLifestyleModalOpen === 'actividad'
                    ? 'Editar Parámetros de Actividad Física'
                    : 'Editar Hábitos de Alimentación'}
                </h3>
              </div>
              <button
                onClick={() => setIsLifestyleModalOpen(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLifestyle} className="p-6 space-y-4">
              {isLifestyleModalOpen === 'actividad' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Actividad</label>
                    <input
                      type="text"
                      value={lifestyleForm.tipoActividad}
                      onChange={(e) => setLifestyleForm({ ...lifestyleForm, tipoActividad: e.target.value })}
                      placeholder="Ej. Caminata a paso ligero en parque"
                      className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Días por semana</label>
                      <input
                        type="number"
                        min="0"
                        max="7"
                        value={lifestyleForm.diasSemana}
                        onChange={(e) => setLifestyleForm({ ...lifestyleForm, diasSemana: e.target.value })}
                        placeholder="Ej. 4"
                        className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Minutos por sesión</label>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={lifestyleForm.minutosSesion}
                        onChange={(e) => setLifestyleForm({ ...lifestyleForm, minutosSesion: e.target.value })}
                        placeholder="Ej. 35"
                        className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Intensidad</label>
                    <select
                      value={lifestyleForm.intensidad}
                      onChange={(e) => setLifestyleForm({ ...lifestyleForm, intensidad: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                    >
                      <option value="Ligera">Ligera</option>
                      <option value="Moderada">Moderada</option>
                      <option value="Vigorosa">Vigorosa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ejercicios de fuerza</label>
                    <input
                      type="text"
                      value={lifestyleForm.ejerciciosFuerza}
                      onChange={(e) => setLifestyleForm({ ...lifestyleForm, ejerciciosFuerza: e.target.value })}
                      placeholder="Ej. Ligas de resistencia o peso corporal 2 días/sem"
                      className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Limitaciones o síntomas</label>
                    <input
                      type="text"
                      value={lifestyleForm.limitaciones}
                      onChange={(e) => setLifestyleForm({ ...lifestyleForm, limitaciones: e.target.value })}
                      placeholder="Ej. Dolor mecánico leve en rodilla derecha tras 30 min"
                      className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hábitos Generales y Frecuencia</label>
                    <textarea
                      rows={2}
                      value={lifestyleForm.habitosGenerales}
                      onChange={(e) => setLifestyleForm({ ...lifestyleForm, habitosGenerales: e.target.value })}
                      placeholder="Ej. 3 comidas formales y 1 colación al día, predominio de comida preparada en casa."
                      className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bebidas azucaradas y líquidos</label>
                    <input
                      type="text"
                      value={lifestyleForm.bebidasAzucaradas}
                      onChange={(e) => setLifestyleForm({ ...lifestyleForm, bebidasAzucaradas: e.target.value })}
                      placeholder="Ej. Refresco ocasional los domingos (1 vaso), agua simple 1.8 L/día"
                      className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alimentos Habituales (Dieta Mexicana)</label>
                    <input
                      type="text"
                      value={lifestyleForm.alimentosFrecuentes}
                      onChange={(e) => setLifestyleForm({ ...lifestyleForm, alimentosFrecuentes: e.target.value })}
                      placeholder="Ej. Tortillas de maíz (3–4 al día), frijoles de la olla, pollo y verduras"
                      className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alergias e intolerancias</label>
                    <input
                      type="text"
                      value={lifestyleForm.alergiasIntolerancias}
                      onChange={(e) => setLifestyleForm({ ...lifestyleForm, alergiasIntolerancias: e.target.value })}
                      placeholder="Ej. Niega alergias alimentarias; intolerancia leve a lácteos enteros"
                      className="w-full px-3 py-2 rounded-xl bg-lazo-canvas border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-lazo-primary"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLifestyleModalOpen(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-lazo-primary text-white text-xs font-bold hover:bg-lazo-primary-hover shadow-soft"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUBCOMPONENTE: EVOLUTION CHART (SVG PURO)
// Graficación reactiva de puntos históricos
// ==========================================
function EvolutionChart({ data = [], metric = 'peso', sexo = 'Masculino' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Filter valid points for selected metric
  const validPoints = data
    .filter(d => {
      if (metric === 'peso') return d.peso && d.peso > 0;
      if (metric === 'imc') return d.imc && d.imc > 0;
      if (metric === 'cintura') return d.cintura && d.cintura > 0;
      return false;
    })
    .map(d => ({
      fecha: d.fecha,
      valor: metric === 'peso' ? d.peso : metric === 'imc' ? d.imc : d.cintura,
      fuente: d.fuente || 'medico',
      tipo: d.tipo || 'seguimiento',
      notas: d.notas || ''
    }));

  if (validPoints.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-400">
        No hay registros suficientes para {metric}.
      </div>
    );
  }

  const values = validPoints.map(p => p.valor);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.2 || 2;
  const yMin = Math.max(0, Math.floor(minVal - padding));
  const yMax = Math.ceil(maxVal + padding);

  const width = 680;
  const height = 220;
  const padLeft = 55;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 35;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (index) => {
    if (validPoints.length === 1) return padLeft + chartW / 2;
    return padLeft + (index / (validPoints.length - 1)) * chartW;
  };

  const getY = (val) => {
    if (yMax === yMin) return padTop + chartH / 2;
    return padTop + chartH - ((val - yMin) / (yMax - yMin)) * chartH;
  };

  // Build SVG path
  const pathD = validPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.valor)}`)
    .join(' ');

  const areaD = `${pathD} L ${getX(validPoints.length - 1)} ${padTop + chartH} L ${getX(0)} ${padTop + chartH} Z`;

  const unitLabel = metric === 'peso' ? 'kg' : metric === 'imc' ? 'kg/m²' : 'cm';

  return (
    <div className="relative bg-white p-4 rounded-2xl border border-slate-100 overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B4236" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0B4236" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = padTop + chartH * pct;
          const val = (yMax - pct * (yMax - yMin)).toFixed(1);
          return (
            <g key={i}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth="1"
                strokeDasharray={pct === 1 ? 'none' : '3 3'}
              />
              <text
                x={padLeft - 10}
                y={y + 3.5}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        {validPoints.length > 1 && (
          <path d={areaD} fill="url(#areaGradient)" />
        )}

        {/* Main Line */}
        {validPoints.length > 1 && (
          <path
            d={pathD}
            fill="none"
            stroke="#0B4236"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Points */}
        {validPoints.map((p, idx) => {
          const cx = getX(idx);
          const cy = getY(p.valor);
          const isCall = p.fuente === 'llamada';
          const pointColor = isCall ? '#9333EA' : '#0B4236';

          return (
            <g
              key={idx}
              className="cursor-pointer transition-transform hover:scale-125"
              onMouseEnter={() => setHoveredPoint({ ...p, cx, cy })}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={cx}
                cy={cy}
                r="5"
                fill="white"
                stroke={pointColor}
                strokeWidth="2.5"
              />
              {/* X Date Label */}
              <text
                x={cx}
                y={height - 8}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 font-medium"
              >
                {p.fecha}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover Floating Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-10 pointer-events-none bg-slate-900/90 backdrop-blur-sm text-white px-3 py-2 rounded-xl text-xs shadow-lg space-y-0.5"
          style={{
            left: `${(hoveredPoint.cx / width) * 100}%`,
            top: `${Math.max(10, (hoveredPoint.cy / height) * 100 - 30)}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <p className="font-bold">
            {hoveredPoint.valor} {unitLabel}
          </p>
          <p className="text-[10px] text-slate-300">
            {hoveredPoint.fecha} · {hoveredPoint.fuente === 'llamada' ? 'Llamada telefónica' : 'Consulta médica'}
          </p>
          {hoveredPoint.notas && (
            <p className="text-[9px] text-slate-400 italic max-w-xs truncate">
              {hoveredPoint.notas}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
