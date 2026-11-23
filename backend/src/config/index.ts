import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4050', 10),
  jwtSecret: process.env.JWT_SECRET || 'devos-plataforma-educacional-secret-2026',
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
  jwtExpiresIn: '7d',
  dbPath: process.env.DB_PATH || path.resolve(process.cwd(), 'developer_os.sqlite'),
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL || '',
  
  // LiteLLM Gateway (Central Virtual Key Provider)
  litellmBaseUrl: process.env.LITELLM_BASE_URL || 'https://berriailitellm-databasev1826rc3-production-2f93.up.railway.app',
  litellmApiKey: process.env.LITELLM_API_KEY || '',
  litellmModel: process.env.LITELLM_MODEL || 'Gemini Auto Key',

  // Direct Gemini API (Fallback)
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  
  // Neural Voice Synthesis (FishAudio)
  fishAudioApiKey: process.env.FISHAUDIO_API_KEY || process.env.FISH_AUDIO_API_KEY || '',
  fishAudioVoiceId: process.env.FISHAUDIO_VOICE_ID || process.env.FISH_AUDIO_VOICE_ID || 'ec426c7ea3554caba8a5b077a4c701aa',
  
  nodeEnv: process.env.NODE_ENV || 'development',

  // Feature flags (rollback: set to "false"). Secure flags default ON.
  flags: {
    secureAdmin: process.env.FF_SECURE_ADMIN !== 'false',
    // demo endpoints (guest-boot, mock-activate, fallback student user): ON only outside production unless forced
    demoEndpoints: process.env.FF_DEMO_ENDPOINTS
      ? process.env.FF_DEMO_ENDPOINTS === 'true'
      : (process.env.NODE_ENV || 'development') !== 'production',
  },
  
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

if (config.nodeEnv === 'production' && config.jwtSecret === 'devos-plataforma-educacional-secret-2026') {
  throw new Error('JWT_SECRET must be set in production');
}
