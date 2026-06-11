import express from 'express';
import { register, login, logout, getMe, onboard } from '../controllers/authController.js';
import { getQuests, createQuest, updateQuest, deleteQuest, generateQuests, getRecommendations } from '../controllers/questController.js';
import { getBadges, getUserBadges, seedBadges } from '../controllers/badgeController.js';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { getUsers, deleteUser, getAnalytics } from '../controllers/adminController.js';
import { getRewards, createReward, deleteReward, buyShopItem } from '../controllers/shopController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Seed badges endpoint
router.post('/badges/seed', seedBadges);

// --- Auth Routes ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/me', protect, getMe);
router.post('/auth/onboard', protect, onboard);

// --- Quest Routes ---
router.get('/quests', protect, getQuests);
router.post('/quests', protect, createQuest);
router.put('/quests/:id', protect, updateQuest);
router.delete('/quests/:id', protect, deleteQuest);

// --- Badge Routes ---
router.get('/badges', protect, getBadges);
router.get('/badges/user', protect, getUserBadges);

// --- Leaderboard Route ---
router.get('/leaderboard', protect, getLeaderboard);

// --- Recommendations Route ---
router.get('/recommendations', protect, getRecommendations);

// --- AI Service Route ---
router.post('/ai/generate', protect, generateQuests);

// --- Gold Shop Routes ---
router.get('/shop/rewards', protect, getRewards);
router.post('/shop/rewards', protect, createReward);
router.delete('/shop/rewards/:id', protect, deleteReward);
router.post('/shop/buy', protect, buyShopItem);

// --- Admin Routes ---
router.get('/admin/users', protect, admin, getUsers);
router.delete('/admin/users/:id', protect, admin, deleteUser);
router.get('/admin/analytics', protect, admin, getAnalytics);

export default router;
