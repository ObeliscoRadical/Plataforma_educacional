import { getDb } from '../../database/db.js';
import { v4 as uuidv4 } from 'uuid';
import { DevVideoPipelineAdapter } from './providers.js';

export type VideoJobStatus = 'DRAFT' | 'GENERATING' | 'GENERATED' | 'REVIEW_REQUIRED' | 'APPROVED' | 'PUBLISHED' | 'FAILED';

export class VideoEngineService {
  private db = getDb();
  private adapter = new DevVideoPipelineAdapter();

  async createGenerationJob(lessonId: string) {
    const lesson = this.db.prepare(`
      SELECT l.*, m.title as module_title, lc.objective 
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      LEFT JOIN lesson_contents lc ON lc.lesson_id = l.id
      WHERE l.id = ?
    `).get(lessonId) as any;

    if (!lesson) throw new Error('LESSON_NOT_FOUND');

    const jobId = uuidv4();
    this.db.prepare(`
      INSERT INTO video_generation_jobs (id, lesson_id, status, logs)
      VALUES (?, ?, 'GENERATING', ?)
    `).run(jobId, lessonId, `[INIT] Job created. Using provider: ${this.adapter.name}\n`);

    // Run Pipeline asynchronously
    this.executePipeline(jobId, lesson).catch(err => {
      console.error(`Video generation pipeline error for job ${jobId}:`, err);
      this.db.prepare(`
        UPDATE video_generation_jobs 
        SET status = 'FAILED', logs = logs || ?
        WHERE id = ?
      `).run(`\n[ERROR] Pipeline aborted: ${err.message}`, jobId);
    });

    return {
      jobId,
      lessonId,
      status: 'GENERATING',
      message: 'Video generation job started in background.'
    };
  }

  private async executePipeline(jobId: string, lesson: any) {
    const updateLog = (msg: string) => {
      this.db.prepare('UPDATE video_generation_jobs SET logs = logs || ? WHERE id = ?').run(`\n${msg}`, jobId);
    };

    // Step 1: Script Generation with Master Prompt
    updateLog('[STEP 1/5] Generating pedagogical script following EXPLICAR -> MOSTRAR -> FAZER JUNTO -> FAZER SOZINHO...');
    const script = await this.adapter.generateScript({
      moduleTitle: lesson.module_title,
      lessonTitle: lesson.title,
      objectives: lesson.objective || 'Domínio prático',
      methodology: 'EXPLICAR_MOSTRAR_FAZER_JUNTO_FAZER_SOZINHO_TESTAR'
    });

    this.db.prepare(`
      UPDATE video_generation_jobs 
      SET script_json = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(JSON.stringify(script), jobId);

    // Step 2: Narration Voice Synthesis
    updateLog('[STEP 2/5] Synthesizing narration audio tracks per scene...');
    const fullNarration = script.scenes.map(s => s.narration).join(' ');
    const audio = await this.adapter.generateAudio(fullNarration);

    this.db.prepare(`
      UPDATE video_generation_jobs 
      SET narration_data = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(JSON.stringify(audio), jobId);

    // Step 3: Screen Demonstration & Visual Assets Plan
    updateLog('[STEP 3/5] Building screen action timeline & terminal visual assets...');
    const visualAssets = script.scenes.map(s => ({
      scene: s.sceneNumber,
      action: s.screenAction,
      code: s.codeToDisplay
    }));

    this.db.prepare(`
      UPDATE video_generation_jobs 
      SET screen_plan_json = ?, visual_assets_json = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(JSON.stringify(script.scenes), JSON.stringify(visualAssets), jobId);

    // Step 4: Composition
    updateLog('[STEP 4/5] Composing final video and rendering high-contrast terminal theme...');
    const composed = await this.adapter.composeVideo({
      script,
      audioTracks: [audio],
      visualAssets
    });

    // Step 5: Transition to REVIEW_REQUIRED (Never auto-publish without administrative review)
    updateLog('[STEP 5/5] Composition complete. Video placed in REVIEW_REQUIRED queue.');

    this.db.prepare(`
      UPDATE video_generation_jobs 
      SET status = 'REVIEW_REQUIRED', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(jobId);

    // Update or insert video_lessons entry
    this.db.prepare(`
      INSERT INTO video_lessons (id, lesson_id, title, duration_seconds, video_url, thumbnail_url, transcript_json, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'REVIEW_REQUIRED')
      ON CONFLICT(lesson_id) DO UPDATE SET
        title = excluded.title,
        duration_seconds = excluded.duration_seconds,
        video_url = excluded.video_url,
        thumbnail_url = excluded.thumbnail_url,
        transcript_json = excluded.transcript_json,
        status = 'REVIEW_REQUIRED',
        updated_at = CURRENT_TIMESTAMP
    `).run(
      uuidv4(),
      lesson.id,
      script.title,
      composed.durationSeconds,
      composed.videoUrl,
      composed.thumbnailUrl,
      JSON.stringify(script.scenes)
    );
  }

  getJobs() {
    return this.db.prepare(`
      SELECT j.*, l.title as lesson_title, l.code as lesson_code
      FROM video_generation_jobs j
      JOIN lessons l ON j.lesson_id = l.id
      ORDER BY j.created_at DESC
    `).all();
  }

  getJobById(jobId: string) {
    const job = this.db.prepare(`
      SELECT j.*, l.title as lesson_title, l.code as lesson_code
      FROM video_generation_jobs j
      JOIN lessons l ON j.lesson_id = l.id
      WHERE j.id = ?
    `).get(jobId) as any;

    if (!job) return null;

    return {
      ...job,
      script: job.script_json ? JSON.parse(job.script_json) : null,
      narration: job.narration_data ? JSON.parse(job.narration_data) : null,
      screenPlan: job.screen_plan_json ? JSON.parse(job.screen_plan_json) : null,
      visualAssets: job.visual_assets_json ? JSON.parse(job.visual_assets_json) : null,
    };
  }

  approveAndPublishVideo(lessonId: string, adminUserId: string) {
    // Enforce Administrative Authorization
    const admin = this.db.prepare('SELECT role FROM users WHERE id = ?').get(adminUserId) as any;
    if (!admin || admin.role !== 'ADMIN') {
      throw new Error('UNAUTHORIZED_ADMIN_ACTION');
    }

    this.db.prepare(`
      UPDATE video_lessons 
      SET status = 'PUBLISHED', updated_at = CURRENT_TIMESTAMP 
      WHERE lesson_id = ?
    `).run(lessonId);

    this.db.prepare(`
      UPDATE video_generation_jobs 
      SET status = 'PUBLISHED', updated_at = CURRENT_TIMESTAMP 
      WHERE lesson_id = ?
    `).run(lessonId);

    return {
      lessonId,
      status: 'PUBLISHED',
      message: 'Video reviewed, approved and published successfully.'
    };
  }
}

export const videoEngineService = new VideoEngineService();
