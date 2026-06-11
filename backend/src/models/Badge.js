import mongoose from 'mongoose';

const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: 'Award', // Lucide icon name, e.g., 'Code', 'Dumbbell', 'Briefcase', 'Award'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

import { createMockModelClass } from './mockDb.js';

let BadgeModel;
if (global.USE_MOCK_DB) {
  BadgeModel = createMockModelClass('badges');
} else {
  BadgeModel = mongoose.model('Badge', BadgeSchema);
}

export default BadgeModel;
