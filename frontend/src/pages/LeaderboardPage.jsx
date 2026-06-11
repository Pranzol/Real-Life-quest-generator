import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Trophy, Medal, Star, Flame, Search, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaderboard');
      if (res.data.success) {
        setStandings(res.data.data);
      }
    } catch (err) {
      console.error('[!] Failed to load leaderboard standings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (idx) => {
    switch (idx) {
      case 0:
        return <Trophy className="w-5 h-5 text-rpg-gold fill-rpg-gold animate-pulse" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-300 fill-gray-300" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600 fill-amber-700" />;
      default:
        return <span className="font-bold text-xs text-gray-500">{idx + 1}</span>;
    }
  };

  // Extract top 3 podium
  const topThree = standings.slice(0, 3);
  const restStandings = standings.slice(3);

  // Find user's rank
  const userRankIndex = standings.findIndex(u => u._id === user?.id || u.name === user?.name);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : 'N/A';

  return (
    <div className="min-h-screen bg-rpg-bg relative pb-20">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rpg-purple/10 blur-[130px] pointer-events-none" />

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-rpg-purple/15 border-2 border-rpg-purple flex items-center justify-center text-rpg-purple-light mx-auto mb-4 shadow-purple-glow">
            <Trophy className="w-8 h-8 fill-rpg-purple/10" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wide">Hall of Legends</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
            Compete with adventurers around the globe. Scale the ranks by gaining levels, building streaks, and earning badges.
          </p>
        </div>

        {/* Current user placement card */}
        {user && (
          <div className="glass border border-rpg-gold/30 bg-rpg-gold/5 p-4 rounded-xl flex items-center justify-between shadow-gold-glow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rpg-gold/15 border border-rpg-gold/40 flex items-center justify-center text-rpg-gold font-black">
                #{userRank}
              </div>
              <div>
                <h4 className="text-xs font-bold text-rpg-gold">YOUR CURRENT PLACEMENT</h4>
                <h3 className="text-base font-black text-white">{user.name}</h3>
              </div>
            </div>
            <div className="flex gap-4 text-xs font-bold">
              <div className="text-right">
                <span className="text-[10px] text-gray-500 block leading-none">LEVEL</span>
                <span className="text-white mt-1 block">Lvl {user.level}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 block leading-none">TOTAL XP</span>
                <span className="text-rpg-gold mt-1 block">{user.xp} XP</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 block leading-none">STREAK</span>
                <span className="text-orange-400 mt-1 block flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 fill-current" /> {user.streak}d
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Podium Display (Top 3) */}
        {!loading && topThree.length > 0 && (
          <div className="grid grid-cols-3 gap-4 items-end pt-10 pb-6 max-w-xl mx-auto">
            {/* 2nd Place */}
            {topThree[1] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="text-center mb-2">
                  <Medal className="w-8 h-8 text-gray-300 fill-gray-300 mx-auto" />
                  <p className="text-xs font-bold text-gray-300 mt-1 truncate max-w-[90px]">{topThree[1].name}</p>
                  <p className="text-[10px] text-gray-400">Lvl {topThree[1].level}</p>
                </div>
                <div className="w-full h-24 bg-gradient-to-t from-gray-900 to-gray-800 border-t border-gray-700 rounded-t-xl flex items-center justify-center">
                  <span className="text-2xl font-black text-gray-500">2</span>
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center relative"
              >
                <div className="absolute -top-6 text-center animate-bounce">
                  <Star className="w-6 h-6 text-rpg-gold fill-rpg-gold mx-auto" />
                </div>
                <div className="text-center mb-2">
                  <Trophy className="w-10 h-10 text-rpg-gold fill-rpg-gold mx-auto shadow-gold-glow" />
                  <p className="text-sm font-black text-rpg-gold-glow mt-1 truncate max-w-[100px]">{topThree[0].name}</p>
                  <p className="text-xs text-gray-400">Lvl {topThree[0].level}</p>
                </div>
                <div className="w-full h-32 bg-gradient-to-t from-rpg-purple/40 to-rpg-card border-t border-rpg-gold rounded-t-2xl flex items-center justify-center shadow-gold-glow">
                  <span className="text-3xl font-black text-rpg-gold text-glow-gold">1</span>
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="text-center mb-2">
                  <Medal className="w-8 h-8 text-amber-600 fill-amber-700 mx-auto" />
                  <p className="text-xs font-bold text-amber-600 mt-1 truncate max-w-[90px]">{topThree[2].name}</p>
                  <p className="text-[10px] text-gray-400">Lvl {topThree[2].level}</p>
                </div>
                <div className="w-full h-20 bg-gradient-to-t from-gray-900 to-gray-800 border-t border-gray-700 rounded-t-xl flex items-center justify-center">
                  <span className="text-xl font-black text-amber-700">3</span>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Global Leaderboard Standings Table */}
        <div className="glass border border-rpg-border p-6 rounded-2xl">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-rpg-purple border-t-transparent rounded-full animate-spin" />
            </div>
          ) : standings.length === 0 ? (
            <p className="text-xs text-gray-500 italic text-center py-8">No leaderboard data found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-rpg-border/30 text-[10px] text-gray-500 uppercase font-black">
                    <th className="pb-3 pl-2">Rank</th>
                    <th className="pb-3">Player Name</th>
                    <th className="pb-3 text-center">Level</th>
                    <th className="pb-3 text-center">Total XP</th>
                    <th className="pb-3 text-right pr-2">Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rpg-border/10 text-xs">
                  {/* Render podium top 3 in list too */}
                  {standings.map((player, index) => {
                    const isCurrentUser = player._id === user?.id || player.name === user?.name;

                    return (
                      <tr
                        key={player._id}
                        className={`transition-colors duration-200 ${
                          isCurrentUser 
                            ? 'bg-rpg-purple/10 text-white font-bold border-l-2 border-l-rpg-purple' 
                            : 'hover:bg-rpg-purple/5 text-gray-300'
                        }`}
                      >
                        <td className="py-3.5 pl-2 flex items-center gap-1">
                          {getRankBadge(index)}
                        </td>
                        <td className="py-3.5 font-bold">
                          {player.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-[9px] bg-rpg-purple/20 text-rpg-purple-light border border-rpg-purple/30 px-1.5 py-0.5 rounded">
                              YOU
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-center font-bold text-gray-200">
                          {player.level}
                        </td>
                        <td className="py-3.5 text-center font-black text-rpg-gold">
                          {player.xp}
                        </td>
                        <td className="py-3.5 text-right pr-2 text-orange-400 font-bold">
                          <span className="inline-flex items-center gap-0.5">
                            <Flame className="w-3.5 h-3.5 fill-current" /> {player.streak}d
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
