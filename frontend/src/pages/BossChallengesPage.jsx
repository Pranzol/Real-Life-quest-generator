import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import QuestCard from '../components/QuestCard';
import api from '../utils/api';
import { Trophy, Sword, Flame, Award, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const BOSS_LIST = [
  {
    code: 'boss_fullstack',
    title: 'Build a Production-Ready Full Stack Application',
    category: 'Coding',
    description: 'Design and code a complete application with database integration, secure authentication, and a premium frontend interface. Host the project live.',
    difficulty: 'Boss',
    xpReward: 100,
    badgeAward: 'Style Master'
  },
  {
    code: 'boss_fitness',
    title: 'Complete 30-Day Fitness & Strength Challenge',
    category: 'Fitness',
    description: 'Train at least 4 times a week, tracking nutrition and hitting workout targets consistently for 30 consecutive days without missing a session.',
    difficulty: 'Boss',
    xpReward: 100,
    badgeAward: 'Style Master'
  },
  {
    code: 'boss_speaking',
    title: 'Public Speaking or Community Presentation Master',
    category: 'Communication',
    description: 'Prepare and deliver a 10-minute presentation or lecture to a live audience, or publish an engaging video covering a technical subject.',
    difficulty: 'Boss',
    xpReward: 100,
    badgeAward: 'Style Master'
  }
];

const BossChallengesPage = () => {
  const { user, refreshProfile } = useAuth();
  const [activeBossQuests, setActiveBossQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBossQuests();
  }, []);

  const fetchBossQuests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/quests');
      if (res.data.success) {
        // Filter boss challenges
        setActiveBossQuests(res.data.data.filter(q => q.isBoss));
      }
    } catch (err) {
      console.error('[!] Failed to fetch boss challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = async (boss) => {
    // Check if already active
    const alreadyExists = activeBossQuests.some(q => q.title === boss.title && !q.completed);
    if (alreadyExists) {
      alert('This Boss Challenge is already active on your dashboard!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/quests', {
        title: boss.title,
        description: boss.description,
        difficulty: 'Boss',
        isBoss: true
      });
      if (res.data.success) {
        fetchBossQuests();
      }
    } catch (err) {
      console.error('[!] Failed to activate Boss Challenge:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const res = await api.put(`/quests/${id}`, {
        completed: !currentStatus
      });
      if (res.data.success) {
        setActiveBossQuests(prev => prev.map(q => q._id === id ? res.data.data : q));
        await refreshProfile();
      }
    } catch (err) {
      console.error('[!] Failed to toggle boss complete:', err);
    }
  };

  const handleUpdateQuest = async (id, updatedFields) => {
    try {
      const res = await api.put(`/quests/${id}`, updatedFields);
      if (res.data.success) {
        setActiveBossQuests(prev => prev.map(q => q._id === id ? res.data.data : q));
        await refreshProfile();
      }
    } catch (err) {
      console.error('[!] Failed to update boss challenge:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to forfeit this Boss Challenge?')) return;
    try {
      const res = await api.delete(`/quests/${id}`);
      if (res.data.success) {
        setActiveBossQuests(prev => prev.filter(q => q._id !== id));
      }
    } catch (err) {
      console.error('[!] Failed to delete boss challenge:', err);
    }
  };

  return (
    <div className="min-h-screen bg-rpg-bg relative pb-20">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rpg-gold/10 blur-[130px] pointer-events-none" />

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8 relative z-10">
        {/* Header Title */}
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-rpg-gold/15 border-2 border-rpg-gold flex items-center justify-center text-rpg-gold mx-auto mb-4 animate-float shadow-gold-glow">
            <Sword className="w-8 h-8 fill-rpg-gold/10" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wide">Legendary Boss Challenges</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
            Take on massive achievements. These quests take longer to complete but award massive rewards and special titles.
          </p>
        </div>

        {/* Active Boss Quests Grid */}
        <div className="glass border border-rpg-border p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rpg-danger" /> Active Boss Campaigns
          </h3>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-2 border-rpg-purple border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeBossQuests.length === 0 ? (
            <p className="text-xs text-gray-500 italic text-center py-8">No active boss challenges. Select a boss below to begin!</p>
          ) : (
            <div className="space-y-4">
              {activeBossQuests.map((q) => (
                <QuestCard
                  key={q._id}
                  quest={q}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDelete}
                  onUpdate={handleUpdateQuest}
                />
              ))}
            </div>
          )}
        </div>

        {/* Boss List Selection */}
        <h3 className="text-xl font-bold text-white tracking-wide mt-10">Select a Boss Campaign</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BOSS_LIST.map((boss) => {
            const isCurrentlyActive = activeBossQuests.some(q => q.title === boss.title && !q.completed);
            const isCompleted = activeBossQuests.some(q => q.title === boss.title && q.completed);

            return (
              <div
                key={boss.code}
                className="glass border border-rpg-border/50 p-6 rounded-2xl flex flex-col justify-between hover:border-rpg-gold/50 hover:shadow-gold-glow transition-all duration-300 relative bg-rpg-card"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase font-black text-rpg-gold px-2.5 py-0.5 rounded-full bg-rpg-gold/15 border border-rpg-gold/30">
                      {boss.category}
                    </span>
                    <span className="text-xs font-bold text-rpg-danger flex items-center gap-1">
                      <Sword className="w-3.5 h-3.5 fill-current" /> Boss Quest
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white leading-snug mb-3">
                    {boss.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-6">
                    {boss.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Rewards summary */}
                  <div className="border-t border-rpg-border/20 pt-4 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 block">XP REWARD</span>
                      <span className="font-black text-rpg-gold">+{boss.xpReward} XP</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">TITLE AWARD</span>
                      <span className="font-bold text-rpg-purple-light flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {boss.badgeAward}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={submitting || isCurrentlyActive || isCompleted}
                    onClick={() => handleStartChallenge(boss)}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      isCompleted
                        ? 'bg-rpg-success/15 border border-rpg-success/30 text-rpg-success'
                        : isCurrentlyActive
                        ? 'bg-rpg-purple/10 border border-rpg-purple/30 text-rpg-purple-light cursor-not-allowed'
                        : 'bg-gradient-to-r from-rpg-gold via-yellow-500 to-amber-600 hover:scale-[1.01] text-rpg-bg font-black shadow-gold-glow'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 fill-current" /> Campaign Cleared
                      </>
                    ) : isCurrentlyActive ? (
                      'Campaign in Progress'
                    ) : (
                      <>
                        <Sword className="w-4 h-4" /> Challenge Boss
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BossChallengesPage;
