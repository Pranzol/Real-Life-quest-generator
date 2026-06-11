import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    default: 1,
  },
  xp: {
    type: Number,
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }],
  activeGoals: {
    skillLevel: {
      type: String,
      default: '',
    },
    dailyTime: {
      type: String,
      default: '',
    },
    careerGoal: {
      type: String,
      default: '',
    },
    personalGoals: [{
      type: String,
    }]
  },
  isOnboarded: {
    type: Boolean,
    default: false,
  },
  characterClass: {
    type: String,
    default: '',
  },
  gold: {
    type: Number,
    default: 100,
  },
  streakShields: {
    type: Number,
    default: 0,
  },
  xpBoostsActive: {
    type: Number,
    default: 0,
  },
  combatLogs: [{
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  stats: {
    str: { type: Number, default: 10 },
    int: { type: Number, default: 10 },
    wis: { type: Number, default: 10 },
    cha: { type: Number, default: 10 },
    agi: { type: Number, default: 10 },
    luk: { type: Number, default: 10 },
  },
  lastQuestCompletedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

import { createMockModelClass } from './mockDb.js';

let UserModel;
if (global.USE_MOCK_DB) {
  UserModel = createMockModelClass('users');
} else {
  UserModel = mongoose.model('User', UserSchema);
}

export default UserModel;
