import React, { useState } from 'react';
import { Stethoscope, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginView({ onLogin }) {
  const [email, setEmail] = useState('anamar.cordero@lazo-salud.mx');
  const [password, setPassword] = useState('••••••••••••');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Columna Izquierda (~45%): Panel Editorial y Visual */}
      <div className="lg:w-[45%] bg-lazo-primary p-10 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden">
        {/* Soft decorative background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-lazo-mint/10 rounded-full -ml-28 -mb-28 pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-soft">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                <path d="M9 12H4s.55-3.03 2-4.5c1.45-1.47 4.5-2 4.5-2"/>
              </svg>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight">LAZO</span>
              <p className="text-[11px] font-medium tracking-wide text-white/70 uppercase">Portal Clínico V1</p>
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
            Monitoreo continuo de adherencia, detección temprana de descompensaciones y vigilancia de barreras en adultos con Diabetes Mellitus Tipo 2 mediante telefonía automatizada con voz humana y clasificación estructurada por IA.
          </p>
        </div>

        {/* Footer regulatorio */}
        <div className="pt-6 border-t border-white/10 text-xs text-white/60 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            NOM-004 · NOM-024 · Protección de Datos
          </span>
          <span>Versión 1.0</span>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Inicio de Sesión */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-lazo-canvas">
        <div className="max-w-md w-full bg-white p-8 lg:p-10 rounded-3xl border border-slate-100 shadow-card space-y-7 animate-fadeIn">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Iniciar Sesión</h3>
            <p className="text-xs text-slate-400 mt-1">
              Acceso exclusivo para médicos tratantes acreditados
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <a href="#" onClick={(e) => e.preventDefault()} className="text-lazo-primary font-semibold hover:underline">
                ¿Olvidó su contraseña?
              </a>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-lazo-primary text-white text-xs font-bold hover:bg-lazo-primary-hover transition-colors flex items-center justify-center gap-2 shadow-soft"
              >
                <span>Acceder al Portal Médico</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 text-center leading-relaxed">
            Ambiente de demostración clínica con datos sintéticos auditados.
          </div>
        </div>
      </div>
    </div>
  );
}
