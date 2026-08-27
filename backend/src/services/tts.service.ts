import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';

const execPromise = util.promisify(exec);

export class FreeNeuralTtsService {
  /**
   * Generates MP3 neural speech 100% FREE without any API cost or credit requirement.
   * Uses high-quality Portuguese deep male voice (pt-BR-AntonioNeural with deep pitch).
   */
  async generateSpeech(text: string, voice = 'pt-BR-AntonioNeural', pitch = '-8Hz'): Promise<{ audioUrl: string; durationSeconds: number; provider: string }> {
    // 1. Try Fish Audio if credentials are valid and have credits
    if (config.fishAudioApiKey && config.fishAudioVoiceId) {
      try {
        const res = await fetch('https://api.fish.audio/v1/tts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.fishAudioApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            reference_id: config.fishAudioVoiceId,
            format: 'mp3',
            normalize: true
          })
        });

        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const duration = Math.max(3, Math.round(text.split(' ').length / 2.5));
          return {
            audioUrl: `data:audio/mp3;base64,${buffer.toString('base64')}`,
            durationSeconds: duration,
            provider: 'Fish Audio Neural'
          };
        }
      } catch {
        // Fallback to Free Neural TTS
      }
    }

    // 2. Free High-Fidelity Edge Neural Voice Engine (pt-BR Deep Male Voice)
    const tempFile = path.join(os.tmpdir(), `tts_${uuidv4()}.mp3`);
    try {
      const sanitizedText = text.replace(/"/g, '\\"');
      const cmd = `edge-tts --voice "${voice}" --pitch="${pitch}" --text "${sanitizedText}" --write-media "${tempFile}"`;
      await execPromise(cmd);

      if (fs.existsSync(tempFile)) {
        const audioBuffer = fs.readFileSync(tempFile);
        fs.unlinkSync(tempFile);
        const duration = Math.max(3, Math.round(text.split(' ').length / 2.5));
        return {
          audioUrl: `data:audio/mp3;base64,${audioBuffer.toString('base64')}`,
          durationSeconds: duration,
          provider: 'Free Neural Voice Engine (pt-BR Voz Grossa)'
        };
      }
    } catch (err: any) {
      console.warn('Free Edge TTS fallback warning:', err.message);
    }

    // 3. Simulated metadata if edge-tts command fails
    const estimatedDuration = Math.max(3, Math.round(text.split(' ').length / 2.5));
    return {
      audioUrl: '',
      durationSeconds: estimatedDuration,
      provider: 'Browser Speech Synthesis'
    };
  }
}

export const freeNeuralTts = new FreeNeuralTtsService();
