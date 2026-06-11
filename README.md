# RealLife Quest Generator

RealLife Quest Generator is a production-ready, full-stack, gamified personal growth platform that converts real-world goals into RPG-style quests. It features an Express Node.js backend, a glassmorphic React.js frontend, and a Python-based AI service utilizing PyTorch and Hugging Face Transformers with NVIDIA CUDA GPU acceleration for adaptive quest generation.

---

## Folder Structure

```
RealLife Quest Generator/
├── backend/                 # Node.js + Express + Mongoose API server
│   ├── src/
│   │   ├── config/          # Configurations
│   │   ├── controllers/     # Controller layer (auth, quests, badges, leaderboard)
│   │   ├── middleware/      # JWT auth, admin authorization, and global errors
│   │   ├── models/          # MongoDB Schemas (User, Quest, Badge, Leaderboard)
│   │   ├── routes/          # Express route declarations
│   │   └── services/        # AI client and local fallback services
│   ├── .env                 # Port and Database credentials
│   ├── package.json         # Node packages
│   └── server.js            # Node entry point
├── ai_service/              # FastAPI + PyTorch CUDA model inference microservice
│   ├── app.py               # API handlers loading Qwen2.5-0.5B-Instruct
│   ├── test_cuda.py         # CUDA & PyTorch GPU validation script
│   └── requirements.txt     # Python package requirements
└── frontend/                # Vite + React + Tailwind CSS client
    ├── src/
    │   ├── components/      # Reusable widgets (Navbar, QuestCard, XPBar, BadgeGrid)
    │   ├── context/         # React Auth context provider
    │   ├── pages/           # Landing, Login, Register, Onboarding, Dashboard, Boss, Leaderboard, Admin
    │   ├── utils/           # Axios custom client instance
    │   ├── App.jsx          # Route controls and Guards
    │   └── index.css        # Global CSS + Tailwind base
    ├── tailwind.config.js   # Tailwind custom theme config
    ├── postcss.config.js    # PostCSS settings
    └── package.json         # React packages
```

---

## Tech Stack & System Requirements

- **Frontend**: React.js (Vite), Tailwind CSS, React Router, Axios, Recharts, Framer Motion
- **Backend**: Node.js, Express.js, JWT Authentication, Mongoose
- **Database**: MongoDB Atlas (or local MongoDB database)
- **AI Layer**: FastAPI, Hugging Face Transformers (`Qwen/Qwen2.5-0.5B-Instruct`), PyTorch CUDA GPU support
- **System Requirements**: 
  - Node.js (v18+)
  - Python (v3.9+)
  - NVIDIA CUDA-capable GPU (e.g. GeForce RTX 2050 with 4GB VRAM) for local GPU acceleration.

---

## Getting Started

### 1. Database Configuration
Ensure a local MongoDB instance is running, or obtain a MongoDB Atlas connection string. Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/real_life_quest_generator
JWT_SECRET=quest_secret_key
PYTHON_AI_URL=http://127.0.0.1:8000
```

### 2. Run Python AI Service (FastAPI)
1. Navigate to the `ai_service` directory.
2. Build a python virtual environment (recommended):
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Check if your CUDA drivers are enabled:
   ```bash
   python test_cuda.py
   ```
4. Install PyTorch with CUDA (e.g. for CUDA 12.1):
   ```bash
   pip install torch --index-url https://download.pytorch.org/whl/cu121
   ```
5. Install the remaining requirements:
   ```bash
   pip install -r requirements.txt
   ```
6. Start the FastAPI microservice:
   ```bash
   python app.py
   ```
   *Note: If the Python environment is not configured, the Node backend will automatically fallback to its intelligent template-based generator to keep the application 100% functional.*

### 3. Run Backend (Node.js Express)
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed badges & start server:
   ```bash
   npm run dev
   ```
   *(Running on `http://localhost:5000`)*

### 4. Run Frontend (React Vite)
1. Navigate to the `frontend` directory.
2. Install dependencies (with legacy peer deps to allow React 19 compliance):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Run the client application:
   ```bash
   npm run dev
   ```
   *(Running on `http://localhost:5173`)*

---

## API Endpoint Reference

### Authentication (`/api/auth`)
- `POST /auth/register`: Create a new user. Returns JWT.
- `POST /auth/login`: Validate credentials and login. Returns JWT.
- `GET /auth/me` (Protected): Get active profile details.
- `POST /auth/onboard` (Protected): Configure character name and goals.

### Quests (`/api/quests`)
- `GET /quests` (Protected): List all quests.
- `POST /quests` (Protected): Create manual quest.
- `PUT /quests/:id` (Protected): Complete / Edit quest. Completing updates User XP, Level, Streaks and checks badges.
- `DELETE /quests/:id` (Protected): Delete quest.

### AI Layer (`/api/ai` & `/api/recommendations`)
- `POST /ai/generate` (Protected): Connects to FastAPI `/generate_quests` to dynamically output adapted quests based on user level, goals, daily free time, and success rate.
- `GET /recommendations` (Protected): Returns recommended books, courses, videos, or workouts tailored to the user's goals.

### Leaderboard (`/api/leaderboard`)
- `GET /leaderboard` (Protected): Fetches global rankings sorted by level, total XP, and streak.

### Admin Moderation (`/api/admin`)
- `GET /admin/users` (Protected, Admin): Lists all signed-up accounts.
- `DELETE /admin/users/:id` (Protected, Admin): Deletes a user profile and all their associated data.
- `GET /admin/analytics` (Protected, Admin): Returns aggregate stats (signups, completion rates, average XP, badge distribution).

---

## Core Systems & Rules

### XP & Levels
- **Quest Completion**:
  - Easy = 10 XP
  - Medium = 25 XP
  - Hard = 50 XP
  - Boss Quest = 100 XP
- **Leveling**: Every 100 XP accumulated increments your character Level by +1.
- **Ranks**:
  - Level 1-9: `Beginner`
  - Level 10-19: `Explorer`
  - Level 20-29: `Warrior`
  - Level 30-49: `Professional`
  - Level 50+: `Legend`

### Streak System
Completing a quest updates your daily completion status. If you clear tasks on consecutive days, your streak increment is maintained. If a day is missed, the streak resets to 1.

### Badges & Achievements
Earn awards automatically upon satisfying goals:
- **Coding Warrior**: Clear programming quests.
- **Fitness Champion**: Clear physical fitness/HIIT/gym tasks.
- **Internship Hunter**: Clear career preparation, resume, or internship application quests.
- **Leadership Hero**: Clear communication, speeches or group presenting tasks.
- **Consistency King**: Maintain a quest completion streak of 7 days.
- **Style Master**: Reach Level 5 or clear an Epic Boss Challenge.
