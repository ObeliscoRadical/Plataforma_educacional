const API_BASE = '/api';

export class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('devos_token');
  }

  setToken(token: string) {
    localStorage.setItem('devos_token', token);
  }

  clearToken() {
    localStorage.removeItem('devos_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || data.error || `HTTP Error ${res.status}`);
    }

    return data as T;
  }

  // System
  getSystemStatus() {
    return this.request<{ status: string; kernel: string; subsystems: any }>('/system/status');
  }

  // Voice TTS
  synthesizeSpeech(text: string, voiceId?: string) {
    return this.request<{ success: boolean; audioUrl?: string; durationSeconds?: number; fallback?: boolean; provider?: string; message?: string }>('/tts/synthesize', {
      method: 'POST',
      body: JSON.stringify({ text, voiceId }),
    });
  }

  // Auth
  register(data: { email: string; password: string; name: string; handle: string }) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  login(emailOrHandle: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrHandle, password }),
    });
  }

  getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Curriculum
  getCourses() {
    return this.request<{ courses: any[] }>('/curriculum/courses');
  }

  getModules() {
    return this.request<{ modules: any[] }>('/curriculum/modules');
  }

  getModuleDetails(id: string) {
    return this.request<{ module: any }>(`/curriculum/modules/${id}`);
  }

  getLessonDetails(id: string) {
    return this.request<{ lesson: any }>(`/curriculum/lessons/${id}`);
  }

  // Progress
  startLesson(id: string) {
    return this.request<any>(`/progress/lesson/${id}/start`, { method: 'POST' });
  }

  markVideoWatched(id: string) {
    return this.request<any>(`/progress/lesson/${id}/video-watched`, { method: 'POST' });
  }

  submitExercise(lessonId: string, data: { exerciseId: string; code: string; testCases: any[]; hintsUsed: number; maxHintLevel: number }) {
    return this.request<any>(`/progress/lesson/${lessonId}/exercise`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  submitQuiz(lessonId: string, quizId: string, answers: Record<string, string>) {
    return this.request<any>(`/progress/lesson/${lessonId}/quiz`, {
      method: 'POST',
      body: JSON.stringify({ quizId, answers }),
    });
  }

  // Skills
  getSkills() {
    return this.request<{ skills: any[]; weights: any }>('/skills');
  }

  // Sandbox
  runSandbox(code: string, testCases: any[]) {
    return this.request<any>('/sandbox/run', {
      method: 'POST',
      body: JSON.stringify({ code, testCases }),
    });
  }

  // AI Mentor
  getMentorHistory(lessonId?: string) {
    const url = lessonId ? `/mentor/history?lessonId=${lessonId}` : '/mentor/history';
    return this.request<{ sessionId: string; messages: any[] }>(url);
  }

  chatMentor(data: { message: string; lessonId?: string; codeSnippet?: string; hintLevel?: number }) {
    return this.request<any>('/mentor/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Remedials
  getRemedials() {
    return this.request<{ remedials: any[] }>('/remedials');
  }

  completeRemedial(id: string) {
    return this.request<any>(`/remedials/${id}/complete`, { method: 'POST' });
  }

  // Projects
  getProjects() {
    return this.request<{ projects: any[] }>('/projects');
  }

  submitProject(projectId: string, data: { repositoryUrl: string; deployUrl: string; notes?: string }) {
    return this.request<any>(`/projects/${projectId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Video Engine
  getVideoJobs() {
    return this.request<{ jobs: any[] }>('/video-engine/jobs');
  }

  getVideoJob(id: string) {
    return this.request<{ job: any }>(`/video-engine/jobs/${id}`);
  }

  generateVideo(lessonId: string) {
    return this.request<any>(`/video-engine/generate`, {
      method: 'POST',
      body: JSON.stringify({ lessonId }),
    });
  }

  approveVideo(lessonId: string) {
    return this.request<any>(`/video-engine/approve`, {
      method: 'POST',
      body: JSON.stringify({ lessonId }),
    });
  }

  // Final Exam
  getExamStatus() {
    return this.request<{ exam: any }>('/exam/status');
  }

  submitExamStage1(answers: any[]) {
    return this.request<any>(`/exam/stage1`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  submitExamStage2(fixCode: string, testResults: any[]) {
    return this.request<any>(`/exam/stage2`, {
      method: 'POST',
      body: JSON.stringify({ fixCode, testResults }),
    });
  }

  submitExamStage3(featureCode: string, testResults: any[]) {
    return this.request<any>(`/exam/stage3`, {
      method: 'POST',
      body: JSON.stringify({ featureCode, testResults }),
    });
  }

  submitExamStage4(defenseAnswers: any[]) {
    return this.request<any>(`/exam/stage4`, {
      method: 'POST',
      body: JSON.stringify({ defenseAnswers }),
    });
  }

  // Analytics & Admin
  getAnalytics() {
    return this.request<{ metrics: any }>('/analytics/metrics');
  }

  getAdminSettings() {
    return this.request<{ settings: any[] }>('/admin/settings');
  }

  updateAdminSetting(key: string, value: string) {
    return this.request<any>(`/admin/settings`, {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    });
  }

  getAdminStudents() {
    return this.request<{ students: any[] }>('/admin/students');
  }
}

export const api = new ApiClient();
