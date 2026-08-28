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
  fishAudioApiKey: process.env.FISH_AUDIO_API_KEY || '',
  fishAudioVoiceId: process.env.FISH_AUDIO_VOICE_ID || 'b59c8403f2354d46ba0003589b947316',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Stripe & Subscription
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripePriceId: process.env.STRIPE_PRICE_ID || 'price_developer_os_990_monthly',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5173',

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
