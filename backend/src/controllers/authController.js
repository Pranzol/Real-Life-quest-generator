import User from '../models/User.js';
import Badge from '../models/Badge.js';
import jwt from 'jsonwebtoken';

// Helper to sign JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'quest_secret_key', {
    expiresIn: '30d',
  });
};

// Formats the user data sent to the client with new RPG fields
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

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).populate('badges');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('badges');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const onboard = async (req, res) => {
  try {
    const { name, careerGoal, personalGoals, dailyTime, skillLevel, characterClass } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    user.activeGoals = {
      careerGoal: careerGoal || '',
      personalGoals: personalGoals || [],
      dailyTime: dailyTime || '',
      skillLevel: skillLevel || 'Beginner',
    };
    
    if (characterClass) {
      user.characterClass = characterClass;
      
      // Initialize stats according to chosen class
      const defaultStats = { str: 10, int: 10, wis: 10, cha: 10, agi: 10, luk: 10 };
      if (characterClass === 'Warrior') {
        user.stats = { ...defaultStats, str: 15, agi: 12 };
      } else if (characterClass === 'Mage') {
        user.stats = { ...defaultStats, int: 15, wis: 12 };
      } else if (characterClass === 'Rogue') {
        user.stats = { ...defaultStats, agi: 15, luk: 12 };
      } else if (characterClass === 'Cleric') {
        user.stats = { ...defaultStats, cha: 15, wis: 12 };
      }
    }

    user.isOnboarded = true;
    user.gold = 100; // Starting Gold Balance
    
    // Starting combat log message
    user.combatLogs = [{
      message: `⚔️ Character Created! You began your journey as a Level 1 ${characterClass || 'Adventurer'}.`,
      timestamp: new Date()
    }];

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
