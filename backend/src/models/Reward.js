import mongoose from 'mongoose';

const RewardSchema = new mongoose.Schema({
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
  cost: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

import { createMockModelClass } from './mockDb.js';

let RewardModel;
if (global.USE_MOCK_DB) {
  RewardModel = createMockModelClass('rewards');
} else {
  RewardModel = mongoose.model('Reward', RewardSchema);
}

export default RewardModel;
