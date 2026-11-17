import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import LazoLogo from '../components/common/LazoLogo';
import { loginReviewerApi } from '../services/authApiService';

export default function LoginView({ onLogin }) {
  const [activeTab, setActiveTab] = useState('academic'); // 'academic' | 'institutional'
  
  // Academic form
  const [passkey, setPasskey] = useState('');
  const [reviewerName, setReviewerName] = useState('');

  // Institutional form
  const [email, setEmail] = useState('anamar.cordero@lazo-salud.mx');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleAcademicSubmit = async (e) => {
    e.preventDefault();
    if (!passkey.trim()) {
      setErrorMessage('Por favor ingresa la clave de acceso de evaluación.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await loginReviewerApi(passkey.trim(), (reviewerName.trim() || 'Evaluador Académico'));
      if (onLogin) {
        onLogin(data.reviewer);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Clave de acceso no válida.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstitutionalSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Por favor ingresa tu contraseña institucional.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Valida credencial contra el portal médico
      const data = await loginReviewerApi(password.trim(), 'Dra. Anamar Cordero Valle');
      if (onLogin) {
        onLogin(data.reviewer);
      }
    } catch (err) {
      setErrorMessage('Contraseña institucional no válida.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Columna Izquierda (~45%): Panel Editorial y Visual */}
      <div className="lg:w-[45%] bg-lazo-primary p-10 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden">
        {/* Soft decorative background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-lazo-mint/10 rounded-full -ml-28 -mb-28 pointer-events-none"></div>

        <div>
          <div className="flex flex-col gap-3">
            <LazoLogo 
              variant="white" 
              className="h-16 w-auto max-w-[240px] object-contain object-left drop-shadow-sm" 
            />
            <div className="flex items-center gap-2 pl-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              <p className="text-[11px] font-bold tracking-wider text-white/80 uppercase">Portal Clínico V2 · Protocolo NOM-004</p>
            </div>
          </div>
        </div>

        {/* Mensaje Editorial */}
        <div className="space-y-6 my-12">
          <div className="inline-block px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md border border-white/15">
            Atención Primaria y Enfermedades Crónicas
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Cerrando el punto ciego entre consultas médicas.
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-md">
            Monitoreo continuo de adherencia, detección temprana de descompensaciones y vigilancia antropométrica en adultos con Diabetes Mellitus Tipo 2 mediante telefonía con voz humana asistida por Gemini Live.
          </p>
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-xs text-white/90 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              Entorno Aislado para Evaluadores
            </p>
            <p className="text-white/70 text-[11px] leading-relaxed">
              Los expedientes basales de demostración permanecen protegidos en modo solo lectura. Cada evaluador cuenta con su propio espacio para registrar nuevos pacientes y realizar llamadas de prueba de hasta 5 minutos.
            </p>
          </div>
        </div>

        {/* Footer regulatorio */}
        <div className="pt-6 border-t border-white/10 text-xs text-white/60 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            NOM-004 · NOM-015 · Protección de Datos
          </span>
          <span>Versión 2.0 Académica</span>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Inicio de Sesión */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-lazo-canvas">
        <div className="max-w-md w-full bg-white p-8 lg:p-10 rounded-3xl border border-slate-100 shadow-card space-y-6 animate-fadeIn">
          <div>
            <div className="lg:hidden mb-4">
              <LazoLogo variant="color" className="h-10 w-auto" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Acceso al Sistema</h3>
            <p className="text-xs text-slate-500 mt-1">
              Plataforma clínica para evaluación académica y demostración
            </p>
          </div>

          {/* Selector de pestañas: Evaluación vs Médico */}
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => { setActiveTab('academic'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'academic'
                  ? 'bg-white text-lazo-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Evaluación Académica
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('institutional'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'institutional'
                  ? 'bg-white text-lazo-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Médico Tratante
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'academic' ? (
            <form onSubmit={handleAcademicSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Clave de Acceso Académica
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="Ingresa la clave de evaluación"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-lazo-primary"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-1">
                  Clave académica compartida proporcionada al comité revisor.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nombre del Revisor / Evaluador
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Ej. Dr. Roberto Valdés"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs font-medium text-slate-800 focus:outline-none focus:border-lazo-primary"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-1">
                  Se asociará a sus pruebas sin mezclar datos con otros evaluadores.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-lazo-primary text-white text-xs font-bold hover:bg-lazo-primary-hover transition-colors flex items-center justify-center gap-2 shadow-soft disabled:opacity-60 cursor-pointer"
                >
                  <span>{isLoading ? 'Verificando clave...' : 'Ingresar como Evaluador'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleInstitutionalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Correo Institucional o Usuario
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs font-medium text-slate-800 focus:outline-none focus:border-lazo-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs font-medium text-slate-800 focus:outline-none focus:border-lazo-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded border-slate-300 text-lazo-primary focus:ring-0"
                  />
                  <span>Recordar sesión</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-lazo-primary text-white text-xs font-bold hover:bg-lazo-primary-hover transition-colors flex items-center justify-center gap-2 shadow-soft disabled:opacity-60 cursor-pointer"
                >
                  <span>{isLoading ? 'Accediendo...' : 'Acceder al Portal Médico'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 text-center leading-relaxed">
            Ambiente de evaluación académica con datos clínicos sintéticos auditados.
          </div>
        </div>
      </div>
    </div>
  );
}
