import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4050', 10),
  jwtSecret: process.env.JWT_SECRET || 'devos-super-secret-jwt-key-2026-matrix-omega',
  jwtExpiresIn: '7d',
  dbPath: process.env.DB_PATH || path.resolve(process.cwd(), 'developer_os.sqlite'),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  fishAudioApiKey: process.env.FISH_AUDIO_API_KEY || 'sk-fish-AWsZ4SMNS0H0BjAtcVN5gTpWnqcHN6vDPbOkzQ_As6Y',
  fishAudioVoiceId: process.env.FISH_AUDIO_VOICE_ID || '4eb3d738d92d4508b47ffa81e2f5f11a',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Default Skill & Progress weights
  defaultWeights: {
    knowledge: 0.15,
    implementation: 0.30,
    problemSolving: 0.25,
    debugging: 0.20,
    autonomy: 0.10,
    masteryThreshold: 75.0,
  }
};
