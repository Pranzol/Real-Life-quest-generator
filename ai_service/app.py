import os
import json
import re
import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

app = FastAPI(title="Real Life Quest Generator AI Service", version="1.0.0")

# Determine device
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[*] AI Service running on: {device.upper()}")

# Global variables for model
model = None
tokenizer = None
generator = None
MODEL_ID = "Qwen/Qwen2.5-0.5B-Instruct"

@app.on_event("startup")
def load_model():
    global model, tokenizer, generator
    try:
        print(f"[*] Loading model {MODEL_ID} on {device}...")
        # Note: torch_dtype=torch.float16 works best on CUDA GPUs
        torch_dtype = torch.float16 if device == "cuda" else torch.float32
        
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            torch_dtype=torch_dtype,
            device_map="auto" if device == "cuda" else None
        )
        if device == "cpu":
            model = model.to("cpu")
            
        generator = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            max_new_tokens=512,
            do_sample=True,
            temperature=0.7,
            top_p=0.9
        )
        print("[*] Model loaded successfully.")
    except Exception as e:
        print(f"[!] Warning: Failed to load Hugging Face model: {str(e)}")
        print("[*] AI Service will run in fallback rule-based mode.")

# Pydantic schemas
class QuestRequest(BaseModel):
    goal: str
    skillLevel: str
    dailyTime: str
    level: int = 1
    streak: int = 0
    completionRate: float = 1.0

class QuestResponseItem(BaseModel):
    title: str
    description: str
    xpReward: int
    difficulty: str

class QuestResponse(BaseModel):
    dailyQuests: List[QuestResponseItem]
    weeklyQuests: List[QuestResponseItem]

class RecommendRequest(BaseModel):
    goal: str

class ResourceItem(BaseModel):
    title: str
    type: str  # Course, Book, Video, Workout, etc.
    description: str
    link: str

class RecommendationResponse(BaseModel):
    category: str
    resources: List[ResourceItem]

def clean_json_string(text: str) -> str:
    """Helper to extract JSON block from markdown code blocks if present."""
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if match:
        return match.group(1).strip()
    return text.strip()

def rule_based_fallback_quests(req: QuestRequest) -> dict:
    """Intelligent template-based quest generation if LLM inference is unavailable/fails."""
    goal_lower = req.goal.lower()
    skill = req.skillLevel.lower()
    time_avail = req.dailyTime.lower()
    
    # Calculate adapted parameters based on level & streak
    difficulty_modifier = "Easy"
    if req.level >= 10:
        difficulty_modifier = "Medium"
    if req.level >= 20:
        difficulty_modifier = "Hard"
        
    # Standard quest bank mapping
    if "fit" in goal_lower or "health" in goal_lower or "gym" in goal_lower:
        d_title = "Perform a 15-minute Home Workout" if "short" in time_avail or "30" in time_avail else "Complete a 45-minute Full Body Workout"
        d_desc = f"Kickstart your fitness routine for your {skill} level. Target core and cardio with bodyweight exercises."
        w_title = "Log 150 Minutes of Moderate Activity"
        w_desc = "Consistently track and complete your physical training sessions throughout the week. Unlock the Fitness Champion badge!"
        xp_d, diff_d = 10, "Easy"
        xp_w, diff_w = 25, "Medium"
    elif "code" in goal_lower or "soft" in goal_lower or "dev" in goal_lower or "program" in goal_lower or "comput" in goal_lower:
        d_title = "Resolve 3 Coding Problems" if "short" in time_avail or "30" in time_avail else "Implement a New Feature in your Side Project"
        d_desc = f"Enhance your programming proficiency ({skill} level). Practice algorithms or write clean components."
        w_title = "Build and Deploy a Mini Project"
        w_desc = "Create a fully functional script or utility, upload it to GitHub, and document it. Earn the Coding Warrior badge!"
        xp_d, diff_d = 25, "Medium"
        xp_w, diff_w = 50, "Hard"
    elif "commun" in goal_lower or "speak" in goal_lower or "lead" in goal_lower:
        d_title = "Practice Mirror Speaking for 10 Minutes"
        d_desc = "Focus on vocal clarity, posture, and pacing. Record your audio and listen back to identify improvements."
        w_title = "Give a 5-Minute Presentation or Speech"
        w_desc = "Deliver a speech to friends, family, or colleagues, or record a video of yourself explaining a technical concept. Focus on confidence."
        xp_d, diff_d = 10, "Easy"
        xp_w, diff_w = 25, "Medium"
    else:
        # Default Quests
        d_title = "Daily Focus Session"
        d_desc = f"Spend 25 minutes of undistracted time working on: '{req.goal}' using the Pomodoro technique."
        w_title = "Weekly Milestone Review"
        w_desc = "Review your progress on your personal growth goals. Plan the objectives for the upcoming week."
        xp_d, diff_d = 10, "Easy"
        xp_w, diff_w = 25, "Medium"

    # Adapt based on streak
    if req.streak > 5:
        # Boost rewards/difficulty slightly for long streaks
        xp_d += 5
        xp_w += 10

    return {
        "dailyQuests": [
            {
                "title": d_title,
                "description": d_desc,
                "xpReward": xp_d,
                "difficulty": diff_d
            }
        ],
        "weeklyQuests": [
            {
                "title": w_title,
                "description": w_desc,
                "xpReward": xp_w,
                "difficulty": diff_w
            }
        ]
    }

