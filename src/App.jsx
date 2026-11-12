import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './views/DashboardView';
import PatientsDirectoryView from './views/PatientsDirectoryView';
import PatientDetailView from './views/patient/PatientDetailView';
import CallOperationsView from './views/CallOperationsView';
import CalendarView from './views/CalendarView';
import PopulationReportsView from './views/PopulationReportsView';
import SettingsView from './views/SettingsView';
import LoginView from './views/LoginView';
import NewAppointmentModal from './components/common/NewAppointmentModal';
import NewNoteModal from './components/common/NewNoteModal';
import ErrorBoundary from './components/common/ErrorBoundary';
import { MOCK_PATIENTS, TODAY_APPOINTMENTS } from './data/mockPatients';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState('LZ-0482');
  const [patientInitialTab, setPatientInitialTab] = useState('resumen');
  
  // Modals state
  const [isAgendarModalOpen, setIsAgendarModalOpen] = useState(false);
  const [isNotaModalOpen, setIsNotaModalOpen] = useState(false);
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [appointments, setAppointments] = useState(TODAY_APPOINTMENTS);

  const selectedPatient = (() => {
    const fromState = patients.find(p => p.id === selectedPatientId) || patients[0];
    const fromMock = MOCK_PATIENTS.find(p => p.id === selectedPatientId) || MOCK_PATIENTS[0];
    if (!fromState) return fromMock;
    return {
      ...fromMock,
      ...fromState,
      medicacion: fromMock?.medicacion || fromState?.medicacion
    };
  })();

  const handleSelectPatient = (patientId, tab = 'resumen') => {
    setSelectedPatientId(patientId);
    setPatientInitialTab(tab);
    setCurrentView('patient_detail');
  };

  const handleBackToPatients = () => {
    setCurrentView('patients');
  };

  const handleGoToAlert = () => {
    handleSelectPatient('LZ-0482', 'llamadas');
  };

  const handleSaveAppointment = (newApt) => {
    setAppointments(prev => [newApt, ...prev]);
  };

  const handleSaveNote = (newNote) => {
    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          notas: [newNote, ...(p.notas || [])]
        };
      }
      return p;
    }));
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-lazo-canvas text-lazo-text font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedPatient={selectedPatient}
        onSelectPatient={handleSelectPatient}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* Área Principal de Contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          currentView={currentView}
          onGoToAlert={handleGoToAlert}
          onSelectPatient={handleSelectPatient}
        />

        <main className="flex-1 p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            {currentView === 'dashboard' && (
              <DashboardView 
                onSelectPatient={handleSelectPatient}
                onNavigateToPatients={() => setCurrentView('patients')}
              />
            )}

            {currentView === 'patients' && (
              <PatientsDirectoryView 
                onSelectPatient={handleSelectPatient}
              />
            )}

            {currentView === 'patient_detail' && (
              <PatientDetailView 
                patient={selectedPatient}
                initialTab={patientInitialTab}
                onBack={handleBackToPatients}
                onOpenAgendarModal={() => setIsAgendarModalOpen(true)}
                onOpenNotaModal={() => setIsNotaModalOpen(true)}
              />
            )}

            {currentView === 'calls' && (
              <CallOperationsView onSelectPatient={handleSelectPatient} />
            )}

            {currentView === 'calendar' && (
              <CalendarView 
                onSelectPatient={handleSelectPatient}
                onOpenNewAppointmentModal={() => setIsAgendarModalOpen(true)}
              />
            )}

            {currentView === 'reports' && (
              <PopulationReportsView />
            )}

            {currentView === 'settings' && (
              <SettingsView />
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Modales Globales */}
      <NewAppointmentModal 
        isOpen={isAgendarModalOpen}
        onClose={() => setIsAgendarModalOpen(false)}
        initialPatientId={selectedPatientId}
        onSaveAppointment={handleSaveAppointment}
      />

      <NewNoteModal 
        isOpen={isNotaModalOpen}
        onClose={() => setIsNotaModalOpen(false)}
        patient={selectedPatient}
        onSaveNote={handleSaveNote}
      />
    </div>
  );
}
