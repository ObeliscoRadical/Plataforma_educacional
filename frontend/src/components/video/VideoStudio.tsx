import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { useTerminal } from '../../context/TerminalContext.js';
import { Video, Play, CheckCircle2, Clock, ShieldCheck, Film } from 'lucide-react';

export const VideoStudio: React.FC = () => {
  const { addLog } = useTerminal();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [lessonIdInput, setLessonIdInput] = useState('lesson_00_01');
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const res = await api.getVideoJobs();
      setJobs(res.jobs || []);
      if (res.jobs && res.jobs.length > 0) {
        const first = await api.getVideoJob(res.jobs[0].id);
        setSelectedJob(first.job);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    setGenerating(true);
    try {
      const res = await api.generateVideo(lessonIdInput);
      addLog(`Video generation job ${res.jobId} created in background!`, 'INFO');
      setTimeout(loadJobs, 1200);
    } catch (err: any) {
      addLog(`Generation error: ${err.message}`, 'ERROR');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (lessonId: string) => {
    setApproving(true);
    try {
      await api.approveVideo(lessonId);
      addLog(`Video for lesson ${lessonId} APPROVED and PUBLISHED!`, 'SUCCESS');
      await loadJobs();
    } catch (err: any) {
      addLog(`Approval error: ${err.message}`, 'ERROR');
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dev-surface border border-dev-border rounded-lg p-5">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
          <Film className="w-4 h-4" />
          <span>VIDEO GENERATION ENGINE // MODULAR ADAPTER PIPELINE</span>
        </div>
        <h1 className="text-lg font-bold font-mono text-white">
          Estúdio de Geração & Validação de Videoaulas
        </h1>
        <p className="text-xs font-mono text-dev-muted mt-1">
          Pipeline: Script → Narration → Screen Demo Plan → Visual Assets → Composition → Review Required → Administrative Approval.
        </p>
      </div>

      {/* Generator Form */}
      <div className="bg-dev-surface border border-dev-border rounded-lg p-4 flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={lessonIdInput}
          onChange={(e) => setLessonIdInput(e.target.value)}
          placeholder="ID da aula (ex: lesson_00_01, lesson_05_01)"
          className="flex-1 px-3 py-2 bg-dev-bg border border-dev-border rounded font-mono text-xs text-white outline-none focus:border-purple-400"
        />
        <button
          onClick={handleCreateJob}
          disabled={generating}
          className="px-4 py-2 bg-purple-500 text-black font-mono font-bold text-xs rounded hover:bg-purple-400 transition-colors shrink-0"
        >
          {generating ? 'DISPATCHING PIPELINE...' : '[ GENERATE VIDEO JOB ]'}
        </button>
      </div>

      {/* 2-Column: Jobs List & Job Details / Approval */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-2">
          {jobs.map((j) => (
            <div
              key={j.id}
              onClick={async () => {
                const res = await api.getVideoJob(j.id);
                setSelectedJob(res.job);
              }}
              className={`p-3 rounded-lg border cursor-pointer font-mono text-xs transition-all ${
                selectedJob?.id === j.id ? 'border-purple-400 bg-purple-500/10' : 'border-dev-border bg-dev-surface'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-dev-cyan font-bold">{j.lesson_code}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-zinc-800 text-zinc-300">
                  {j.status}
                </span>
              </div>
              <div className="text-white font-medium">{j.lesson_title}</div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-7 bg-dev-surface border border-dev-border rounded-lg p-5 space-y-4">
          {selectedJob ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-dev-border font-mono text-xs">
                <span className="text-purple-400 font-bold">JOB: {selectedJob.id}</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                  {selectedJob.status}
                </span>
              </div>

              {/* Execution Logs */}
              <div className="p-3 bg-dev-bg border border-dev-border rounded font-mono text-[11px] text-zinc-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {selectedJob.logs}
              </div>

              {/* Script Scenes Preview */}
              {selectedJob.script?.scenes && (
                <div className="space-y-2 font-mono text-xs">
                  <div className="text-dev-green font-bold">// ROTEIRO GERADO PELO MOTOR</div>
                  {selectedJob.script.scenes.map((s: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded bg-dev-bg border border-dev-border text-[11px]">
                      <div className="text-dev-cyan font-bold">Cena {s.sceneNumber}: {s.title}</div>
                      <div className="text-zinc-300 mt-1">{s.narration}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Admin Approval Button */}
              {selectedJob.status === 'REVIEW_REQUIRED' && (
                <button
                  onClick={() => handleApprove(selectedJob.lesson_id)}
                  disabled={approving}
                  className="w-full py-2.5 bg-dev-green text-black font-mono font-bold text-xs rounded hover:bg-dev-greenDim transition-colors shadow-glow-green flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>[ APROVAR E PUBLICAR VÍDEO NO CURRÍCULO ]</span>
                </button>
              )}
            </>
          ) : (
            <div className="text-center text-xs font-mono text-dev-muted">
              Selecione um job de vídeo para inspecionar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
