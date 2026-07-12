# Crisis Compass

**When crisis strikes, you act — not panic.**

Crisis Compass is an AI-powered disaster preparedness and emergency response platform built for **Next Byte Hacks V3**. It helps people stay calm, get clear guidance, and coordinate help during floods, fires, earthquakes, and other emergencies.

---

## About the project

Disasters are chaotic. People panic, information is scattered, and generic advice ignores real needs — like medical conditions, go-bag readiness, or where to find shelter nearby.

**Crisis Compass** brings preparedness and response into one app:

1. **Describe your situation** in plain language
2. **Get a personalized AI plan** — danger level, immediate actions, what to carry, nearby help, and safety tips
3. **Track readiness** with a FEMA/Red Cross–based preparedness checklist
4. **Monitor your area** on a dashboard with weather, risk level, and shelter info
5. **Ask the community for help** — post needs for water, food, shelter, or rides

The app is designed around **your profile**: blood group, medical conditions, and emergency contacts shape the guidance you receive.

---

## Key features

### AI Emergency Assistant (`/assistant`)
Type what’s happening — e.g. *"there is smoke in my building"* or *"flood water is rising near my home"*. The assistant uses **Groq + LangChain** to return a structured plan with:
- Danger level (low → critical)
- Step-by-step immediate actions
- Things to carry
- Nearby help suggestions
- Safety tips tailored to your medical profile

### User profiles (`/register`, `/profile`)
Create an account and save:
- Blood group
- Medical conditions (asthma, diabetes, mobility needs, etc.)
- Emergency contact name and phone

This data is used to personalize AI plans and is stored securely with JWT auth.

### Emergency dashboard (`/dashboard`)
A situational overview with:
- **Weather card** — current conditions in your area
- **Risk badge** — assessed threat level
- **Quick SOS** — fast access to emergency actions
- **Shelter locator** — nearby shelters and hospitals on a map *(demo data for hackathon)*

### Preparedness checklist (`/checklist`)
A household readiness tracker based on **FEMA and Red Cross** guidelines. Check off water, food, medical, and evacuation items. Progress is **saved per user** in the database.

### Community Help Board (`/community`)
A real, database-backed board where logged-in users can:
- Post needs: **water**, **food**, **shelter**, or **rides**
- Add location and contact info
- Browse and filter open requests
- Mark their own posts as fulfilled or delete them

---

## What's real vs demo

| Part | Status |
|------|--------|
| AI assistant, auth, profiles, checklist, community board | **Real** — live API + PostgreSQL database |
| Shelter/hospital map data | **Demo** — mock Overpass data, labeled as such |
| Weather & alerts | **Live** — fetched from external APIs |

---

## How it works

```
User describes emergency
        ↓
AI generates structured EmergencyPlan
        ↓
Dashboard shows weather, risk, shelters
        ↓
Checklist tracks long-term preparedness
        ↓
Community board coordinates mutual aid
```

---

## Tech stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, Vite, TypeScript, Tailwind CSS, Framer Motion, Leaflet |
| Backend | FastAPI, SQLAlchemy, PostgreSQL, JWT, LangChain, Groq |
| AI | Groq LLM with structured Pydantic output |

---

## Getting started

**Prerequisite:** PostgreSQL must be running locally (or use a hosted instance). Create a database:

```sql
CREATE DATABASE crisis_compass;
```

```powershell
# Terminal 1 — backend
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env   # set GROQ_API_KEY, JWT_SECRET, and DATABASE_URL
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open **http://localhost:5173**

| Try this | Where |
|----------|-------|
| Describe an emergency | `/assistant` |
| Create a profile | `/register` |
| View dashboard | `/dashboard` |
| Track go-bag items | `/checklist` |
| Post a community need | `/community` (login required) |
| API documentation | http://127.0.0.1:8000/docs |

---

## Environment variables

**Backend** (`backend/.env`):

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key for the AI assistant |
| `JWT_SECRET` | Yes | Secret for signing auth tokens |
| `DATABASE_URL` | Yes* | PostgreSQL connection string, e.g. `postgresql://postgres:postgres@localhost:5432/crisis_compass` |

**Frontend** (`frontend/.env`):

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Defaults to `http://localhost:8000` |

---

## Roadmap

- [ ] Deploy to production (Vercel + Render)
- [ ] Community board: "I can help" responses and real-time updates
- [ ] AI Damage Analysis — upload photos for damage assessment *(stretch)*

---

## Project structure

```
crisis-compass/
├── backend/     # FastAPI API, database, AI integration
└── frontend/    # React web app
```

For detailed setup in each folder, see `backend/README.md` and `frontend/README.md`.

---

Built for **Next Byte Hacks V3** — helping communities prepare, respond, and recover together.
