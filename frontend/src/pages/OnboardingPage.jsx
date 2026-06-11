import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Shield, User, Clock, Brain, Briefcase, Target, ArrowRight, Check, Wand2, Sword, Gem, Users, Sparkles } from 'lucide-react';

const GOAL_OPTIONS = [
  'Coding & Programming',
  'Fitness & Health',
  'Communication & Speaking',
  'Leadership & Management',
  'Grooming & Style',
  'Finance & Investing',
  'Mindfulness & Habits'
];

const RPG_CLASSES = [
  {
    name: 'Mage',
    role: 'Coding & Intellect Focus',
    desc: 'Harnesses logic and syntax to solve complex algorithmic puzzles and craft digital realms.',
    stats: { INT: 15, WIS: 12, LUK: 10, STR: 10, AGI: 10, CHA: 10 },
    icon: Wand2,
    color: 'from-purple-500/10 to-indigo-500/10 border-rpg-purple/40 text-rpg-purple-light shadow-purple-glow'
  },
  {
    name: 'Warrior',
    role: 'Fitness & Physical Grit',
    desc: 'Forges discipline, raw power, and cardiovascular endurance through consistency and weight training.',
    stats: { STR: 15, AGI: 12, LUK: 10, INT: 10, WIS: 10, CHA: 10 },
    icon: Sword,
    color: 'from-red-500/10 to-orange-500/10 border-red-500/30 text-red-400 shadow-gold-glow'
  },
  {
    name: 'Rogue',
    role: 'Career & Finance Builder',
    desc: 'Leverages agility, strategic planning, and career hunting to build wealth and unlock legendary milestones.',
    stats: { AGI: 15, LUK: 12, STR: 10, INT: 10, WIS: 10, CHA: 10 },
    icon: Gem,
    color: 'from-amber-500/10 to-yellow-500/10 border-rpg-gold/40 text-rpg-gold-glow shadow-gold-glow'
  },
  {
    name: 'Cleric',
    role: 'Communication & Leadership',
    desc: 'Bridges social connections, guides team dynamics, and inspires through empathy and public speaking.',
    stats: { CHA: 15, WIS: 12, LUK: 10, STR: 10, INT: 10, AGI: 10 },
    icon: Users,
    color: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400 shadow-blue-glow'
  }
];

