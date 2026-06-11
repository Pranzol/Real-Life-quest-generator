import User from '../models/User.js';
import Reward from '../models/Reward.js';

// Helper to format user payload
const formatUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    level: user.level,
    xp: user.xp,
    streak: user.streak,
    badges: user.badges,
    activeGoals: user.activeGoals,
    isOnboarded: user.isOnboarded,
    characterClass: user.characterClass || '',
    gold: user.gold !== undefined ? user.gold : 100,
    streakShields: user.streakShields || 0,
    xpBoostsActive: user.xpBoostsActive || 0,
    combatLogs: user.combatLogs || [],
    stats: user.stats || { str: 10, int: 10, wis: 10, cha: 10, agi: 10, luk: 10 }
  };
};

const addCombatLog = (user, message) => {
  if (!user.combatLogs) user.combatLogs = [];
  user.combatLogs.push({ message, timestamp: new Date() });
  if (user.combatLogs.length > 15) {
    user.combatLogs.shift();
  }
};

export const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: rewards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReward = async (req, res) => {
  try {
    const { title, cost } = req.body;
    if (!title || cost === undefined || cost < 0) {
      return res.status(400).json({ success: false, message: 'Please provide title and a positive cost' });
    }

    const reward = await Reward.create({
      userId: req.user._id,
      title,
      cost
    });

    res.status(201).json({ success: true, data: reward });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }
    res.status(200).json({ success: true, message: 'Reward deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const buyShopItem = async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (itemType === 'enhancer') {
      if (itemId === 'streak_shield') {
        const cost = 150;
        if (user.gold < cost) {
          return res.status(400).json({ success: false, message: 'Insufficient Gold (GP)' });
        }
        user.gold -= cost;
        user.streakShields = (user.streakShields || 0) + 1;
        addCombatLog(user, `🛡️ Purchased a Streak Shield for ${cost} GP.`);
      } else if (itemId === 'xp_boost') {
        const cost = 200;
        if (user.gold < cost) {
          return res.status(400).json({ success: false, message: 'Insufficient Gold (GP)' });
        }
        user.gold -= cost;
        user.xpBoostsActive = (user.xpBoostsActive || 0) + 1;
        addCombatLog(user, `🧪 Purchased an XP Boost Potion for ${cost} GP.`);
      } else {
        return res.status(400).json({ success: false, message: 'Unknown shop enhancer item' });
      }
    } else if (itemType === 'custom') {
      const reward = await Reward.findOne({ _id: itemId, userId: user._id });
      if (!reward) {
        return res.status(404).json({ success: false, message: 'Custom reward not found' });
      }

      if (user.gold < reward.cost) {
        return res.status(400).json({ success: false, message: 'Insufficient Gold (GP)' });
      }

      user.gold -= reward.cost;
      addCombatLog(user, `🎁 Redeemed custom reward: '${reward.title}' for ${reward.cost} GP.`);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }

    await user.save();
    res.status(200).json({
      success: true,
      user: formatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
