import Quest from '../models/Quest.js';
import User from '../models/User.js';
import Badge from '../models/Badge.js';
import Leaderboard from '../models/Leaderboard.js';
import { fetchAIQuests, fetchAIRecommendations } from '../services/aiService.js';

// Helper to determine XP based on difficulty
const getXpByDifficulty = (difficulty, isBoss) => {
  if (isBoss || difficulty === 'Boss') return 100;
  switch (difficulty) {
    case 'Easy': return 10;
    case 'Medium': return 25;
    case 'Hard': return 50;
    default: return 10;
  }
};

// Helper to determine Gold GP based on difficulty
const getGoldByDifficulty = (difficulty, isBoss) => {
  if (isBoss || difficulty === 'Boss') return 150;
  switch (difficulty) {
    case 'Easy': return 10;
    case 'Medium': return 25;
    case 'Hard': return 50;
    default: return 10;
  }
};

// Helper to infer Category from title and description
const inferCategory = (title, description) => {
  const text = (title + ' ' + (description || '')).toLowerCase();
  if (text.includes('code') || text.includes('program') || text.includes('bug') || text.includes('leetcode') || text.includes('dev') || text.includes('git')) return 'Coding';
  if (text.includes('workout') || text.includes('gym') || text.includes('run') || text.includes('fit') || text.includes('cardio') || text.includes('exercise') || text.includes('stretch')) return 'Fitness';
  if (text.includes('speak') || text.includes('lead') || text.includes('presentation') || text.includes('talk') || text.includes('speech')) return 'Communication';
  if (text.includes('job') || text.includes('intern') || text.includes('apply') || text.includes('resume') || text.includes('portfolio') || text.includes('career') || text.includes('interview')) return 'Career';
  if (text.includes('money') || text.includes('invest') || text.includes('finance') || text.includes('stocks') || text.includes('save') || text.includes('budget')) return 'Finance';
  if (text.includes('meditat') || text.includes('mindful') || text.includes('habit') || text.includes('sleep') || text.includes('journal')) return 'Mindfulness';
  return 'General';
};

// Helper to log combat log messages to user
const addCombatLog = (user, message) => {
  if (!user.combatLogs) user.combatLogs = [];
  user.combatLogs.push({ message, timestamp: new Date() });
  if (user.combatLogs.length > 15) {
    user.combatLogs.shift();
  }
};

// Helper to apply attribute gains on quest completion
const applyStatGains = (user, category, isDeduct = false) => {
  const multiplier = isDeduct ? -1 : 1;
  if (!user.stats) {
    user.stats = { str: 10, int: 10, wis: 10, cha: 10, agi: 10, luk: 10 };
  }
  
  const gains = {};
  if (category === 'Coding') {
    gains.int = 1;
    gains.wis = 1;
  } else if (category === 'Fitness') {
    gains.str = 2;
    gains.agi = 1;
  } else if (category === 'Communication') {
    gains.cha = 2;
    gains.wis = 1;
  } else if (category === 'Career' || category === 'Finance') {
    gains.wis = 1;
    gains.agi = 1;
    gains.luk = 1;
  } else if (category === 'Mindfulness') {
    gains.luk = 1;
    gains.wis = 1;
  } else { // General
    gains.luk = 1;
    gains.wis = 1;
  }

  const outputTexts = [];
  for (const stat in gains) {
    user.stats[stat] = Math.max(10, (user.stats[stat] || 10) + (gains[stat] * multiplier));
    outputTexts.push(`+${gains[stat]} ${stat.toUpperCase()}`);
  }
  
  return outputTexts.join(', ');
};

