import mongoose from 'mongoose';

const QuestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Boss'],
    required: true,
  },
  xpReward: {
    type: Number,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  isWeekly: {
    type: Boolean,
    default: false,
  },
  isBoss: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    enum: ['Coding', 'Fitness', 'Communication', 'Career', 'Finance', 'Mindfulness', 'General'],
    default: 'General',
  },
  subTasks: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  completedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

import { createMockModelClass } from './mockDb.js';

let QuestModel;
if (global.USE_MOCK_DB) {
  QuestModel = createMockModelClass('quests');
} else {
  QuestModel = mongoose.model('Quest', QuestSchema);
}

export default QuestModel;
