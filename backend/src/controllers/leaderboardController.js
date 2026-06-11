import User from '../models/User.js';
import Leaderboard from '../models/Leaderboard.js';

export const getLeaderboard = async (req, res) => {
  try {
    // Sort by Level, then XP, then Streak descending
    const standings = await User.find({})
      .sort({ level: -1, xp: -1, streak: -1 })
      .limit(50)
      .select('name level xp streak');

    // Update leaderboard cache collections as required by Leaderboard Model specs
    for (let i = 0; i < standings.length; i++) {
      const u = standings[i];
      await Leaderboard.findOneAndUpdate(
        { userId: u._id },
        {
          name: u.name,
          level: u.level,
          xp: u.xp,
          streak: u.streak,
          rank: i + 1,
          updatedAt: new Date()
        },
        { upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      count: standings.length,
      data: standings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
