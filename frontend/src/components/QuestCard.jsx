import React from 'react';
import { Shield, CheckCircle2, Circle, Trash2, Zap, Trophy, Lock, CheckSquare, Square } from 'lucide-react';
import { motion } from 'framer-motion';

const QuestCard = ({ quest, onToggleComplete, onDelete, onUpdate }) => {
  const getDifficultyStyles = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'Medium':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Hard':
        return 'bg-rpg-purple/15 text-rpg-purple-light border-rpg-purple/40';
      case 'Boss':
        return 'bg-rpg-gold/15 text-rpg-gold-light border-rpg-gold/40 text-glow-gold font-bold';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Coding': return 'text-purple-400 border-purple-500/20 bg-purple-500/5';
      case 'Fitness': return 'text-red-400 border-red-500/20 bg-red-500/5';
      case 'Communication': return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
      case 'Career': return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
      case 'Finance': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5';
      case 'Mindfulness': return 'text-teal-400 border-teal-500/20 bg-teal-500/5';
      default: return 'text-gray-400 border-gray-500/20 bg-gray-500/5';
    }
  };

  // Sub-tasks calculations
  const totalSubTasks = quest.subTasks?.length || 0;
  const completedSubTasks = quest.subTasks?.filter(st => st.completed).length || 0;
  const isLocked = totalSubTasks > 0 && completedSubTasks < totalSubTasks;
  const subTaskPercent = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;

  const handleSubTaskToggle = (subIndex) => {
    if (!onUpdate) return;
    const updatedSubTasks = quest.subTasks.map((st, idx) => 
      idx === subIndex ? { ...st, completed: !st.completed } : st
    );
    onUpdate(quest._id, { subTasks: updatedSubTasks });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className={`glass border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
        quest.completed 
          ? 'border-rpg-success/30 bg-rpg-success/5 opacity-70' 
          : 'border-rpg-border/50 bg-rpg-card hover:border-rpg-purple/40'
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Completion Checkbox */}
        <button
          disabled={isLocked && !quest.completed}
          onClick={() => onToggleComplete(quest._id, quest.completed)}
          className={`mt-1 flex-shrink-0 transition-colors duration-200 ${
            quest.completed 
              ? 'text-rpg-success' 
              : isLocked 
              ? 'text-gray-600 cursor-not-allowed' 
              : 'text-gray-500 hover:text-rpg-purple-light'
          }`}
          title={isLocked ? 'Complete all sub-tasks first!' : 'Toggle Completion'}
        >
          {quest.completed ? (
            <CheckCircle2 className="w-6 h-6 fill-rpg-success/15" />
          ) : isLocked ? (
            <Lock className="w-6 h-6 text-gray-600" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>

        {/* Text details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className={`font-bold text-base tracking-wide truncate ${
              quest.completed ? 'line-through text-gray-500' : 'text-white'
            }`}>
              {quest.title}
            </h3>
            
            {/* Category tag */}
            {quest.category && (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(quest.category)}`}>
                {quest.category}
              </span>
            )}

            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getDifficultyStyles(quest.difficulty)}`}>
              {quest.difficulty}
            </span>
            {quest.isWeekly && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                Weekly
              </span>
            )}
            {quest.isBoss && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-rpg-gold/30 bg-rpg-gold/10 text-rpg-gold flex items-center gap-0.5">
                <Trophy className="w-3 h-3 fill-rpg-gold" /> Boss Challenge
              </span>
            )}
          </div>
          
          <p className={`text-xs ${quest.completed ? 'text-gray-500' : 'text-gray-400'}`}>
            {quest.description}
          </p>

          {/* Sub-tasks checklist rendering */}
          {totalSubTasks > 0 && (
            <div className="mt-3 space-y-2 pt-2 border-t border-rpg-border/10">
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span className="font-bold uppercase tracking-wider">Sub-Tasks Checklist</span>
                <span>{completedSubTasks}/{totalSubTasks} Completed ({subTaskPercent}%)</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-rpg-border/20">
                <div
                  className="bg-gradient-to-r from-rpg-purple to-rpg-blue h-full transition-all duration-300"
                  style={{ width: `${subTaskPercent}%` }}
                />
              </div>

              {/* Individual sub-task lines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5">
                {quest.subTasks.map((sub, idx) => (
                  <div
                    key={idx}
                    onClick={() => !quest.completed && handleSubTaskToggle(idx)}
                    className={`flex items-center gap-2 text-xs cursor-pointer p-1.5 rounded-lg border transition-all ${
                      sub.completed
                        ? 'border-rpg-success/20 bg-rpg-success/5 text-gray-400 line-through'
                        : quest.completed
                        ? 'border-transparent text-gray-600'
                        : 'border-rpg-border/30 hover:border-rpg-purple/30 bg-gray-950/20 text-gray-300 hover:text-white'
                    }`}
                  >
                    {sub.completed ? (
                      <CheckSquare className="w-4 h-4 text-rpg-success flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                    <span className="truncate">{sub.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rewards and Delete */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 border-rpg-border/10 pt-3 sm:pt-0">
        <div className="text-left sm:text-right flex-shrink-0">
          <span className="text-[10px] text-gray-500 block leading-none">REWARD</span>
          <span className={`text-sm font-black flex items-center gap-0.5 mt-0.5 ${
            quest.completed ? 'text-gray-500' : 'text-rpg-gold'
          }`}>
            <Zap className="w-3.5 h-3.5 fill-current" /> +{quest.xpReward} XP
          </span>
        </div>

        <button
          onClick={() => onDelete(quest._id)}
          className="p-2 rounded-lg bg-rpg-danger/5 hover:bg-rpg-danger/15 border border-transparent hover:border-rpg-danger/30 text-gray-500 hover:text-rpg-danger transition-all duration-300"
          title="Delete Quest"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default QuestCard;
