import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { useTerminal } from '../../context/TerminalContext.js';
import { ProjectItem } from '../../types/index.js';
import { FolderGit2, CheckCircle2, Bot, ExternalLink, Send, ShieldCheck, Flame } from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const { addLog } = useTerminal();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [deployUrl, setDeployUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await api.getProjects();
      setProjects(res.projects || []);
      if (res.projects && res.projects.length > 0) {
        setSelectedProject(res.projects[0]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setSubmitting(true);
    setSubmissionSuccess(null);

    try {
      const res = await api.submitProject(selectedProject.id, {
        repositoryUrl: repoUrl,
        deployUrl: deployUrl,
        notes
      });
      setSubmissionSuccess(res);
      addLog(`Project ${selectedProject.title} submitted and evaluated! Grade: ${res.grade}%`, 'SUCCESS');
      await loadProjects();
    } catch (err: any) {
      addLog(`Submission error: ${err.message}`, 'ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-dev-green font-mono text-sm">
        <span className="inline-block w-2 h-4 bg-dev-green mr-2 animate-blink-slow"></span>
        Carregando matriz de projetos progressivos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dev-surface border border-dev-border rounded-lg p-5">
        <div className="flex items-center gap-2 text-xs font-mono text-dev-green mb-1">
          <FolderGit2 className="w-4 h-4" />
          <span>PROJECT HUB // PRODUCTION DELIVERABLES MATRIX</span>
        </div>
        <h1 className="text-lg font-bold font-mono text-white">
          Projetos de Engenharia Progressivos
        </h1>
        <p className="text-xs font-mono text-dev-muted mt-1">
          Demonstração de competência em nível de portfólio real com deploy contínuo e code review automatizado pelo Mentor IA.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Projects List (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          {projects.map((proj) => {
            const isSelected = selectedProject?.id === proj.id;
            const isApproved = proj.submission?.status === 'APPROVED';

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                className={`p-3 rounded-lg border cursor-pointer font-mono text-xs transition-all ${
                  isSelected
                    ? 'border-dev-green bg-dev-green/10'
                    : isApproved
                    ? 'border-emerald-500/40 bg-dev-surface/80'
                    : 'border-dev-border bg-dev-surface hover:bg-dev-surfaceHover'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-dev-cyan font-bold">[{proj.module_code}]</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {proj.submission ? proj.submission.status : 'PENDING'}
                  </span>
                </div>
                <div className="text-white font-semibold">{proj.title}</div>
                <div className="text-[11px] text-dev-muted mt-1">
                  Tier {proj.tier} • Competências: {proj.required_skills?.join(', ') || 'Core'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Project Detail & Submission (7 cols) */}
        <div className="lg:col-span-7 bg-dev-surface border border-dev-border rounded-lg p-5 space-y-5">
          {selectedProject && (
            <>
              <div className="pb-4 border-b border-dev-border">
                <div className="flex items-center gap-2 text-xs font-mono text-dev-cyan mb-1">
                  <Flame className="w-3.5 h-3.5 text-dev-amber" />
                  <span>TIER {selectedProject.tier} DELIVERABLE</span>
                </div>
                <h2 className="text-sm font-bold font-mono text-white mb-2">
                  {selectedProject.title}
                </h2>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedProject.template_repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-dev-cyan hover:underline"
                  >
                    <span>[ Template Repo ]</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Rubric Criteria */}
              <div>
                <div className="text-xs font-mono text-dev-green font-bold mb-2">
                  // CRITÉRIOS DA RUBRICA DE AVALIAÇÃO DO MENTOR
                </div>
                <div className="space-y-1.5 font-mono text-xs">
                  {selectedProject.rubric?.map((r, i) => (
                    <div key={i} className="p-2.5 rounded bg-dev-bg border border-dev-border flex items-start justify-between gap-2">
                      <div>
                        <div className="text-white font-semibold">{r.criterion}</div>
                        <div className="text-[11px] text-dev-muted">{r.description}</div>
                      </div>
                      <span className="text-dev-cyan font-bold text-[11px] shrink-0">{r.weight}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mentor Review if already submitted */}
              {selectedProject.submission?.mentorReview && (
                <div className="p-4 rounded-lg bg-dev-bg border border-dev-cyan/40 space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2 text-dev-cyan font-bold">
                    <Bot className="w-4 h-4" />
                    <span>AVALIAÇÃO DO MENTOR IA (Nota: {selectedProject.submission.grade}%)</span>
                  </div>
                  <p className="text-zinc-300 text-[11px]">
                    {selectedProject.submission.mentorReview.generalFeedback}
                  </p>
                </div>
              )}

              {/* Submission Form */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-dev-border font-mono text-xs">
                <div className="text-dev-green font-bold">// SUBMETER ENTREGÁVEL</div>
                <div>
                  <label className="block text-dev-muted text-[11px] mb-1">Repositório GitHub (com Conventional Commits)</label>
                  <input
                    type="url"
                    required
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/usuario/meu-projeto"
                    className="w-full px-3 py-2 bg-dev-bg border border-dev-border rounded text-xs text-white outline-none focus:border-dev-green"
                  />
                </div>

                <div>
                  <label className="block text-dev-muted text-[11px] mb-1">Deploy Ativo / Produção (Vercel / Railway / Cloud)</label>
                  <input
                    type="url"
                    required
                    value={deployUrl}
                    onChange={(e) => setDeployUrl(e.target.value)}
                    placeholder="https://meu-projeto.vercel.app"
                    className="w-full px-3 py-2 bg-dev-bg border border-dev-border rounded text-xs text-white outline-none focus:border-dev-green"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-dev-green text-black font-mono font-bold text-xs rounded hover:bg-dev-greenDim transition-colors shadow-glow-green flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'EVALUATING ARCHITECTURE...' : '[ ENVIAR PARA CODE REVIEW DO MENTOR ]'}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