def rule_based_fallback_recommendations(goal: str) -> dict:
    """Intelligent template-based recommendations if LLM inference is offline/fails."""
    goal_lower = goal.lower()
    
    if "code" in goal_lower or "soft" in goal_lower or "dev" in goal_lower or "program" in goal_lower:
        return {
            "category": "Coding & Software Engineering",
            "resources": [
                {
                    "title": "freeCodeCamp Responsive Web Design",
                    "type": "Course",
                    "description": "Learn HTML, CSS, UX design, and responsive web practices with interactive coding labs.",
                    "link": "https://www.freecodecamp.org/learn"
                },
                {
                    "title": "Clean Code by Robert C. Martin",
                    "type": "Book",
                    "description": "A handbook of agile software craftsmanship, teaching how to write readable and maintainable code.",
                    "link": "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882"
                },
                {
                    "title": "Traversy Media - Web Development Guide",
                    "type": "Video",
                    "description": "Comprehensive practical roadmap and crash courses for modern full-stack web developers.",
                    "link": "https://www.youtube.com/c/TraversyMedia"
                }
            ]
        }
    elif "fit" in goal_lower or "health" in goal_lower or "gym" in goal_lower:
        return {
            "category": "Fitness & Health",
            "resources": [
                {
                    "title": "Reddit Fitness Wiki - Recommended Routine",
                    "type": "Workout",
                    "description": "A structured, beginner-friendly bodyweight and strength routine designed by fitness experts.",
                    "link": "https://thefitness.wiki/routines/"
                },
                {
                    "title": "Hybrid Calisthenics Routine",
                    "type": "Workout",
                    "description": "An inclusive, step-by-step calisthenics routine that makes fitness accessible to everyone.",
                    "link": "https://www.hybridcalisthenics.com/routine"
                },
                {
                    "title": "Nutrition Facts & Diet Guide - Healthline",
                    "type": "Diet Plan",
                    "description": "Evidence-based articles on healthy eating, macronutrients, and simple meal planning guides.",
                    "link": "https://www.healthline.com/nutrition"
                }
            ]
        }
    elif "commun" in goal_lower or "speak" in goal_lower or "lead" in goal_lower:
        return {
            "category": "Communication & Leadership",
            "resources": [
                {
                    "title": "Toastmasters International",
                    "type": "Organization",
                    "description": "A worldwide network helping millions build public speaking, presentation, and leadership skills.",
                    "link": "https://www.toastmasters.org"
                },
                {
                    "title": "How to Win Friends and Influence People by Dale Carnegie",
                    "type": "Book",
                    "description": "The classic bestseller that teaches core communication skills and interpersonal strategies.",
                    "link": "https://www.amazon.com/How-Win-Friends-Influence-People/dp/0671027034"
                },
                {
                    "title": "The Art of Public Speaking - Ted Talks Channel",
                    "type": "Video",
                    "description": "Curated collection of TED talks teaching body language, voice modulation, and stage presence.",
                    "link": "https://www.youtube.com/playlist?list=PLOGi5-fAu8bEp5Q17q7Jd_7M634z6t-2A"
                }
            ]
        }
    else:
        return {
            "category": "General Personal Development",
            "resources": [
                {
                    "title": "Atomic Habits by James Clear",
                    "type": "Book",
                    "description": "An easy and proven way to build good habits and break bad ones, focusing on 1% improvements.",
                    "link": "https://jamesclear.com/atomic-habits"
                },
                {
                    "title": "Coursera: Learning How to Learn",
                    "type": "Course",
                    "description": "Master mental tools and learning strategies used by experts in art, science, and sports.",
                    "link": "https://www.coursera.org/learn/learning-how-to-learn"
                }
            ]
        }

