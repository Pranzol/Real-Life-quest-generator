import User from '../models/User.js';
import Quest from '../models/Quest.js';
import Badge from '../models/Badge.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protect from deleting the main admin
    if (user.email === 'admin@rpgquest.com') {
      return res.status(400).json({ success: false, message: 'Cannot delete the administrator account' });
    }

    // Delete associated quests
    await Quest.deleteMany({ userId: user._id });

    // Delete user
    await User.findByIdAndDelete(user._id);

    res.status(200).json({ success: true, message: 'User and associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalQuests = await Quest.countDocuments({});
    const completedQuests = await Quest.countDocuments({ completed: true });
    
    // Average XP
    const users = await User.find({});
    const totalXp = users.reduce((sum, u) => sum + u.xp, 0);
    const avgXp = totalUsers > 0 ? Math.round(totalXp / totalUsers) : 0;
    
    // Badge distribution
    const badges = await Badge.find({});
    const badgeCountMap = {};
    for (const b of badges) {
      badgeCountMap[b.name] = 0;
    }
    
    for (const u of users) {
      for (const bId of u.badges) {
        const matchedBadge = badges.find(b => b._id.toString() === bId.toString());
        if (matchedBadge) {
          badgeCountMap[matchedBadge.name] = (badgeCountMap[matchedBadge.name] || 0) + 1;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalQuests,
        completedQuests,
        completionRate: totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0,
        averageXp: avgXp,
        badgeDistribution: badgeCountMap
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
