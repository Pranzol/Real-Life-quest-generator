import mongoose from 'mongoose';

const LeaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  xp: {
    type: Number,
    required: true,
  },
  streak: {
    type: Number,
    required: true,
  },
  rank: {
    type: Number,
    default: 9999,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

import { createMockModelClass } from './mockDb.js';

let LeaderboardModel;
if (global.USE_MOCK_DB) {
  LeaderboardModel = createMockModelClass('leaderboards');
} else {
  LeaderboardModel = mongoose.model('Leaderboard', LeaderboardSchema);
}

export default LeaderboardModel;
