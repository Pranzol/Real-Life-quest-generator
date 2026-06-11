import Badge from '../models/Badge.js';
import User from '../models/User.js';

// Predefined badges data
const DEFAULT_BADGES = [
  {
    name: 'Coding Warrior',
    code: 'coding_warrior',
    description: 'Complete a programming or algorithm challenge.',
    icon: 'Code'
  },
  {
    name: 'Fitness Champion',
    code: 'fitness_champion',
    description: 'Execute a workout or health milestone.',
    icon: 'Dumbbell'
  },
  {
    name: 'Internship Hunter',
    code: 'internship_hunter',
    description: 'Complete a resume submission, application or profile preparation.',
    icon: 'Briefcase'
  },
  {
    name: 'Leadership Hero',
    code: 'leadership_hero',
    description: 'Deliver a speech or carry out a communication quest.',
    icon: 'Users'
  },
  {
    name: 'Consistency King',
    code: 'consistency_king',
    description: 'Maintain a daily quest completion streak of 7 days.',
    icon: 'Flame'
  },
  {
    name: 'Style Master',
    code: 'style_master',
    description: 'Reach user Level 5 or successfully complete a Boss Challenge.',
    icon: 'Sparkles'
  }
];

export const seedBadges = async (req, res) => {
  try {
    const results = [];
    for (const b of DEFAULT_BADGES) {
      const exists = await Badge.findOne({ code: b.code });
      if (!exists) {
        const created = await Badge.create(b);
        results.push(created);
      } else {
        results.push(exists);
      }
    }
    
    if (res) {
      res.status(200).json({ success: true, message: 'Badges seeded successfully', data: results });
    }
  } catch (error) {
    if (res) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      console.error('[!] Error seeding badges:', error);
    }
  }
};

export const getBadges = async (req, res) => {
  try {
    const badges = await Badge.find({});
    res.status(200).json({ success: true, data: badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('badges');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user.badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
