import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { TerminalProvider, useTerminal } from './context/TerminalContext.js';
import { TerminalHeader } from './components/shell/TerminalHeader.js';
import { BootScreen } from './components/dashboard/BootScreen.js';
import { Dashboard } from './components/dashboard/Dashboard.js';
import { CurriculumTree } from './components/curriculum/CurriculumTree.js';
import { LessonView } from './components/curriculum/LessonView.js';
import { CodeLab } from './components/codelab/CodeLab.js';
import { ArenaView } from './components/arena/ArenaView.js';
import { SkillRadar } from './components/skills/SkillRadar.js';
import { ProjectsView } from './components/projects/ProjectsView.js';
import { RemedialsView } from './components/remedials/RemedialsView.js';
import { FinalExamView } from './components/exam/FinalExamView.js';
import { VideoStudio } from './components/video/VideoStudio.js';
import { AdminPortal } from './components/admin/AdminPortal.js';
import { MentorHUD } from './components/mentor/MentorHUD.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { PaywallModal } from './components/checkout/PaywallModal.js';

const MainShell: React.FC = () => {
  const { user } = useAuth();
  const { activeView } = useTerminal();
  const [hasBooted, setHasBooted] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const bootFlag = sessionStorage.getItem('devos_booted');
    if (bootFlag) {
      setHasBooted(true);
    }
  }, []);

  const handleBootComplete = () => {
    sessionStorage.setItem('devos_booted', 'true');
    setHasBooted(true);
  };

  if (!hasBooted) {
    return <BootScreen onComplete={handleBootComplete} />;
  }

  return (
    <div className="min-h-screen bg-dev-bg text-dev-text font-mono flex flex-col selection:bg-dev-green selection:text-black">
      {/* Terminal Header */}
      <TerminalHeader onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-20">
        {activeView === 'DASHBOARD' && <Dashboard />}
        {activeView === 'CURRICULUM' && <CurriculumTree />}
        {activeView === 'LESSON' && <LessonView />}
        {activeView === 'CODELAB' && <CodeLab />}
        {activeView === 'ARENA' && <ArenaView />}
        {activeView === 'SKILLS' && <SkillRadar />}
        {activeView === 'PROJECTS' && <ProjectsView />}
        {activeView === 'REMEDIALS' && <RemedialsView />}
        {activeView === 'EXAM' && <FinalExamView />}
        {activeView === 'VIDEO_STUDIO' && <VideoStudio />}
        {activeView === 'ADMIN' && <AdminPortal />}
      </main>

      {/* Floating AI Mentor HUD */}
      <MentorHUD />

      {/* Authentication Dialog (Login & Register) */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Subscription Paywall Dialog (R$ 9,90/mês) */}
      <PaywallModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <TerminalProvider>
        <MainShell />
      </TerminalProvider>
    </AuthProvider>
  );
}

export default App;
