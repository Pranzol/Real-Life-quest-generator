import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Shield, Sparkles, Trophy, Target, Flame, ArrowRight, Star, CheckCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = () => {
  // States for the interactive mock dashboard
  const [mockUser, setMockUser] = useState({
    name: 'Hero Player',
    level: 3,
    xp: 260,
    streak: 4
  });
  const [mockQuests, setMockQuests] = useState([
    { id: 1, title: 'Learn React State Management', xp: 25, difficulty: 'Medium', completed: false },
    { id: 2, title: 'Drink 3L of Water & Track hydration', xp: 10, difficulty: 'Easy', completed: false },
    { id: 3, title: 'Read 1 Chapter of Clean Code', xp: 15, difficulty: 'Easy', completed: false }
  ]);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Complete mock quest logic
  const handleToggleMockQuest = (questId) => {
    setMockQuests(prev => prev.map(q => {
      if (q.id === questId) {
        const nextCompleted = !q.completed;
        const xpDiff = nextCompleted ? q.xp : -q.xp;
        
        // Update user XP
        setMockUser(u => {
          const newXp = Math.max(0, u.xp + xpDiff);
          const newLevel = Math.floor(newXp / 100) + 1;
          const levelUp = newLevel > u.level;
          
          if (levelUp) {
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 3000);
          }

          return {
            ...u,
            xp: newXp,
            level: newLevel,
            streak: nextCompleted ? u.streak + 1 : Math.max(0, u.streak - 1)
          };
        });

        return { ...q, completed: nextCompleted };
      }
      return q;
    }));
  };

  return (
    <div className="min-h-screen bg-rpg-bg relative overflow-hidden">
      {/* Background glow meshes */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-rpg-purple/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rpg-blue/15 blur-[120px] pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rpg-purple/10 border border-rpg-purple/30 text-rpg-purple-light mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Gamified Growth Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]"
          >
            Turn Your Life Into An{' '}
            <span className="bg-gradient-to-r from-rpg-purple-glow via-rpg-blue-glow to-rpg-gold-glow bg-clip-text text-transparent">
              RPG Adventure
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            AI-generated quests, XP rewards, streaks, achievements, and personalized growth powered by NVIDIA GPU acceleration. Level up your career, health, and productivity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4"
          >
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-rpg-purple to-rpg-blue hover:from-rpg-purple-light hover:to-rpg-blue-light text-white font-bold shadow-purple-glow flex items-center gap-2 hover:scale-105 transition-all duration-300"
            >
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#live-preview"
              className="px-8 py-4 rounded-xl bg-rpg-card hover:bg-rpg-purple/10 text-white font-bold border border-rpg-border hover:border-rpg-purple/40 transition-all duration-300"
            >
              Interactive Demo
            </a>
          </motion.div>
        </div>

        {/* Hero Interactive preview cards */}
        <div className="flex-1 w-full max-w-md lg:max-w-none relative">
          <div className="absolute inset-0 bg-gradient-to-r from-rpg-purple to-rpg-blue rounded-3xl blur-[40px] opacity-25" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass border border-rpg-border p-6 rounded-2xl relative z-10 shadow-2xl"
          >
            {/* Level bar card */}
            <div className="flex items-center gap-3 mb-6 bg-rpg-purple/10 border border-rpg-purple/20 p-4 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-rpg-purple flex items-center justify-center font-bold text-lg text-white">
                5
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-gray-300">Warrior Rank</span>
                  <span className="text-rpg-gold">450 / 500 XP</span>
                </div>
                <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                  <div className="w-[90%] h-full bg-gradient-to-r from-rpg-purple to-rpg-blue rounded-full" />
                </div>
              </div>
            </div>

            {/* Floating quest cards */}
            <div className="space-y-3">
              <div className="glass border border-rpg-border p-3.5 rounded-xl flex items-center justify-between hover:border-rpg-purple-light/50 transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-rpg-purple-light" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Build a Full-Stack Web App</h4>
                    <p className="text-[10px] text-gray-400">Epic Boss Quest</p>
                  </div>
                </div>
                <span className="text-xs font-black text-rpg-gold flex items-center gap-0.5">
                  <Zap className="w-3 h-3 fill-rpg-gold" /> +100 XP
                </span>
              </div>
              
              <div className="glass border border-rpg-border p-3.5 rounded-xl flex items-center justify-between opacity-80">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border border-gray-500" />
                  <div>
                    <h4 className="text-sm font-bold text-white">HIIT Fitness Training</h4>
                    <p className="text-[10px] text-gray-400">Daily Quest</p>
                  </div>
                </div>
                <span className="text-xs font-black text-rpg-gold flex items-center gap-0.5">
                  <Zap className="w-3 h-3 fill-rpg-gold" /> +10 XP
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-rpg-border/20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Awesome Features</h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">Everything you need to turn your goals into manageable missions and claim your self-growth rewards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="glass border border-rpg-border/50 p-6 rounded-2xl glass-hover">
            <div className="w-12 h-12 rounded-xl bg-rpg-purple/10 border border-rpg-purple/30 flex items-center justify-center text-rpg-purple mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Quest Generation</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Personalized daily and weekly challenges generated by Hugging Face language models using local PyTorch CUDA GPU acceleration.</p>
          </div>

          <div className="glass border border-rpg-border/50 p-6 rounded-2xl glass-hover">
            <div className="w-12 h-12 rounded-xl bg-rpg-gold/10 border border-rpg-gold/30 flex items-center justify-center text-rpg-gold mb-5">
              <Zap className="w-6 h-6 fill-rpg-gold/10" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">XP & Level Up Systems</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Earn 10, 25, 50, or 100 XP per mission. Reaching every 100 XP levels up your hero character and increases your standing rank.</p>
          </div>

          <div className="glass border border-rpg-border/50 p-6 rounded-2xl glass-hover">
            <div className="w-12 h-12 rounded-xl bg-rpg-blue/10 border border-rpg-blue/30 flex items-center justify-center text-rpg-blue mb-5">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Badges & Achievements</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Unlock cool achievements automatically such as Coding Warrior, Fitness Champion, Consistency King, and Leadership Hero.</p>
          </div>

          <div className="glass border border-rpg-border/50 p-6 rounded-2xl glass-hover">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Progress Analytics</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Beautiful dashboard graphs mapping your XP growth trends, quest completion ratios, and category allocation using Recharts.</p>
          </div>

          <div className="glass border border-rpg-border/50 p-6 rounded-2xl glass-hover">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Resource Recommendations</h3>
            <p className="text-sm text-gray-400 leading-relaxed">AI recomends courses, books, and workouts tailored specifically to the goals you are trying to complete.</p>
          </div>

          <div className="glass border border-rpg-border/50 p-6 rounded-2xl glass-hover">
            <div className="w-12 h-12 rounded-xl bg-rpg-gold/10 border border-rpg-gold/30 flex items-center justify-center text-rpg-gold mb-5">
              <Trophy className="w-6 h-6 fill-rpg-gold/10" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Global Leaderboards</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Compete with friends and developers globally. Rise through the rankings based on total XP, level, and consistency streaks.</p>
          </div>
        </div>
      </section>

      {/* How It Works (Timeline) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-rpg-border/20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How It Works</h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">Scaffold your personal progression loop in 4 simple stages.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-rpg-purple/10 border border-rpg-purple/30 flex items-center justify-center text-rpg-purple-light font-black text-xl mb-4 shadow-purple-glow">
              1
            </div>
            <h3 className="text-base font-bold text-white mb-2">Choose Goals</h3>
            <p className="text-xs text-gray-400 max-w-xs">Indicate your skill levels, personal goals, and daily time constraints.</p>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-rpg-blue/10 border border-rpg-blue/30 flex items-center justify-center text-rpg-blue-light font-black text-xl mb-4 shadow-blue-glow">
              2
            </div>
            <h3 className="text-base font-bold text-white mb-2">Receive AI Quests</h3>
            <p className="text-xs text-gray-400 max-w-xs">Our backend uses LLM inference on GPU to draft tailored, adaptive quests.</p>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-xl mb-4 shadow-blue-glow">
              3
            </div>
            <h3 className="text-base font-bold text-white mb-2">Complete Missions</h3>
            <p className="text-xs text-gray-400 max-w-xs">Complete your tasks throughout the day and toggle them on your control center.</p>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-rpg-gold/10 border border-rpg-gold/30 flex items-center justify-center text-rpg-gold font-black text-xl mb-4 shadow-gold-glow">
              4
            </div>
            <h3 className="text-base font-bold text-white mb-2">Earn XP & Level Up</h3>
            <p className="text-xs text-gray-400 max-w-xs">Gain level tiers, unlock badges, build daily streaks, and rise in the leaderboard.</p>
          </div>
        </div>
      </section>

      {/* Interactive Mock Dashboard Preview */}
      <section id="live-preview" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-rpg-border/20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-rpg-gold uppercase tracking-widest bg-rpg-gold/10 border border-rpg-gold/30 px-3 py-1 rounded-full">
            Try the Interactive Demo
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-4">Live Dashboard Preview</h2>
          <p className="mt-3 text-sm text-gray-400">Complete quests in the card list below to watch your XP grow and trigger level-ups!</p>
        </div>

        {/* Mock Dashboard Card */}
        <div className="glass border border-rpg-purple/30 p-6 rounded-2xl shadow-purple-glow relative">
          <AnimatePresence>
            {showLevelUp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-rpg-bg/95 rounded-2xl border-2 border-rpg-gold shadow-gold-glow"
              >
                <Trophy className="w-16 h-16 text-rpg-gold fill-rpg-gold animate-bounce mb-3" />
                <h3 className="text-3xl font-black text-rpg-gold text-glow-gold">LEVEL UP!</h3>
                <p className="text-sm text-gray-300 mt-1">You reached Level {mockUser.level}!</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* XP Bar Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-rpg-purple flex items-center justify-center text-lg font-black text-white border border-rpg-purple-glow">
                {mockUser.level}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{mockUser.name}</h3>
                <p className="text-xs text-gray-400">Total XP: <span className="text-rpg-gold font-bold">{mockUser.xp}</span></p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rpg-gold/10 border border-rpg-gold/20 text-rpg-gold text-xs font-bold">
              <Flame className="w-4 h-4 fill-rpg-gold" /> {mockUser.streak} Day Streak
            </div>
          </div>

          {/* XP progress bar */}
          <div className="w-full h-3 bg-gray-950 rounded-full border border-rpg-border/30 overflow-hidden mb-6">
            <div 
              className="h-full bg-gradient-to-r from-rpg-purple to-rpg-blue transition-all duration-500" 
              style={{ width: `${mockUser.xp % 100}%` }}
            />
          </div>

          {/* Quest list */}
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Active Quests</h4>
          <div className="space-y-3">
            {mockQuests.map((quest) => (
              <div
                key={quest.id}
                onClick={() => handleToggleMockQuest(quest.id)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300 ${
                  quest.completed 
                    ? 'border-rpg-success/30 bg-rpg-success/5 opacity-60' 
                    : 'border-rpg-border/50 bg-rpg-card hover:border-rpg-purple/40 hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    quest.completed ? 'border-rpg-success bg-rpg-success text-white' : 'border-gray-500'
                  }`}>
                    {quest.completed && <CheckCircle className="w-3.5 h-3.5 fill-current" />}
                  </div>
                  <div>
                    <h5 className={`text-sm font-bold ${quest.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                      {quest.title}
                    </h5>
                    <span className="text-[9px] px-1.5 py-0.5 rounded border border-gray-700 bg-gray-900 text-gray-400 mt-1 inline-block">
                      {quest.difficulty}
                    </span>
                  </div>
                </div>
                
                <span className={`text-xs font-black flex items-center gap-0.5 ${quest.completed ? 'text-gray-500' : 'text-rpg-gold'}`}>
                  <Zap className="w-3.5 h-3.5 fill-current" /> +{quest.xp} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 text-center border-t border-rpg-border/20">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready To Level Up Your Real Life?</h2>
        <p className="mt-4 text-gray-400 max-w-lg mx-auto">Join thousands of players transforming their daily goals into RPG quest achievements. Start questing today.</p>
        <div className="mt-10">
          <Link
            to="/register"
            className="px-10 py-5 rounded-xl bg-gradient-to-r from-rpg-purple via-rpg-purple-dark to-rpg-blue hover:from-rpg-purple-light hover:to-rpg-blue-light text-white font-black text-lg shadow-purple-glow hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 border border-rpg-purple/30"
          >
            Start Questing <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rpg-border/20 bg-gray-950/80 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-rpg-purple" />
            <span className="font-bold text-gray-200">RealLife Quest Generator</span>
          </div>
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} RealLife Quest. Built with React, Node.js, and Hugging Face. Powered by NVIDIA CUDA.
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
