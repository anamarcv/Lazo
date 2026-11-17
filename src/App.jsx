import React, { useState, useEffect } from 'react';
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
import PatientFormModal from './components/patients/PatientFormModal';
import ErrorBoundary from './components/common/ErrorBoundary';
import { MOCK_PATIENTS, TODAY_APPOINTMENTS } from './data/mockPatients';
import { fetchAllPatients } from './services/patientApiService';
import { fetchSessionApi, logoutReviewerApi } from './services/authApiService';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reviewer, setReviewer] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState('LZ-0482');
  const [patientInitialTab, setPatientInitialTab] = useState('resumen');
  
  // Modals state
  const [isAgendarModalOpen, setIsAgendarModalOpen] = useState(false);
  const [isNotaModalOpen, setIsNotaModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);

  const [patients, setPatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [backendError, setBackendError] = useState(null);
  const [appointments, setAppointments] = useState(TODAY_APPOINTMENTS);

  const loadPatientsFromBackend = async () => {
    setIsLoadingPatients(true);
    try {
      const data = await fetchAllPatients();
      if (Array.isArray(data)) {
        setPatients(data);
        setBackendError(null);
        if (data.length > 0 && !selectedPatientId) {
          setSelectedPatientId(data[0].id);
        }
      } else {
        throw new Error('La respuesta del servidor no tiene el formato esperado.');
      }
    } catch (err) {
      console.error('Error al cargar pacientes del servidor:', err);
      setBackendError(err.message || 'No se pudo conectar con el servidor backend.');
      // No sustituir silenciosamente con MOCK_PATIENTS
    } finally {
      setIsLoadingPatients(false);
    }
  };

  // Check persisted session on mount
  useEffect(() => {
    async function verifyInitialSession() {
      try {
        const session = await fetchSessionApi();
        if (session && session.authenticated && session.reviewer) {
          setIsAuthenticated(true);
          setReviewer(session.reviewer);
          await loadPatientsFromBackend();
        } else {
          setIsAuthenticated(false);
          setIsLoadingPatients(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
        setIsLoadingPatients(false);
      } finally {
        setIsCheckingSession(false);
      }
    }
    verifyInitialSession();
  }, []);

  const handleLogin = (reviewerData) => {
    setIsAuthenticated(true);
    setReviewer(reviewerData);
    loadPatientsFromBackend();
  };

  const handleLogout = async () => {
    await logoutReviewerApi();
    setIsAuthenticated(false);
    setReviewer(null);
    setPatients([]);
  };

  const selectedPatient = (() => {
    const fromState = patients.find(p => p.id === selectedPatientId) || patients[0];
    if (!fromState) {
      return MOCK_PATIENTS.find(p => p.id === selectedPatientId) || MOCK_PATIENTS[0];
    }
    const fromMock = MOCK_PATIENTS.find(p => p.id === selectedPatientId);
    return {
      ...(fromMock || {}),
      ...fromState,
      medicacion: (Array.isArray(fromState?.medicacion) && fromState.medicacion.length > 0)
        ? fromState.medicacion
        : (fromMock?.medicacion || [])
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

  const handlePatientSaved = (savedPatient) => {
    setPatients(prev => {
      const idx = prev.findIndex(p => p.id === savedPatient.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = savedPatient;
        return next;
      }
      return [savedPatient, ...prev];
    });
    setSelectedPatientId(savedPatient.id);
  };

  const handleOpenNewPatientModal = () => {
    setPatientToEdit(null);
    setIsPatientModalOpen(true);
  };

  const handleOpenEditPatientModal = (patient) => {
    setPatientToEdit(patient);
    setIsPatientModalOpen(true);
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-lazo-canvas text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-lazo-primary" />
          <p className="text-xs font-semibold tracking-wide uppercase text-slate-400">Verificando sesión clínica...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-lazo-canvas text-lazo-text font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedPatient={selectedPatient}
        onSelectPatient={handleSelectPatient}
        onLogout={handleLogout}
        reviewer={reviewer}
      />

      {/* Área Principal de Contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          currentView={currentView}
          onGoToAlert={handleGoToAlert}
          onSelectPatient={handleSelectPatient}
          reviewer={reviewer}
        />

        <main className="flex-1 p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            {backendError && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-fadeIn" role="alert">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-950">Advertencia de sincronización con el servidor local</p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Fallo de comunicación con <code className="font-mono bg-amber-100/70 px-1 py-0.5 rounded text-[11px]">/api/patients</code>: {backendError}. No se pudieron recuperar los expedientes persistidos en disco.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button 
                    onClick={loadPatientsFromBackend}
                    disabled={isLoadingPatients}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPatients ? 'animate-spin' : ''}`} />
                    <span>{isLoadingPatients ? 'Reintentando...' : 'Reintentar conexión'}</span>
                  </button>
                </div>
              </div>
            )}

            {currentView === 'dashboard' && (
              <DashboardView 
                onSelectPatient={handleSelectPatient}
                onNavigateToPatients={() => setCurrentView('patients')}
              />
            )}

            {currentView === 'patients' && (
              <PatientsDirectoryView 
                patients={patients}
                onSelectPatient={handleSelectPatient}
                onOpenNewPatientModal={handleOpenNewPatientModal}
                onOpenEditPatientModal={handleOpenEditPatientModal}
              />
            )}

            {currentView === 'patient_detail' && (
              <PatientDetailView 
                patient={selectedPatient}
                initialTab={patientInitialTab}
                onBack={handleBackToPatients}
                onOpenAgendarModal={() => setIsAgendarModalOpen(true)}
                onOpenNotaModal={() => setIsNotaModalOpen(true)}
                onOpenEditModal={() => handleOpenEditPatientModal(selectedPatient)}
                onPatientUpdated={handlePatientSaved}
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

      <PatientFormModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        patientToEdit={patientToEdit}
        existingPatients={patients}
        onPatientSaved={handlePatientSaved}
      />
    </div>
  );
}
