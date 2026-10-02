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
import { LoginView } from './components/LoginView';
import { PublicActVerificationView } from './components/PublicActVerificationView';

import { AccessibilityBar } from './components/AccessibilityBar';

const AppContent: React.FC = () => {
  const { currentUser, setActiveMeetingId, isAuthenticated } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('modulo_a');
  const [verifyCode, setVerifyCode] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('verify') || params.get('acta') || params.get('hash');
      if (code) return code;
      if (window.location.hash.startsWith('#verify=')) {
        return decodeURIComponent(window.location.hash.substring(8));
      }
    }
    return null;
  });

  // If viewing the public verifier (e.g. from QR code scan or URL link)
  if (verifyCode !== null || currentTab === 'verificador') {
    return (
      <PublicActVerificationView
        initialCode={verifyCode || ''}
        onBackToApp={() => {
          setVerifyCode(null);
          // Remove query params cleanly from browser bar without reload
          if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }}
      />
    );
  }

  // If user is not authenticated, render the dedicated institutional login portal
  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={() => setCurrentTab('modulo_a')}
        onOpenVerifier={(code) => setVerifyCode(code || '')}
      />
    );
  }

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
    <div className="min-h-screen bg-[#F8FAF9] text-[#1E293B] antialiased flex flex-col font-sans">
      <AccessibilityBar />
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <div className="flex flex-1 w-full max-w-[1700px] mx-auto px-2 sm:px-3 lg:px-4 py-3">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <main className="flex-1 p-3 sm:p-5 lg:p-6 min-w-0 overflow-y-auto max-w-7xl bg-transparent">
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
