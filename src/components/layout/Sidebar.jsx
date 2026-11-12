import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  Calendar, 
  BarChart3, 
  Settings, 
  Stethoscope, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { CURRENT_DOCTOR } from '../../data/mockPatients';

export default function Sidebar({ currentView, setCurrentView, selectedPatient, onSelectPatient, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'patients', label: 'Pacientes', icon: Users, badge: '4' },
    { id: 'calls', label: 'Operación de Llamadas', icon: PhoneCall },
    { id: 'calendar', label: 'Calendario', icon: Calendar, badge: '3 hoy' },
    { id: 'reports', label: 'Reportes Poblacionales', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-7 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lazo-primary flex items-center justify-center text-white shadow-soft">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                <path d="M9 12H4s.55-3.03 2-4.5c1.45-1.47 4.5-2 4.5-2"/>
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-lazo-primary">LAZO</span>
              <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">Seguimiento DM2</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'patients' && currentView === 'patient_detail');
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  if (item.id !== 'patients' && currentView === 'patient_detail') {
                    // keep selection
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-lazo-primary text-white shadow-card font-semibold'
                    : 'text-slate-600 hover:text-lazo-primary hover:bg-lazo-sage/60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-lazo-primary'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-lazo-sage text-lazo-primary'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Doctor Profile Footer with Logout */}
      <div className="p-4 m-4 bg-lazo-canvas rounded-2xl border border-slate-100/80">
        <div className="flex items-center justify-between">
          <div 
            onClick={() => setCurrentView('settings')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity flex-1 min-w-0"
            title="Ver perfil médico y configuración"
          >
            <div className="w-10 h-10 rounded-full bg-lazo-sage text-lazo-primary flex items-center justify-center font-bold text-sm border border-lazo-mint/60 shrink-0">
              AC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-lazo-text truncate">{CURRENT_DOCTOR.name}</p>
              <p className="text-[11px] text-slate-400 truncate">Céd. {CURRENT_DOCTOR.cedula}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Lazo V1 Activo
          </span>
          <span className="text-slate-400">Primer Nivel</span>
        </div>
      </div>
    </aside>
  );
}
