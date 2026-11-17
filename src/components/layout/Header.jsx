import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Calendar as CalendarIcon, X, ArrowRight, User } from 'lucide-react';

export const VIEW_TITLES = {
  dashboard: { title: "Inicio", subtitle: "Resumen clínico y preparación de consultas del día" },
  patients: { title: "Directorio de Pacientes", subtitle: "Seguimiento activo en primer nivel (Diabetes Mellitus Tipo 2)" },
  patient_detail: { title: "Expediente del Paciente", subtitle: "Vigilancia clínica inter-consultas y trazabilidad de llamadas" },
  calls: { title: "Operación de Llamadas", subtitle: "Métricas de telefonía automatizada e incidencias técnicas" },
  calendar: { title: "Calendario de Consultas", subtitle: "Agenda de citas médicas y revisiones programadas" },
  reports: { title: "Reportes Poblacionales", subtitle: "Resultados clínicos, adherencia poblacional y análisis de barreras" },
  settings: { title: "Configuración", subtitle: "Perfil médico, preferencias y parámetros del protocolo" }
};

export default function Header({ currentView, onGoToAlert, onSelectPatient, reviewer }) {
  const current = VIEW_TITLES[currentView] || VIEW_TITLES.dashboard;
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const notifications = [
    {
      id: 1,
      titulo: "Emergencia: Glucosa 340 mg/dL + Vómitos",
      paciente: "Roberto Méndez Silva",
      pacienteId: "LZ-0482",
      hora: "08:42 hrs",
      tipo: "emergencia",
      tab: "llamadas"
    },
    {
      id: 2,
      titulo: "Valoración Prioritaria: Molestia visual",
      paciente: "Elena Garza Villarreal",
      pacienteId: "LZ-0319",
      hora: "Ayer 16:20 hrs",
      tipo: "prioritaria",
      tab: "resumen"
    },
    {
      id: 3,
      titulo: "Seguimiento de Contacto: 2 timbres fallidos",
      paciente: "Carlos Salinas Morales",
      pacienteId: "LZ-0195",
      hora: "Hoy 11:10 hrs",
      tipo: "contacto",
      tab: "seguimiento"
    }
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100/90 sticky top-0 z-20 px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-lazo-text flex items-center gap-3">
          {current.title}
          <span className="text-xs px-2.5 py-1 rounded-full bg-lazo-sage text-lazo-primary font-medium tracking-normal">
            Lazo V2
          </span>
          {reviewer?.name && (
            <span className="hidden md:inline-flex text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {reviewer.name}
            </span>
          )}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-5">
        {/* Urgent Alert Banner / Quick Pill */}
        <button 
          onClick={onGoToAlert}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-lazo-emergency-light border border-lazo-emergency-border text-lazo-emergency text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer group"
          title="Ver paciente con alerta de emergencia activa"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <AlertTriangle className="w-3.5 h-3.5 text-lazo-emergency" />
          <span>1 Emergencia detectada hoy</span>
        </button>

        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500 border-l border-slate-200/60 pl-5">
          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>Mar 03 Nov 2026</span>
        </div>

        {/* Notifications Icon and Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl bg-lazo-canvas hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors relative"
            title="Centro de notificaciones clínicas"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-lazo-emergency"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-84 bg-white rounded-3xl border border-slate-100 shadow-2xl p-5 z-50 animate-scaleUp text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Notificaciones del Día (3)
                </span>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (onSelectPatient) {
                        onSelectPatient(n.pacienteId, n.tab);
                      }
                      setShowNotifications(false);
                    }}
                    className="p-3 rounded-2xl bg-lazo-canvas hover:bg-lazo-sage/40 border border-slate-100 transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className={n.tipo === 'emergencia' ? 'text-lazo-emergency' : 'text-slate-900'}>
                        {n.titulo}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">{n.hora}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] flex items-center justify-between">
                      <span>{n.paciente}</span>
                      <ArrowRight className="w-3 h-3 text-lazo-primary" />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
