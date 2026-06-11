import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Code, Dumbbell, Briefcase, Users, Flame, Sparkles, Award, Lock } from 'lucide-react';

// Map icon strings to Lucide components
const ICON_MAP = {
  Code: Code,
  Dumbbell: Dumbbell,
  Briefcase: Briefcase,
  Users: Users,
  Flame: Flame,
  Sparkles: Sparkles,
  Award: Award
};

const BadgeGrid = ({ unlockedBadges }) => {
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await api.get('/badges');
        if (res.data.success) {
          setAllBadges(res.data.data);
        }
      } catch (err) {
        console.error('[!] Failed to load badges inventory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const isUnlocked = (badgeId) => {
    return unlockedBadges?.some(b => b._id === badgeId || b === badgeId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-2 border-rpg-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="glass border border-rpg-border p-6 rounded-2xl">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-rpg-gold" /> Achievements Inventory
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {allBadges.map((badge) => {
          const unlocked = isUnlocked(badge._id);
          const IconComponent = ICON_MAP[badge.icon] || Award;

          return (
            <div
              key={badge._id}
              className={`relative flex flex-col items-center text-center p-4 rounded-xl border transition-all duration-300 ${
                unlocked
                  ? 'bg-gradient-to-b from-rpg-purple/20 to-rpg-card border-rpg-purple/50 shadow-purple-glow hover:border-rpg-purple-glow'
                  : 'bg-gray-900/40 border-rpg-border/20 opacity-40'
              }`}
            >
              {/* Badge Icon circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border mb-3 transition-colors ${
                  unlocked
                    ? 'bg-rpg-purple/20 border-rpg-purple-glow text-rpg-purple-light'
                    : 'bg-gray-950 border-gray-800 text-gray-600'
                }`}
              >
                {unlocked ? (
                  <IconComponent className="w-6 h-6 animate-pulse" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
              </div>

              {/* Title & Description */}
              <h4 className={`text-xs font-bold ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                {badge.name}
              </h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                {badge.description}
              </p>

              {/* Unlocked tag */}
              {unlocked && (
                <span className="absolute -top-1.5 -right-1 text-[8px] bg-rpg-gold text-rpg-bg font-extrabold px-1.5 py-0.5 rounded-full border border-rpg-bg">
                  UNLOCKED
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeGrid;
