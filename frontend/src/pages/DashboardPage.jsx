import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import XPBar from '../components/XPBar';
import QuestCard from '../components/QuestCard';
import BadgeGrid from '../components/BadgeGrid';
import api from '../utils/api';
import { Sparkles, Plus, BookOpen, BarChart3, ListTodo, Award, CheckCircle2, Trophy, Coins, Wand2, Sword, Gem, Users, ShieldAlert, Zap, Terminal, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const DashboardPage = () => {
  const { user, refreshProfile } = useAuth();
  const [quests, setQuests] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingQuests, setLoadingQuests] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(user?.level || 1);

  // Manual quest form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [category, setCategory] = useState('General');
  const [isWeekly, setIsWeekly] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Checklist creation states
  const [tempSubTasks, setTempSubTasks] = useState([]);
  const [subTaskInput, setSubTaskInput] = useState('');

  // Newly awarded badges notifications
  const [newBadgesAlert, setNewBadgesAlert] = useState([]);

  useEffect(() => {
    fetchQuests();
    fetchRecommendations();
  }, []);

  // Monitor for level-ups
  useEffect(() => {
    if (user && user.level > prevLevel) {
      setShowLevelUp(true);
      setPrevLevel(user.level);
      setTimeout(() => setShowLevelUp(false), 4000);
    }
  }, [user, prevLevel]);

  const fetchQuests = async () => {
    setLoadingQuests(true);
    try {
      const res = await api.get('/quests');
      if (res.data.success) {
        setQuests(res.data.data);
      }
    } catch (err) {
      console.error('[!] Failed to load quests list:', err);
    } finally {
      setLoadingQuests(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await api.get('/recommendations');
      if (res.data.success) {
        setRecommendations(res.data.data);
      }
    } catch (err) {
      console.error('[!] Failed to load recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleAddTempSubtask = () => {
    if (!subTaskInput.trim()) return;
    setTempSubTasks(prev => [...prev, { title: subTaskInput.trim(), completed: false }]);
    setSubTaskInput('');
  };

  const handleRemoveTempSubtask = (index) => {
    setTempSubTasks(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleCreateQuest = async (e) => {
    e.preventDefault();
    if (!title) return;
    setFormSubmitting(true);
    try {
      const res = await api.post('/quests', {
        title,
        description,
        difficulty,
        category,
        isWeekly,
        subTasks: tempSubTasks
      });
      if (res.data.success) {
        setTitle('');
        setDescription('');
        setDifficulty('Easy');
        setCategory('General');
        setTempSubTasks([]);
        setIsWeekly(false);
        setShowAddForm(false);
        fetchQuests();
      }
    } catch (err) {
      console.error('[!] Failed to create manual quest:', err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleComplete = async (id, currentCompletedStatus) => {
    try {
      const res = await api.put(`/quests/${id}`, {
        completed: !currentCompletedStatus
      });
      if (res.data.success) {
        // Update quest list
        setQuests(prev => prev.map(q => q._id === id ? res.data.data : q));
        
        // Refresh profile stats (XP/levels/badges/gold/logs)
        await refreshProfile();

        // Check if badges were awarded
        if (res.data.newBadges && res.data.newBadges.length > 0) {
          setNewBadgesAlert(res.data.newBadges);
          setTimeout(() => setNewBadgesAlert([]), 5000);
        }
      }
    } catch (err) {
      console.error('[!] Failed to toggle quest completeness:', err);
      alert(err.response?.data?.message || 'Error toggling quest.');
    }
  };

  const handleUpdateQuest = async (id, updatedFields) => {
    try {
      const res = await api.put(`/quests/${id}`, updatedFields);
      if (res.data.success) {
        setQuests(prev => prev.map(q => q._id === id ? res.data.data : q));
        await refreshProfile();
      }
    } catch (err) {
      console.error('[!] Failed to update quest checklist:', err);
    }
  };

  const handleDeleteQuest = async (id) => {
    try {
      const res = await api.delete(`/quests/${id}`);
      if (res.data.success) {
        setQuests(prev => prev.filter(q => q._id !== id));
      }
    } catch (err) {
      console.error('[!] Failed to delete quest:', err);
    }
  };

  const handleGenerateAIQuests = async () => {
    setLoadingAI(true);
    try {
      const res = await api.post('/ai/generate');
      if (res.data.success) {
        fetchQuests();
        fetchRecommendations(); // AI goals may have caused updates
        await refreshProfile();
      }
    } catch (err) {
      console.error('[!] Failed to regenerate AI quests:', err);
    } finally {
      setLoadingAI(false);
    }
  };

  // Filter lists
  const dailyQuests = quests.filter(q => !q.isWeekly && !q.isBoss);
  const weeklyQuests = quests.filter(q => q.isWeekly && !q.isBoss);

  // Statistics calculation for Recharts
  const completedCount = quests.filter(q => q.completed).length;
  const totalCount = quests.length;
  const pendingCount = totalCount - completedCount;

  // Chart 1: Completion rate Pie Chart
  const pieData = [
    { name: 'Completed', value: completedCount || 0, color: '#10b981' },
    { name: 'Pending', value: pendingCount || 0, color: '#8b5cf6' }
  ];
  if (totalCount === 0) {
    pieData[1].value = 1; // Empty state placeholder
    pieData[1].color = '#1f2937';
  }

  // Chart 2: Daily XP progress history (mocked relative to current user XP)
  const userXp = user?.xp || 0;
  const xpHistory = [
    { day: 'Mon', xp: Math.max(0, userXp - 80) },
    { day: 'Tue', xp: Math.max(0, userXp - 50) },
    { day: 'Wed', xp: Math.max(0, userXp - 30) },
    { day: 'Thu', xp: Math.max(0, userXp - 20) },
    { day: 'Fri', xp: userXp }
  ];

  // Chart 3: Difficulty distribution
  const difficultyDistribution = [
    { name: 'Easy', count: quests.filter(q => q.difficulty === 'Easy').length },
    { name: 'Medium', count: quests.filter(q => q.difficulty === 'Medium').length },
    { name: 'Hard', count: quests.filter(q => q.difficulty === 'Hard').length },
    { name: 'Boss', count: quests.filter(q => q.difficulty === 'Boss').length }
  ];

  // Class icon mapping
  const getClassIcon = (className) => {
    switch (className) {
      case 'Warrior': return Sword;
      case 'Mage': return Wand2;
      case 'Rogue': return Gem;
      case 'Cleric': return Users;
      default: return Sparkles;
    }
  };

  const ClassIconComponent = getClassIcon(user?.characterClass);

  return (
    <div className="min-h-screen bg-rpg-bg relative pb-20">
      <Navbar />

      {/* Level Up Banner Celebration Overlay */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="relative mb-4"
            >
              <Trophy className="w-24 h-24 text-rpg-gold fill-rpg-gold shadow-gold-glow" />
              <Sparkles className="absolute top-0 right-0 w-8 h-8 text-rpg-purple-glow animate-ping" />
            </motion.div>
            <h2 className="text-5xl font-black text-rpg-gold text-glow-gold tracking-widest">LEVEL UP!</h2>
            <p className="text-xl text-white font-bold mt-2">You reached Character Level {user?.level}!</p>
            <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest">Rank Tier: {user?.characterClass || 'Adventurer'}</p>
            <button
              onClick={() => setShowLevelUp(false)}
              className="mt-8 px-6 py-2 rounded-lg bg-rpg-purple text-white text-xs font-bold hover:bg-rpg-purple-light"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Awarded Overlay */}
      <AnimatePresence>
        {newBadgesAlert.length > 0 && (
          <div className="fixed top-20 right-4 z-40 space-y-2">
            {newBadgesAlert.map((badge) => (
              <motion.div
                key={badge._id}
                initial={{ opacity: 0, x: 50, y: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="glass border-2 border-rpg-gold p-4 rounded-xl shadow-gold-glow flex items-center gap-3 bg-gray-950 max-w-sm"
              >
                <div className="w-10 h-10 rounded-full bg-rpg-gold/10 border border-rpg-gold/40 flex items-center justify-center text-rpg-gold">
                  <Award className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rpg-gold">Badge Unlocked!</h4>
                  <h5 className="text-sm font-black text-white">{badge.name}</h5>
                  <p className="text-[10px] text-gray-400 leading-none mt-0.5">{badge.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {/* Top XP display */}
        {user && <XPBar user={user} />}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns (Active Missions) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active missions board card */}
            <div className="glass border border-rpg-border p-6 rounded-2xl">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-rpg-purple" /> Active Missions
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateAIQuests}
                    disabled={loadingAI}
                    className="px-4 py-2 rounded-xl bg-rpg-purple/10 hover:bg-rpg-purple/20 border border-rpg-purple/30 text-rpg-purple-light text-xs font-bold hover:scale-[1.01] transition-all flex items-center gap-1"
                  >
                    <Sparkles className="w-4 h-4" />
                    {loadingAI ? 'Generating...' : 'Roll AI Quests'}
                  </button>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rpg-purple to-rpg-blue hover:from-rpg-purple-light hover:to-rpg-blue-light text-white text-xs font-bold hover:scale-[1.01] transition-all flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Quest
                  </button>
                </div>
              </div>

              {/* Add Custom Quest Form Overlay */}
              {showAddForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateQuest}
                  className="mb-6 p-5 rounded-xl border border-rpg-border/45 bg-gray-950/80 space-y-4 shadow-purple-glow"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Quest Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Solve 3 Leetcode"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-rpg-border/50 rounded-lg text-white text-xs focus:border-rpg-purple focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-rpg-border/50 rounded-lg text-white text-xs focus:border-rpg-purple focus:outline-none"
                      >
                        <option value="General">General</option>
                        <option value="Coding">Coding</option>
                        <option value="Fitness">Fitness</option>
                        <option value="Communication">Communication</option>
                        <option value="Career">Career</option>
                        <option value="Finance">Finance</option>
                        <option value="Mindfulness">Mindfulness</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-rpg-border/50 rounded-lg text-white text-xs focus:border-rpg-purple focus:outline-none"
                      >
                        <option value="Easy">Easy (+10 XP / +10 GP)</option>
                        <option value="Medium">Medium (+25 XP / +25 GP)</option>
                        <option value="Hard">Hard (+50 XP / +50 GP)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Description</label>
                    <textarea
                      placeholder="Add details, criteria or checklists..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-900 border border-rpg-border/50 rounded-lg text-white text-xs focus:border-rpg-purple focus:outline-none"
                    />
                  </div>

                  {/* Add Subtasks checklist inside form */}
                  <div className="space-y-2 border-t border-rpg-border/10 pt-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quest Checklist / Sub-Tasks</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add sub-task step..."
                        value={subTaskInput}
                        onChange={(e) => setSubTaskInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-gray-900 border border-rpg-border/40 rounded-lg text-white text-xs focus:outline-none focus:border-rpg-purple"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTempSubtask())}
                      />
                      <button
                        type="button"
                        onClick={handleAddTempSubtask}
                        className="px-3 py-1.5 bg-rpg-purple hover:bg-rpg-purple-light text-white text-xs font-bold rounded-lg"
                      >
                        Add Step
                      </button>
                    </div>

                    {tempSubTasks.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {tempSubTasks.map((st, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-900 border border-rpg-border/30 text-[10px] text-gray-300"
                          >
                            {st.title}
                            <button
                              type="button"
                              onClick={() => handleRemoveTempSubtask(idx)}
                              className="text-rpg-danger font-bold hover:text-red-400 ml-1 text-xs"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isWeekly"
                        checked={isWeekly}
                        onChange={(e) => setIsWeekly(e.target.checked)}
                        className="rounded border-gray-700 bg-gray-900 text-rpg-purple focus:ring-rpg-purple"
                      />
                      <label htmlFor="isWeekly" className="text-xs text-gray-400 select-none">
                        Mark as a Weekly Quest
                      </label>
                    </div>

                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setTempSubTasks([]);
                        }}
                        className="px-4 py-2 border border-rpg-border text-gray-400 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="px-4 py-2 bg-rpg-purple text-white font-bold rounded-lg hover:bg-rpg-purple-light"
                      >
                        {formSubmitting ? 'Creating...' : 'Create Quest'}
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}

              {/* Quest Items List */}
              {loadingQuests ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-10 h-10 border-4 border-rpg-purple border-t-transparent rounded-full animate-spin" />
                </div>
              ) : quests.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border border-dashed border-rpg-border/30 rounded-xl">
                  <p className="text-sm">No active quests generated. Click "Roll AI Quests" or manually create one!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Daily Section */}
                  <div>
                    <h4 className="text-xs font-bold text-rpg-purple-light uppercase tracking-wider mb-3">Daily Tasks</h4>
                    {dailyQuests.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No daily quests pending.</p>
                    ) : (
                      <div className="space-y-3">
                        {dailyQuests.map((q) => (
                          <QuestCard
                            key={q._id}
                            quest={q}
                            onToggleComplete={handleToggleComplete}
                            onDelete={handleDeleteQuest}
                            onUpdate={handleUpdateQuest}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Weekly Section */}
                  <div>
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Weekly Tasks</h4>
                    {weeklyQuests.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No weekly quests pending.</p>
                    ) : (
                      <div className="space-y-3">
                        {weeklyQuests.map((q) => (
                          <QuestCard
                            key={q._id}
                            quest={q}
                            onToggleComplete={handleToggleComplete}
                            onDelete={handleDeleteQuest}
                            onUpdate={handleUpdateQuest}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar column (Hero Attributes & Combat Logs & Recommendations) */}
          <div className="space-y-6">
            
            {/* RPG Character Attributes Sheet Card */}
            {user && (
              <div className="glass border border-rpg-border p-6 rounded-2xl bg-rpg-card space-y-4">
                <div className="flex items-center gap-3 border-b border-rpg-border/10 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-rpg-purple/10 border border-rpg-purple/30 flex items-center justify-center text-rpg-purple shadow-purple-glow">
                    <ClassIconComponent className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-none">{user.name}</h3>
                    <span className="text-[10px] text-rpg-gold font-bold uppercase tracking-wider mt-1 block">
                      Level {user.level} {user.characterClass || 'Adventurer'}
                    </span>
                  </div>
                </div>

                {/* Active Buffs (Shield / Potion) */}
                <div className="flex gap-2">
                  <div className={`flex-1 p-2 rounded-lg border flex items-center gap-1.5 text-[10px] font-bold ${
                    user.streakShields > 0 ? 'bg-blue-950/40 border-blue-500/30 text-blue-400' : 'bg-gray-950/20 border-rpg-border/10 text-gray-600'
                  }`}>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Shields: {user.streakShields || 0}</span>
                  </div>
                  <div className={`flex-1 p-2 rounded-lg border flex items-center gap-1.5 text-[10px] font-bold ${
                    user.xpBoostsActive > 0 ? 'bg-purple-950/40 border-rpg-purple/35 text-rpg-purple-light' : 'bg-gray-950/20 border-rpg-border/10 text-gray-600'
                  }`}>
                    <Zap className="w-3.5 h-3.5" />
                    <span>XP Boosts: {user.xpBoostsActive || 0}</span>
                  </div>
                </div>

                {/* Stats Gauges List */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hero Statistics</h4>
                  
                  {/* Loop stats */}
                  {user.stats ? Object.entries(user.stats).map(([stat, val]) => {
                    const maxVal = 100;
                    const percent = Math.min(100, Math.round((val / maxVal) * 100));
                    
                    // Custom colors per stat
                    let barColor = 'bg-rpg-purple';
                    if (stat === 'str') barColor = 'bg-red-500';
                    if (stat === 'int') barColor = 'bg-indigo-500';
                    if (stat === 'wis') barColor = 'bg-cyan-500';
                    if (stat === 'cha') barColor = 'bg-teal-500';
                    if (stat === 'agi') barColor = 'bg-yellow-500';
                    if (stat === 'luk') barColor = 'bg-emerald-500';

                    return (
                      <div key={stat} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold uppercase tracking-wide text-gray-400">{stat}</span>
                          <span className="font-black text-white">{val}</span>
                        </div>
                        <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-rpg-border/20">
                          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-[10px] text-gray-500 italic">Complete onboarding to unlock statistics.</p>
                  )}
                </div>
              </div>
            )}

            {/* Combat Action Console Log Card */}
            {user && (
              <div className="glass border border-rpg-border p-6 rounded-2xl bg-rpg-card space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Terminal className="w-4 h-4 text-rpg-purple-light" /> Action & Combat Log
                </h3>

                <div className="bg-gray-950 border border-rpg-border/20 p-3 rounded-xl h-44 overflow-y-auto font-mono text-[10px] space-y-2.5 scrollbar-thin">
                  {user.combatLogs && user.combatLogs.length > 0 ? (
                    user.combatLogs.slice().reverse().map((log, index) => (
                      <div key={index} className="text-gray-300 leading-normal border-b border-rpg-border/5 pb-1.5 last:border-b-0">
                        <span className="text-rpg-purple-light font-bold">
                          [{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                        </span>{' '}
                        {log.message}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-600 italic text-center pt-10">No action logs found. Complete quests to populate the console log!</div>
                  )}
                </div>
              </div>
            )}

            {/* Recharts Analytics Card */}
            <div className="glass border border-rpg-border p-6 rounded-2xl space-y-6 bg-rpg-card">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-rpg-gold" /> Performance Stats
              </h3>

              {/* Mini Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-950/50 border border-rpg-border/20 p-3 rounded-xl">
                  <span className="text-[10px] text-gray-500 block uppercase">Completion Ratio</span>
                  <span className="text-lg font-black text-white">
                    {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                  </span>
                </div>
                <div className="bg-gray-950/50 border border-rpg-border/20 p-3 rounded-xl">
                  <span className="text-[10px] text-gray-500 block uppercase">Active Count</span>
                  <span className="text-lg font-black text-white">{pendingCount} Quests</span>
                </div>
              </div>

              {/* Charts container */}
              <div className="space-y-6 pt-4 border-t border-rpg-border/20">
                {/* XP curve Line chart */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 mb-2">XP Progression (Last 5 Days)</h4>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={xpHistory}>
                        <XAxis dataKey="day" tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                        <YAxis hide={true} />
                        <Tooltip contentStyle={{ background: '#0a051b', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, fontSize: 10 }} />
                        <Line type="monotone" dataKey="xp" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#fbbf24', strokeWidth: 1 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Completion rate pie chart */}
                <div className="flex items-center justify-between gap-4">
                  <div className="w-24 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={18}
                          outerRadius={30}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 text-xs space-y-1.5">
                    <h4 className="font-bold text-gray-300">Quest Statistics</h4>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <div className="w-2.5 h-2.5 rounded-full bg-rpg-success" />
                      <span>{completedCount} Completed</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <div className="w-2.5 h-2.5 rounded-full bg-rpg-purple" />
                      <span>{pendingCount} Pending</span>
                    </div>
                  </div>
                </div>

                {/* Difficulty distributions bar */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 mb-2">Difficulty Spectrum</h4>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={difficultyDistribution}>
                        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} />
                        <YAxis hide={true} />
                        <Tooltip contentStyle={{ background: '#0a051b', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, fontSize: 10 }} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                          <Cell fill="#10b981" />
                          <Cell fill="#3b82f6" />
                          <Cell fill="#8b5cf6" />
                          <Cell fill="#f59e0b" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations Card */}
            <div className="glass border border-rpg-border p-6 rounded-2xl bg-rpg-card">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rpg-blue-glow" /> AI Growth Library
              </h3>
              {loadingRecs ? (
                <div className="flex justify-center items-center py-6">
                  <div className="w-8 h-8 border-2 border-rpg-purple border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !recommendations || recommendations.resources?.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No recommendations available. Complete onboarding first.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-rpg-blue/10 border border-rpg-blue/20 p-2 rounded-lg text-xs mb-2">
                    <span className="text-gray-400 font-bold">Category:</span>
                    <span className="text-rpg-blue-glow font-black">{recommendations.category}</span>
                  </div>
                  {recommendations.resources.map((res, index) => (
                    <div key={index} className="p-3 rounded-lg bg-gray-950/60 border border-rpg-border/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{res.title}</h4>
                        <span className="text-[9px] font-black uppercase text-rpg-gold px-1.5 py-0.5 rounded bg-rpg-gold/15 border border-rpg-gold/30">
                          {res.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        {res.description}
                      </p>
                      <a
                        href={res.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-rpg-blue-glow hover:underline inline-flex items-center gap-0.5 pt-1"
                      >
                        Explore Resource &rarr;
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badge inventory grid section */}
        {user && <BadgeGrid unlockedBadges={user.badges} />}
      </div>
    </div>
  );
};

export default DashboardPage;
