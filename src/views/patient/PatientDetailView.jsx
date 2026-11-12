import React, { useState } from 'react';
import PatientHeader from './PatientHeader';
import TabResumen from './tabs/TabResumen';
import TabSeguimiento from './tabs/TabSeguimiento';
import TabMedicacion from './tabs/TabMedicacion';
import TabLaboratorios from './tabs/TabLaboratorios';
import TabAntecedentes from './tabs/TabAntecedentes';
import TabLlamadas from './tabs/TabLlamadas';
import TabNotas from './tabs/TabNotas';

export default function PatientDetailView({ 
  patient, 
  initialTab = 'resumen', 
  onBack,
  onOpenAgendarModal,
  onOpenNotaModal
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!patient) return null;

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* Patient Header */}
      <PatientHeader 
        patient={patient}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={onBack}
        onOpenAgendarModal={onOpenAgendarModal}
        onOpenNotaModal={onOpenNotaModal}
      />

      {/* Tabs Content */}
      <div>
        {activeTab === 'resumen' && <TabResumen patient={patient} onNavigateTab={setActiveTab} />}
        {activeTab === 'seguimiento' && <TabSeguimiento patient={patient} onNavigateTab={setActiveTab} />}
        {activeTab === 'medicacion' && <TabMedicacion patient={patient} />}
        {activeTab === 'laboratorios' && <TabLaboratorios patient={patient} />}
        {(activeTab === 'antecedentes' || activeTab === 'historia_clinica') && <TabAntecedentes patient={patient} />}
        {activeTab === 'llamadas' && <TabLlamadas patient={patient} />}
        {activeTab === 'notas' && <TabNotas patient={patient} onOpenNotaModal={onOpenNotaModal} />}
      </div>
    </div>
  );
}
