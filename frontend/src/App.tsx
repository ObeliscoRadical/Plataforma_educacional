import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { TerminalProvider, useTerminal } from './context/TerminalContext.js';
import { TerminalHeader } from './components/shell/TerminalHeader.js';
import { LoginScreen } from './components/auth/LoginScreen.js';
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
import { PaywallModal } from './components/checkout/PaywallModal.js';

const MainShell: React.FC = () => {
  const { user, loading } = useAuth();
  const { activeView } = useTerminal();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center p-12 text-dev-green font-mono text-xs">
        <span className="inline-block w-2 h-4 bg-dev-green mr-2 animate-blink-slow"></span>
        Inicializando subsistemas do Developer OS...
      </div>
    );
  }

  // If no user is logged in, show the Login/Registration Screen as the FIRST SCREEN
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-dev-bg text-dev-text font-mono flex flex-col selection:bg-dev-green selection:text-black">
      {/* Terminal Header */}
      <TerminalHeader onOpenAuth={() => {}} />

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
