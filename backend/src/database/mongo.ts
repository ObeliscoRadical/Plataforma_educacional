import mongoose, { Schema, Document } from 'mongoose';
import { config } from '../config/index.js';

let isConnected = false;

export async function connectMongo(): Promise<boolean> {
  if (!config.mongoUri) {
    return false;
  }
  if (isConnected) {
    return true;
  }

  try {
    await mongoose.connect(config.mongoUri);
    isConnected = true;
    console.log('➜ MongoDB Atlas / Railway: CONNECTED & ONLINE');
    return true;
  } catch (err: any) {
    console.warn(`[WARN] MongoDB Connection bypassed (${err.message}). Using SQLite storage.`);
    return false;
  }
}

// User Schema (MongoDB)
export interface IUserDoc extends Document {
  id: string;
  email: string;
  name: string;
  handle: string;
  role: 'STUDENT' | 'ADMIN' | 'MENTOR';
  password_hash: string;
  avatar?: string;
  subscription_status: 'PENDING_PAYMENT' | 'ACTIVE' | 'TRIAL' | 'CANCELED';
  plan_id: string;
  stripe_customer_id?: string;
  stripe_session_id?: string;
  streak_days: number;
  total_time_spent_min: number;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUserDoc>({
  id: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  handle: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['STUDENT', 'ADMIN', 'MENTOR'], default: 'STUDENT' },
  password_hash: { type: String, required: true },
  avatar: { type: String },
  subscription_status: { type: String, default: 'PENDING_PAYMENT' },
  plan_id: { type: String, default: 'CADET_PRO_990' },
  stripe_customer_id: { type: String },
  stripe_session_id: { type: String },
  streak_days: { type: Number, default: 1 },
  total_time_spent_min: { type: Number, default: 45 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Progress Schema (MongoDB)
const StudentProgressSchema = new Schema({
  user_id: { type: String, required: true, index: true },
  module_id: { type: String, required: true },
  lesson_id: { type: String, required: true, index: true },
  status: { type: String, default: 'LOCKED' },
  video_watched: { type: Number, default: 0 },
  exercise_completed: { type: Number, default: 0 },
  quiz_passed: { type: Number, default: 0 },
  completed_at: { type: Date },
  updated_at: { type: Date, default: Date.now }
});

// Learning Events Schema (MongoDB)
const LearningEventSchema = new Schema({
  user_id: { type: String, required: true, index: true },
  event_type: { type: String, required: true },
  payload_json: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export const UserModel = mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);
export const ProgressModel = mongoose.models.StudentProgress || mongoose.model('StudentProgress', StudentProgressSchema);
export const EventModel = mongoose.models.LearningEvent || mongoose.model('LearningEvent', LearningEventSchema);
