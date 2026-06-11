import axios from 'axios';

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000';

/**
 * Fallback JS-based Quest Generator in case Python service is down
 */
function generateFallbackQuests(goal, skillLevel, dailyTime, userLevel, streak, completionRate) {
  const goalLower = goal.toLowerCase();
  const skill = skillLevel.toLowerCase();
  const time = dailyTime.toLowerCase();

  // Basic difficulty calculation
  let dailyDifficulty = 'Easy';
  let dailyXp = 10;
  let weeklyDifficulty = 'Medium';
  let weeklyXp = 25;

  // Adapt difficulty based on level
  if (userLevel >= 15) {
    dailyDifficulty = 'Medium';
    dailyXp = 25;
    weeklyDifficulty = 'Hard';
    weeklyXp = 50;
  } else if (userLevel >= 5 && (skill.includes('intermediate') || skill.includes('expert'))) {
    dailyDifficulty = 'Medium';
    dailyXp = 25;
  }

  // Adjust rewards slightly based on streaks/performance
  if (streak >= 5) {
    dailyXp += 5;
    weeklyXp += 10;
  }

  let dailyQuests = [];
  let weeklyQuests = [];

  // Goal mapping
  if (goalLower.includes('code') || goalLower.includes('dev') || goalLower.includes('program') || goalLower.includes('tech') || goalLower.includes('web')) {
    dailyQuests = [
      {
        title: dailyDifficulty === 'Easy' ? 'Solve 2 LeetCode Easy Problems' : 'Implement custom authentication middleware',
        description: `Improve your programming skills in relation to: ${goal}. Focus on code efficiency and comments.`,
        difficulty: dailyDifficulty,
        xpReward: dailyXp
      }
    ];
    weeklyQuests = [
      {
        title: weeklyDifficulty === 'Medium' ? 'Refactor a legacy repository codebase' : 'Build and deploy a full-stack CRUD application',
        description: `Weekly milestones targeting: ${goal}. Share your repository on GitHub and write a clear README.`,
        difficulty: weeklyDifficulty,
        xpReward: weeklyXp
      }
    ];
  } else if (goalLower.includes('fit') || goalLower.includes('gym') || goalLower.includes('health') || goalLower.includes('run')) {
    dailyQuests = [
      {
        title: dailyDifficulty === 'Easy' ? 'Complete a 15-minute HIIT workout' : 'Perform a 45-minute strength training routine',
        description: `Maintain consistency in your physical training. Keep dynamic stretching and hydration in mind.`,
        difficulty: dailyDifficulty,
        xpReward: dailyXp
      }
    ];
    weeklyQuests = [
      {
        title: weeklyDifficulty === 'Medium' ? 'Log a total of 10,000 steps daily or run 5K' : 'Execute 3 intense cardio and strength workouts this week',
        description: `Build endurance and muscle. Track your active minutes and log them on your dashboard.`,
        difficulty: weeklyDifficulty,
        xpReward: weeklyXp
      }
    ];
  } else if (goalLower.includes('speak') || goalLower.includes('commun') || goalLower.includes('talk') || goalLower.includes('lead')) {
    dailyQuests = [
      {
        title: dailyDifficulty === 'Easy' ? 'Record a 2-minute video diary entry' : 'Deliver a 5-minute impromtu pitch on a select topic',
        description: `Enhance articulation, reduce filler words, and polish vocal pacing.`,
        difficulty: dailyDifficulty,
        xpReward: dailyXp
      }
    ];
    weeklyQuests = [
      {
        title: weeklyDifficulty === 'Medium' ? 'Read 3 articles on leadership strategy' : 'Participate in a public presentation or online forum discussion',
        description: `Overcome stage anxiety and structure your arguments with an engaging hook, body, and conclusion.`,
        difficulty: weeklyDifficulty,
        xpReward: weeklyXp
      }
    ];
  } else {
    // Default categories
    dailyQuests = [
      {
        title: `Deep focus session on: ${goal}`,
        description: `Dedicate 30 minutes of uninterrupted study using the Pomodoro method to level up your skillset.`,
        difficulty: dailyDifficulty,
        xpReward: dailyXp
      }
    ];
    weeklyQuests = [
      {
        title: `Establish a weekly milestones plan`,
        description: `Outline key deliverables and document achievements. Review previous week's learning progress.`,
        difficulty: weeklyDifficulty,
        xpReward: weeklyXp
      }
    ];
  }

  return { dailyQuests, weeklyQuests };
}

