import React from 'react';
import { Flame, Star, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const XPBar = ({ user }) => {
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const streak = user?.streak || 0;

  // Level up threshold is 100 XP per level
  const currentLevelXp = xp % 100;
  const xpPercentage = Math.min(100, Math.max(0, currentLevelXp));

  // Determine Rank based on Level
  const getRank = (lvl) => {
    if (lvl >= 50) return { title: 'Legend', color: 'text-rpg-gold text-glow-gold font-extrabold' };
    if (lvl >= 30) return { title: 'Professional', color: 'text-rpg-blue-glow text-glow-blue font-bold' };
    if (lvl >= 20) return { title: 'Warrior', color: 'text-rpg-purple-glow text-glow-purple font-bold' };
    if (lvl >= 10) return { title: 'Explorer', color: 'text-cyan-400 font-medium' };
    return { title: 'Beginner', color: 'text-gray-400 font-normal' };
  };

  const rank = getRank(level);

  return (
    <div className="glass border border-rpg-border p-6 rounded-2xl shadow-purple-glow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        {/* Left Stats */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-rpg-purple to-rpg-blue flex items-center justify-center border-2 border-rpg-gold/50 shadow-gold-glow flex-shrink-0">
            <span className="text-2xl font-black text-white">{level}</span>
            <Star className="absolute -top-1.5 -right-1.5 w-5 h-5 text-rpg-gold fill-rpg-gold animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">{user?.name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full bg-rpg-purple/20 border border-rpg-purple/40 ${rank.color}`}>
                {rank.title}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              XP: <span className="text-white font-bold">{xp}</span> (Next Level in {100 - currentLevelXp} XP)
            </p>
          </div>
        </div>

        {/* Right Stats (Streak) */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rpg-gold/10 border border-rpg-gold/20 text-rpg-gold">
            <Flame className="w-5 h-5 fill-rpg-gold animate-pulse" />
            <div className="text-left">
              <p className="text-xs text-rpg-gold/70 leading-none">STREAK</p>
              <p className="text-lg font-black">{streak} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-4 bg-gray-900/80 rounded-full border border-rpg-border/30 overflow-hidden p-0.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${xpPercentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-rpg-purple via-rpg-blue to-rpg-gold relative"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-white/20 skew-x-12 animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
};

export default XPBar;
