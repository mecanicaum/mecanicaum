import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ModuleA_Meetings } from './components/ModuleA_Meetings';
import { ModuleB_MeetingLive } from './components/ModuleB_MeetingLive';
import { ModuleC_Commitments } from './components/ModuleC_Commitments';
import { ModuleD_SelfEvaluation } from './components/ModuleD_SelfEvaluation';
import { ModuleE_Dashboard } from './components/ModuleE_Dashboard';
import { Module_Admin } from './components/Module_Admin';
import { ExternalGuestView } from './components/ExternalGuestView';

const AppContent: React.FC = () => {
  const { currentUser, setActiveMeetingId } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('modulo_a');

  const handleGoToLiveMeeting = (meetingId: string) => {
    setActiveMeetingId(meetingId);
    setCurrentTab('modulo_b');
  };

  // RBAC route guardian
  const renderCurrentModule = () => {
    // If the active role is Invitado Externo, they only have access to their assigned tasks
    if (currentUser.role === 'invitado_externo') {
      return <ExternalGuestView />;
    }

    switch (currentTab) {
      case 'modulo_a':
        return <ModuleA_Meetings onGoToLiveMeeting={handleGoToLiveMeeting} />;
      case 'modulo_b':
        return <ModuleB_MeetingLive />;
      case 'modulo_c':
        return <ModuleC_Commitments />;
      case 'modulo_d':
        return <ModuleD_SelfEvaluation />;
      case 'modulo_e':
        return <ModuleE_Dashboard />;
      case 'modulo_admin':
        return <Module_Admin />;
      default:
        return <ModuleA_Meetings onGoToLiveMeeting={handleGoToLiveMeeting} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <div className="flex flex-1 w-full max-w-[1700px] mx-auto">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto max-w-7xl">
          {renderCurrentModule()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