const OnboardingPage = () => {
  const { user, onboard, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [dailyTime, setDailyTime] = useState('30 Minutes');
  const [careerGoal, setCareerGoal] = useState('Software Engineer');
  const [personalGoals, setPersonalGoals] = useState([]);
  const [selectedClass, setSelectedClass] = useState('Mage');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleGoal = (goal) => {
    if (personalGoals.includes(goal)) {
      setPersonalGoals(prev => prev.filter(g => g !== goal));
    } else {
      setPersonalGoals(prev => [...prev, goal]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const response = await onboard({
        name,
        skillLevel,
        dailyTime,
        careerGoal,
        personalGoals,
        characterClass: selectedClass
      });

      if (response.success) {
        // Trigger first AI quest generation automatically
        try {
          await api.post('/ai/generate');
        } catch (genErr) {
          console.error('[!] Automatic quest generation failed on onboarding:', genErr);
        }
        await refreshProfile();
        navigate('/dashboard');
      } else {
        setError(response.message || 'Onboarding update failed.');
      }
    } catch (err) {
      setError('Something went wrong during onboarding configuration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-rpg-bg flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-rpg-purple/10 blur-[120px] pointer-events-none" />

      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 my-10">
        <div className="w-full max-w-3xl glass border border-rpg-border p-8 sm:p-10 rounded-2xl shadow-purple-glow">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-[10px] text-rpg-purple-light uppercase tracking-widest font-black bg-rpg-purple/10 border border-rpg-purple/20 px-3 py-1 rounded-full flex items-center gap-1 w-fit mx-auto">
              <Sparkles className="w-3.5 h-3.5" /> Character Customization
            </span>
            <h2 className="text-3xl font-black text-white mt-4 tracking-wide">Configure Your Hero</h2>
            <p className="text-xs text-gray-400 mt-1">Select your class and goals to generate your initial adaptive RPG quest log</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rpg-danger/10 border border-rpg-danger/30 text-rpg-danger text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-rpg-purple-light" /> Hero / Player Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="HeroName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-950/80 border border-rpg-border/50 rounded-xl text-white text-sm focus:border-rpg-purple focus:outline-none focus:shadow-purple-glow transition-all"
                />
              </div>

              {/* Skill level */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-rpg-purple-light" /> Current Experience Tier
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-950/80 border border-rpg-border/50 rounded-xl text-white text-sm focus:border-rpg-purple focus:outline-none focus:shadow-purple-glow transition-all"
                >
                  <option value="Beginner">Beginner (Level 1)</option>
                  <option value="Intermediate">Intermediate (Level 10+)</option>
                  <option value="Expert">Expert (Level 30+)</option>
                </select>
              </div>

              {/* Daily Free time */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rpg-purple-light" /> Daily Commitment
                </label>
                <select
                  value={dailyTime}
                  onChange={(e) => setDailyTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-950/80 border border-rpg-border/50 rounded-xl text-white text-sm focus:border-rpg-purple focus:outline-none focus:shadow-purple-glow transition-all"
                >
                  <option value="15 Minutes">15 Minutes (Casual Quest)</option>
                  <option value="30 Minutes">30 Minutes (Standard Dungeon)</option>
                  <option value="1 Hour">1 Hour (Heroic Raid)</option>
                  <option value="2+ Hours">2+ Hours (Legendary Campaign)</option>
                </select>
              </div>

              {/* Career Goal */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-rpg-purple-light" /> Main Campaign Niche
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Developer, Product Manager"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-950/80 border border-rpg-border/50 rounded-xl text-white text-sm focus:border-rpg-purple focus:outline-none focus:shadow-purple-glow transition-all"
                />
              </div>
            </div>

            {/* RPG Class Selection Card Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-rpg-purple-light" /> Select Character Class (Starting Attributes)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RPG_CLASSES.map((rpgClass) => {
                  const active = selectedClass === rpgClass.name;
                  const Icon = rpgClass.icon;
                  return (
                    <div
                      key={rpgClass.name}
                      onClick={() => setSelectedClass(rpgClass.name)}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 flex flex-col justify-between gap-2 ${
                        active
                          ? `${rpgClass.color} bg-gray-950/80 scale-[1.01] border-opacity-100`
                          : 'bg-gray-950/40 border-rpg-border/30 hover:border-rpg-border/70 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gray-900 border ${active ? 'border-current' : 'border-rpg-border/30'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{rpgClass.name}</h4>
                            {active && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 font-bold uppercase tracking-wider">Active</span>}
                          </div>
                          <span className="text-[10px] text-gray-500 block leading-none mt-0.5">{rpgClass.role}</span>
                          <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">{rpgClass.desc}</p>
                        </div>
                      </div>
                      <div className="border-t border-rpg-border/10 pt-2 flex flex-wrap gap-2 text-[9px] text-gray-400 uppercase font-black tracking-wider">
                        {Object.entries(rpgClass.stats).map(([k, v]) => (
                          <span key={k} className={v > 10 ? 'text-rpg-gold-glow' : 'text-gray-600'}>
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Personal Goals Chips */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-rpg-purple-light" /> Personal Growth Paths (Select Multiple)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {GOAL_OPTIONS.map((goal) => {
                  const selected = personalGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all duration-300 ${
                        selected
                          ? 'bg-gradient-to-r from-rpg-purple to-rpg-blue border-rpg-purple-light text-white shadow-purple-glow scale-105'
                          : 'bg-gray-950 border-rpg-border/50 text-gray-400 hover:text-white hover:border-rpg-purple/40'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {goal}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-rpg-purple via-rpg-purple-dark to-rpg-blue hover:from-rpg-purple-light hover:to-rpg-blue-light text-white text-sm font-black shadow-purple-glow hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 border border-rpg-purple/20 mt-4"
            >
              {submitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Generate My Quests <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <footer className="border-t border-rpg-border/10 bg-gray-950/40 py-6 text-center text-[10px] text-gray-600 relative z-10">
        &copy; {new Date().getFullYear()} RealLife Quest. All rights reserved.
      </footer>
    </div>
  );
};

export default OnboardingPage;