/**
 * Fallback JS-based Resource Recommender
 */
function getFallbackRecommendations(goal) {
  const goalLower = goal.toLowerCase();
  
  if (goalLower.includes('code') || goalLower.includes('dev') || goalLower.includes('program') || goalLower.includes('tech')) {
    return {
      category: 'Coding & Software Engineering',
      resources: [
        { title: 'freeCodeCamp Full Stack Curriculum', type: 'Course', description: 'Comprehensive tutorials on web development.', link: 'https://www.freecodecamp.org' },
        { title: 'Eloquent JavaScript', type: 'Book', description: 'Deep dive into modern JS features and patterns.', link: 'https://eloquentjavascript.net/' },
        { title: 'Web Dev Simplified YouTube Channel', type: 'Video', description: 'Quick, practical video tutorials for all web tech.', link: 'https://www.youtube.com/@WebDevSimplified' }
      ]
    };
  } else if (goalLower.includes('fit') || goalLower.includes('gym') || goalLower.includes('health') || goalLower.includes('run')) {
    return {
      category: 'Fitness & Health',
      resources: [
        { title: 'Athlean-X Training Guides', type: 'Workout', description: 'Science-backed workout programs and routines.', link: 'https://athleanx.com' },
        { title: 'The Fitness Wiki', type: 'Book', description: 'Comprehensive guide to weight loss, muscle gain, and diet.', link: 'https://thefitness.wiki' },
        { title: 'Hybrid Calisthenics Routine', type: 'Workout', description: 'Simple progressive bodyweight training exercises.', link: 'https://www.hybridcalisthenics.com' }
      ]
    };
  } else if (goalLower.includes('speak') || goalLower.includes('commun') || goalLower.includes('talk') || goalLower.includes('lead')) {
    return {
      category: 'Communication & Leadership',
      resources: [
        { title: 'Toastmasters Speech Training', type: 'Course', description: 'Learn public speaking in a friendly club environment.', link: 'https://www.toastmasters.org' },
        { title: 'Crucial Conversations', type: 'Book', description: 'Tools for talking when stakes are high and opinions differ.', link: 'https://www.amazon.com/Crucial-Conversations-Talking-Stakes-Second/dp/0071771322' },
        { title: 'TED Talk: Body Language Shapes Who You Are', type: 'Video', description: 'Amy Cuddy explains how power posing builds confidence.', link: 'https://www.ted.com/talks/amy_cuddy_your_body_language_may_shape_who_you_are' }
      ]
    };
  } else {
    return {
      category: 'General Growth',
      resources: [
        { title: 'Atomic Habits by James Clear', type: 'Book', description: 'Learn how to build 1% better habits daily.', link: 'https://jamesclear.com/atomic-habits' },
        { title: 'Learning How to Learn (Coursera)', type: 'Course', description: 'Discover learning hacks used by world-class experts.', link: 'https://www.coursera.org/learn/learning-how-to-learn' }
      ]
    };
  }
}

/**
 * Call Python FastAPI service, falling back to rule-based engine on error or connection failure
 */
export const fetchAIQuests = async (goal, skillLevel, dailyTime, level, streak, completionRate) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/generate_quests`, {
      goal,
      skillLevel,
      dailyTime,
      level,
      streak,
      completionRate
    }, { timeout: 3000 }); // 3 second timeout for quick fallback
    
    return response.data;
  } catch (error) {
    console.log('[*] AI Service offline or timed out. Utilizing local fallback quest generator.');
    return generateFallbackQuests(goal, skillLevel, dailyTime, level, streak, completionRate);
  }
};

export const fetchAIRecommendations = async (goal) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/recommend_resources`, {
      goal
    }, { timeout: 3000 });
    
    return response.data;
  } catch (error) {
    console.log('[*] AI Service offline. Utilizing local fallback resource recommender.');
    return getFallbackRecommendations(goal);
  }
};