// Check and award badges
const checkAndAwardBadges = async (user, quest) => {
  const badges = await Badge.find({});
  const userBadgeIds = user.badges.map(b => b.toString());
  const newlyAwarded = [];

  for (const badge of badges) {
    if (userBadgeIds.includes(badge._id.toString())) continue;

    let award = false;

    // Check conditions
    if (badge.code === 'consistency_king' && user.streak >= 7) {
      award = true;
    } else if (badge.code === 'style_master' && (user.level >= 5 || quest.isBoss)) {
      award = true;
    } else if (badge.code === 'coding_warrior' && (
      quest.title.toLowerCase().includes('code') || 
      quest.title.toLowerCase().includes('leetcode') || 
      quest.title.toLowerCase().includes('program') || 
      quest.title.toLowerCase().includes('bug') ||
      quest.description.toLowerCase().includes('code') ||
      quest.category === 'Coding'
    )) {
      award = true;
    } else if (badge.code === 'fitness_champion' && (
      quest.title.toLowerCase().includes('workout') || 
      quest.title.toLowerCase().includes('run') || 
      quest.title.toLowerCase().includes('fit') || 
      quest.title.toLowerCase().includes('gym') ||
      quest.description.toLowerCase().includes('workout') ||
      quest.category === 'Fitness'
    )) {
      award = true;
    } else if (badge.code === 'leadership_hero' && (
      quest.title.toLowerCase().includes('speak') || 
      quest.title.toLowerCase().includes('lead') || 
      quest.title.toLowerCase().includes('presentation') || 
      quest.title.toLowerCase().includes('talk') ||
      quest.description.toLowerCase().includes('lead') ||
      quest.category === 'Communication'
    )) {
      award = true;
    } else if (badge.code === 'internship_hunter' && (
      quest.title.toLowerCase().includes('intern') || 
      quest.title.toLowerCase().includes('job') || 
      quest.title.toLowerCase().includes('apply') || 
      quest.title.toLowerCase().includes('resume') ||
      quest.title.toLowerCase().includes('portfolio') ||
      quest.category === 'Career'
    )) {
      award = true;
    }

    if (award) {
      user.badges.push(badge._id);
      newlyAwarded.push(badge);
      addCombatLog(user, `🏆 Unlocked Achievement Badge: '${badge.name}'!`);
    }
  }

  if (newlyAwarded.length > 0) {
    await user.save();
  }
  return newlyAwarded;
};