@app.post("/generate_quests", response_model=QuestResponse)
def generate_quests(req: QuestRequest):
    if generator is None:
        # Fallback to local rule-based engine if HF model is not loaded
        print("[*] Running PyTorch/transformers fallback due to offline generator.")
        return rule_based_fallback_quests(req)

    # Prompt design
    prompt_text = (
        f"You are an AI Quest Generator for a gamified RPG self-improvement app. "
        f"Create customized quests for a user based on the following details:\n"
        f"- Goal: {req.goal}\n"
        f"- Skill Level: {req.skillLevel}\n"
        f"- Daily Free Time: {req.dailyTime}\n"
        f"- User level: {req.level}\n"
        f"- Streak: {req.streak}\n"
        f"- Completion Rate: {req.completionRate * 100:.1f}%\n\n"
        f"Generate exactly one Daily Quest and one Weekly Quest.\n"
        f"Rules:\n"
        f"1. Daily Quest difficulty should be 'Easy' (10 XP) or 'Medium' (25 XP) based on daily free time and skill level.\n"
        f"2. Weekly Quest difficulty should be 'Medium' (25 XP) or 'Hard' (50 XP) based on current level and skill.\n"
        f"3. Return the response ONLY as a valid JSON object in this format:\n"
        f'{{"dailyQuests": [{{"title": "...", "description": "...", "xpReward": 10, "difficulty": "Easy"}}], '
        f'"weeklyQuests": [{{"title": "...", "description": "...", "xpReward": 25, "difficulty": "Medium"}}]}}\n'
        f"Do not write any introductory or concluding text."
    )

    try:
        messages = [{"role": "user", "content": prompt_text}]
        response = generator(messages)
        content = response[0]["generated_text"][-1]["content"]
        
        cleaned = clean_json_string(content)
        result = json.loads(cleaned)
        
        # Verify fields are correct
        for q in result.get("dailyQuests", []):
            if "xpReward" not in q or "difficulty" not in q:
                q["xpReward"] = 10
                q["difficulty"] = "Easy"
        for q in result.get("weeklyQuests", []):
            if "xpReward" not in q or "difficulty" not in q:
                q["xpReward"] = 25
                q["difficulty"] = "Medium"
                
        return result
    except Exception as e:
        print(f"[!] Error in LLM quest generation: {str(e)}. Falling back.")
        return rule_based_fallback_quests(req)

@app.post("/recommend_resources", response_model=RecommendationResponse)
def recommend_resources(req: RecommendRequest):
    if generator is None:
        print("[*] Running recommendations fallback.")
        return rule_based_fallback_recommendations(req.goal)

    prompt_text = (
        f"You are an AI Resource Advisor for an RPG self-improvement app. "
        f"Provide 3 high-quality study/training resources (courses, books, videos, or tools) for: '{req.goal}'.\n"
        f"Return the response ONLY as a valid JSON object in this format:\n"
        f'{{"category": "Category Name", "resources": ['
        f'{{"title": "Resource Title", "type": "Course/Book/Video", "description": "Short description...", "link": "https://example.com"}}]}}\n'
        f"Do not write any introductory or concluding text."
    )

    try:
        messages = [{"role": "user", "content": prompt_text}]
        response = generator(messages)
        content = response[0]["generated_text"][-1]["content"]
        
        cleaned = clean_json_string(content)
        result = json.loads(cleaned)
        return result
    except Exception as e:
        print(f"[!] Error in LLM recommendation generation: {str(e)}. Falling back.")
        return rule_based_fallback_recommendations(req.goal)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
