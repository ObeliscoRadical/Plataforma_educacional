import { config } from '../../config/index.js';

/**
 * Modular Adapter Interfaces for Video Generation Pipeline
 */

export interface LLMProvider {
  name: string;
  generateScript(context: {
    moduleTitle: string;
    lessonTitle: string;
    objectives: string;
    methodology: string;
  }): Promise<{
    title: string;
    scenes: { sceneNumber: number; title: string; narration: string; screenAction: string; codeToDisplay?: string }[];
  }>;
}

export interface VoiceProvider {
  name: string;
  generateAudio(narrationText: string, voiceId?: string): Promise<{ audioBuffer?: Buffer; audioUrl: string; durationSeconds: number }>;
}

export interface VideoComposerProvider {
  name: string;
  composeVideo(params: {
    script: any;
    audioTracks: any[];
    visualAssets: any[];
  }): Promise<{ videoUrl: string; thumbnailUrl: string; durationSeconds: number }>;
}

export interface StorageProvider {
  name: string;
  uploadAsset(buffer: Buffer, filename: string, mimeType: string): Promise<string>;
}

// Fish Audio Neural Voice Provider
export class FishAudioVoiceProvider implements VoiceProvider {
  name = 'Fish Audio Neural Voice Engine (ID: 4eb3d738d92d4508b47ffa81e2f5f11a)';

  async generateAudio(narrationText: string, voiceId?: string): Promise<{ audioBuffer?: Buffer; audioUrl: string; durationSeconds: number }> {
    const targetVoiceId = voiceId || config.fishAudioVoiceId;
    const apiKey = config.fishAudioApiKey;

    try {
      const res = await fetch('https://api.fish.audio/v1/tts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: narrationText,
          reference_id: targetVoiceId,
          format: 'mp3',
          normalize: true,
          latency: 'normal'
        })
      });

      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const estimatedDuration = Math.max(5, Math.round(narrationText.split(' ').length / 2.5));
        return {
          audioBuffer: buffer,
          audioUrl: `data:audio/mp3;base64,${buffer.toString('base64')}`,
          durationSeconds: estimatedDuration
        };
      } else {
        const errorData: any = await res.json().catch(() => ({}));
        console.warn('Fish Audio API status:', res.status, errorData);
        throw new Error(errorData.message || `Fish Audio Error ${res.status}`);
      }
    } catch (err: any) {
      console.warn('Fish Audio generation failed, returning estimated metadata:', err.message);
      const estimatedDuration = Math.max(5, Math.round(narrationText.split(' ').length / 2.5));
      return {
        audioUrl: '',
        durationSeconds: estimatedDuration
      };
    }
  }
}

// Development Simulation Adapter (Explicitly identified as DEV environment adapter)
export class DevVideoPipelineAdapter implements LLMProvider, VoiceProvider, VideoComposerProvider, StorageProvider {
  name = 'DEVELOPMENT_LOCAL_ADAPTER (Developer OS Sandbox Engine)';
  private fishAudio = new FishAudioVoiceProvider();

  async generateScript(context: { moduleTitle: string; lessonTitle: string; objectives: string; methodology: string }) {
    return {
      title: `Videoaula: ${context.lessonTitle}`,
      scenes: [
        {
          sceneNumber: 1,
          title: 'Fase 1: EXPLICAR (Conceito e Problema)',
          narration: `Olá, desenvolvedor. Nesta aula sobre ${context.lessonTitle}, vamos dominar os fundamentos de ${context.objectives}. Compreender o problema é 80% da solução.`,
          screenAction: 'Terminal boot animation -> Slide conceitual com diagrama de arquitetura.',
          codeToDisplay: '// Conceito Fundamental\n// Objetivo: ' + context.objectives
        },
        {
          sceneNumber: 2,
          title: 'Fase 2: MOSTRAR (Demonstração Prática do Mentor)',
          narration: `Observe agora no editor como estruturamos a solução passo a passo, aplicando boas práticas e tipagem estrita.`,
          screenAction: 'Split screen: VS Code / Monaco Editor digitando a implementação de referência.',
          codeToDisplay: 'function demonstrateMastery() {\n  const status = "ONLINE";\n  return { status, timestamp: Date.now() };\n}'
        },
        {
          sceneNumber: 3,
          title: 'Fase 3: FAZER JUNTO (Guided Practice)',
          narration: 'Abra o terminal lateral. Vamos executar o comando de teste juntos e inspecionar a saída do processo.',
          screenAction: 'Terminal executando comando de teste e exibindo output com semáforo verde.',
          codeToDisplay: 'npm test -- --filter=' + context.lessonTitle.toLowerCase().replace(/\\s+/g, '-')
        },
        {
          sceneNumber: 4,
          title: 'Fase 4: FAZER SOZINHO & TESTAR (Hands-on Mission)',
          narration: 'Agora a responsabilidade é sua. Acesse o Code Lab, implemente os requisitos e passe por todos os casos de teste.',
          screenAction: 'Transição para o Code Lab com o prompt [ CONTINUE MISSION ].',
          codeToDisplay: '// Sua vez: abra o Code Lab e submeta sua solução!'
        }
      ]
    };
  }

  async generateAudio(narrationText: string, voiceId?: string) {
    try {
      return await this.fishAudio.generateAudio(narrationText, voiceId);
    } catch {
      const estimatedWords = narrationText.split(' ').length;
      const durationSeconds = Math.max(10, Math.round(estimatedWords / 2.5));
      return {
        audioUrl: `https://stream.devos.academy/audio/synth_${Date.now()}.mp3`,
        durationSeconds
      };
    }
  }

  async composeVideo(params: { script: any; audioTracks: any[]; visualAssets: any[] }) {
    const totalDuration = params.script.scenes.length * 45; // ~3 mins
    return {
      videoUrl: `https://stream.devos.academy/rendered/video_${Date.now()}.mp4`,
      thumbnailUrl: `https://stream.devos.academy/rendered/thumb_${Date.now()}.jpg`,
      durationSeconds: totalDuration
    };
  }

  async uploadAsset(_buffer: Buffer, filename: string) {
    return `https://storage.devos.academy/assets/${filename}`;
  }
}
