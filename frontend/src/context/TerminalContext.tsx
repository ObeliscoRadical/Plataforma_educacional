import React, { createContext, useContext, useState, useEffect } from 'react';

export type ActiveView = 
  | 'DASHBOARD' 
  | 'CURRICULUM' 
  | 'LESSON' 
  | 'CODELAB' 
  | 'ARENA'
  | 'SKILLS' 
  | 'PROJECTS' 
  | 'REMEDIALS' 
  | 'EXAM' 
  | 'VIDEO_STUDIO' 
  | 'ADMIN';

export interface TerminalLog {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'COMMAND';
  text: string;
  timestamp: string;
}

interface TerminalContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  currentLessonId: string | null;
  setCurrentLessonId: (id: string | null) => void;
  currentModuleId: string | null;
  setCurrentModuleId: (id: string | null) => void;
  breadcrumb: string;
  logs: TerminalLog[];
  addLog: (text: string, type?: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'COMMAND') => void;
  isOnline: boolean;
  mentorOpen: boolean;
  setMentorOpen: (open: boolean) => void;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('DASHBOARD');
  const [currentLessonId, setCurrentLessonId] = useState<string | null>('lesson_00_01');
  const [currentModuleId, setCurrentModuleId] = useState<string | null>('mod_mod_00');
  const [logs, setLogs] = useState<TerminalLog[]>([
    { id: '1', type: 'INFO', text: 'Kernel initialization sequence complete.', timestamp: '00:00:01' },
    { id: '2', type: 'SUCCESS', text: 'Mentor AI Daemon: Online on socket /dev/mentor', timestamp: '00:00:02' },
    { id: '3', type: 'INFO', text: 'Learning Engine: 24 nodes mounted at ~/curriculum', timestamp: '00:00:03' },
  ]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [mentorOpen, setMentorOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addLog('Network restored. Live synchronization active.', 'SUCCESS');
    };
    const handleOffline = () => {
      setIsOnline(false);
      addLog('Network offline. PWA Service Worker caching engaged.', 'WARN');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addLog = (text: string, type: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'COMMAND' = 'INFO') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs((prev) => [
      ...prev.slice(-49), // keep last 50
      { id: Math.random().toString(36).substring(2, 9), type, text, timestamp: timeStr },
    ]);
  };

  const getBreadcrumb = () => {
    switch (activeView) {
      case 'DASHBOARD': return '~/dashboard/boot';
      case 'CURRICULUM': return '~/curriculum';
      case 'LESSON': return `~/curriculum/${currentModuleId || 'module'}/${currentLessonId || 'lesson'}`;
      case 'CODELAB': return `~/codelab/sandbox`;
      case 'ARENA': return `~/arena/blitz-speed-coding`;
      case 'SKILLS': return '~/profile/skill-radar';
      case 'PROJECTS': return '~/projects/tier-matrix';
      case 'REMEDIALS': return '~/adaptive/remedials';
      case 'EXAM': return '~/challenge/mod_23';
      case 'VIDEO_STUDIO': return '~/studio/video-pipeline';
      case 'ADMIN': return '~/system/admin-os';
      default: return '~/';
    }
  };

  return (
    <TerminalContext.Provider value={{
      activeView,
      setActiveView,
      currentLessonId,
      setCurrentLessonId,
      currentModuleId,
      setCurrentModuleId,
      breadcrumb: getBreadcrumb(),
      logs,
      addLog,
      isOnline,
      mentorOpen,
      setMentorOpen
    }}>
      {children}
    </TerminalContext.Provider>
  );
};

export function useTerminal() {
  const context = useContext(TerminalContext);
  if (!context) throw new Error('useTerminal must be used within a TerminalProvider');
  return context;
}