// Update Leaderboard cache for this user
const updateLeaderboardCache = async (user) => {
  try {
    await Leaderboard.findOneAndUpdate(
      { userId: user._id },
      {
        name: user.name,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('[!] Failed to update leaderboard cache:', error);
  }
};

export const getQuests = async (req, res) => {
  try {
    const quests = await Quest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: quests.length, data: quests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createQuest = async (req, res) => {
  try {
    const { title, description, difficulty, isWeekly, isBoss, category, subTasks } = req.body;

    if (!title || !difficulty) {
      return res.status(400).json({ success: false, message: 'Please provide title and difficulty' });
    }

    const xpReward = getXpByDifficulty(difficulty, isBoss);
    const inferredCategory = category || inferCategory(title, description);

    const quest = await Quest.create({
      userId: req.user._id,
      title,
      description: description || '',
      difficulty,
      xpReward,
      isWeekly: isWeekly || false,
      isBoss: isBoss || false,
      category: inferredCategory,
      subTasks: subTasks || []
    });

    res.status(201).json({ success: true, data: quest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateQuest = async (req, res) => {
  try {
    const { title, description, difficulty, completed, isWeekly, isBoss, category, subTasks } = req.body;
    let quest = await Quest.findOne({ _id: req.params.id, userId: req.user._id });

    if (!quest) {
      return res.status(404).json({ success: false, message: 'Quest not found' });
    }

    // Capture completion change
    const originalCompleted = quest.completed;

    if (title !== undefined) quest.title = title;
    if (description !== undefined) quest.description = description;
    if (difficulty !== undefined) {
      quest.difficulty = difficulty;
      quest.xpReward = getXpByDifficulty(difficulty, quest.isBoss);
    }
    if (isWeekly !== undefined) quest.isWeekly = isWeekly;
    if (category !== undefined) quest.category = category;
    if (subTasks !== undefined) quest.subTasks = subTasks;
    if (isBoss !== undefined) {
      quest.isBoss = isBoss;
      if (isBoss) {
        quest.difficulty = 'Boss';
        quest.xpReward = 100;
      }
    }

    // Completion toggle constraints: check if all subTasks are checked off first
    if (completed === true && quest.subTasks && quest.subTasks.length > 0) {
      const allDone = quest.subTasks.every(st => st.completed);
      if (!allDone) {
        return res.status(400).json({
          success: false,
          message: 'Cannot complete quest: some sub-tasks are still incomplete.'
        });
      }
    }

    let newlyUnlockedBadges = [];

    if (completed !== undefined && completed !== originalCompleted) {
      quest.completed = completed;
      quest.completedAt = completed ? new Date() : null;

      // Update user stats
      const user = await User.findById(req.user._id);
      
      if (completed) {
        let xpGained = quest.xpReward;
        let potionUsedText = '';
        
        // XP Potion Boost Check
        if (user.xpBoostsActive > 0) {
          xpGained *= 2;
          user.xpBoostsActive -= 1;
          potionUsedText = ' (🧪 Double XP Active!)';
        }

        user.xp += xpGained;
        
        // Gold reward check
        const goldGained = getGoldByDifficulty(quest.difficulty, quest.isBoss);
        user.gold = (user.gold || 0) + goldGained;

        // Level up formula: every 100 XP = +1 Level
        const newLevel = Math.floor(user.xp / 100) + 1;
        const leveledUp = newLevel > user.level;
        user.level = newLevel;

        // Streak computation
        const today = new Date().toDateString();
        let shieldConsumed = false;
        
        if (user.lastQuestCompletedAt) {
          const lastDate = new Date(user.lastQuestCompletedAt).toDateString();
          const diffTime = Math.abs(new Date(today) - new Date(lastDate));
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            user.streak += 1;
          } else if (diffDays > 1) {
            // Protected by Streak Shield?
            if (user.streakShields > 0) {
              user.streakShields -= 1;
              shieldConsumed = true;
              addCombatLog(user, `🛡️ Streak Shield consumed! Kept your streak of ${user.streak} days protected.`);
            } else {
              user.streak = 1; // reset if missed
            }
          }
          // if diffDays === 0, user completed another quest today, keep streak as is
        } else {
          user.streak = 1;
        }

        user.lastQuestCompletedAt = new Date();
        
        // Apply stats gains
        const statGainText = applyStatGains(user, quest.category, false);

        // Append Combat Log message
        addCombatLog(user, `⚔️ Defeated '${quest.title}'! Earned +${xpGained} XP${potionUsedText}, +${goldGained} Gold, and gains: [${statGainText}].`);
        
        if (leveledUp) {
          addCombatLog(user, `✨ Ding! You leveled up to Character Level ${newLevel}!`);
        }

        await user.save();

        // Award badges
        newlyUnlockedBadges = await checkAndAwardBadges(user, quest);
        await updateLeaderboardCache(user);
      } else {
        // Subtract XP / Gold if toggled back to incomplete
        const xpDeducted = quest.xpReward;
        const goldDeducted = getGoldByDifficulty(quest.difficulty, quest.isBoss);

        user.xp = Math.max(0, user.xp - xpDeducted);
        user.level = Math.floor(user.xp / 100) + 1;
        user.gold = Math.max(0, (user.gold || 0) - goldDeducted);

        // Reverse stats gains
        applyStatGains(user, quest.category, true);

        addCombatLog(user, `🔄 Quest unmarked: '${quest.title}'. Deducted -${xpDeducted} XP and -${goldDeducted} Gold.`);

        await user.save();
        await updateLeaderboardCache(user);
      }
    }

    await quest.save();

    res.status(200).json({ 
      success: true, 
      data: quest, 
      newBadges: newlyUnlockedBadges 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteQuest = async (req, res) => {
  try {
    const quest = await Quest.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!quest) {
      return res.status(404).json({ success: false, message: 'Quest not found' });
    }

    res.status(200).json({ success: true, message: 'Quest deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateQuests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { skillLevel, dailyTime, careerGoal } = user.activeGoals;
    const goal = careerGoal || 'General Growth';

    // Calculate Completion Rate of existing quests for adaptive AI
    const totalQuests = await Quest.countDocuments({ userId: user._id });
    const completedQuests = await Quest.countDocuments({ userId: user._id, completed: true });
    const completionRate = totalQuests > 0 ? (completedQuests / totalQuests) : 1.0;

    // Call AI service wrapper
    const generated = await fetchAIQuests(
      goal,
      skillLevel,
      dailyTime,
      user.level,
      user.streak,
      completionRate
    );

    // Save generated quests to database
    const dailyQuestsCreated = [];
    const weeklyQuestsCreated = [];

    if (generated.dailyQuests) {
      for (const q of generated.dailyQuests) {
        const inferred = inferCategory(q.title, q.description);
        const created = await Quest.create({
          userId: user._id,
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          xpReward: q.xpReward,
          isWeekly: false,
          category: inferred
        });
        dailyQuestsCreated.push(created);
      }
    }

    if (generated.weeklyQuests) {
      for (const q of generated.weeklyQuests) {
        const inferred = inferCategory(q.title, q.description);
        const created = await Quest.create({
          userId: user._id,
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          xpReward: q.xpReward,
          isWeekly: true,
          category: inferred
        });
        weeklyQuestsCreated.push(created);
      }
    }

    res.status(200).json({
      success: true,
      dailyQuests: dailyQuestsCreated,
      weeklyQuests: weeklyQuestsCreated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const goal = user.activeGoals.careerGoal || 'General Growth';
    const recommendations = await fetchAIRecommendations(goal);

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
