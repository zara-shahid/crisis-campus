<div align="center">

<img src="frontend/public/favicon.svg" alt="Crisis Compass Logo" width="80" />

# Crisis Compass

**When crisis strikes, you act — not panic.**

A tactical, AI-powered emergency response platform built to help people stay calm, get personalized guidance, and coordinate mutual aid during any disaster.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Groq](https://img.shields.io/badge/AI-Groq%20LLM-F55036?style=flat-square)](https://groq.com)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

[Live Demo](https://crisis-compass.vercel.app) | [Report a Bug](https://github.com/zara-shahid/crisis-campus/issues) | [API Docs](http://localhost:8000/docs)

</div>

---

## Screenshots

> Drop your screenshots below to bring the README to life!

| Home | Dashboard |
|------|-----------|
| ![Home page screenshot](screenshots/home.png) | ![Dashboard screenshot](screenshots/dashboard.png) |

| AI Assistant | Preparedness Checklist |
|-------------|----------------------|
| ![Assistant screenshot](screenshots/assistant.png) | ![Checklist screenshot](screenshots/checklist.png) |

---

## What is Crisis Compass?

Disasters are chaotic. People panic, information is scattered, and generic advice ignores real needs like medical conditions, go-bag readiness, or where to find shelter nearby.

**Crisis Compass** brings preparedness and response into one cohesive app. It is designed around *your* profile: blood group, medical conditions, and emergency contacts all shape the guidance you receive.

---

## Core Features

### AI Emergency Assistant
Describe your situation in plain language (e.g. *"there is smoke in my building"* or *"flood water is rising near my home"*). The assistant uses **Groq + LangChain** to return a structured, personalized action plan with:

- Assessed danger level (low to critical)
- Step-by-step immediate actions
- A list of items to carry
- Nearby shelter and hospital suggestions
- Safety tips tailored to your medical profile

### Emergency Dashboard
A real-time situational overview including:

- **Live Weather Card** fetched from external APIs
- **Dynamic Risk Badge** with active disaster alerts from GDACS and NWS
- **Shelter Locator** showing nearby shelters and hospitals on an interactive Leaflet map
- **Quick SOS** for fast access to emergency actions

### Preparedness Checklist
A household readiness tracker built on **FEMA and Red Cross** guidelines. Check off water, food, medical, documents, and evacuation items. Progress is saved per user account and synced across devices.

### Community Help Board
A real, database-backed board where users can:

- Post needs for **water**, **food**, **shelter**, or **rides**
- Browse and filter open requests by category
- Mark their own posts as fulfilled or delete them

### Offline Mode (PWA)
Crisis Compass is a fully installable **Progressive Web App**. The service worker caches core assets so that emergency checklists and guides remain accessible even when the internet goes down.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Leaflet |
| **Backend** | FastAPI, SQLAlchemy, PostgreSQL, JWT Authentication |
| **AI** | Groq LLM, LangChain, Pydantic structured output |
| **Deployment** | Vercel (frontend), Supabase (PostgreSQL) |

---

## How It Works

```
User describes their emergency situation
         |
         v
AI generates a structured EmergencyPlan (Groq LLM)
         |
         v
Dashboard shows live weather, risk level, and shelters
         |
         v
Checklist tracks long-term household preparedness
         |
         v
Community board coordinates mutual aid and resource sharing
```

---

## What Is Real vs Demo

| Feature | Status |
|---------|--------|
| AI Assistant | Live via Groq API |
| User Auth and Profiles | Live with JWT and PostgreSQL |
| Preparedness Checklist | Live with per-user database sync |
| Community Help Board | Live with full CRUD |
| Weather and Alerts | Live from NWS and GDACS APIs |
| Shelter Map Data | Demo (labeled as such in UI) |

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A PostgreSQL database (local or hosted via Supabase)
- A free [Groq API key](https://console.groq.com)

### 1. Clone the repository

```bash
git clone https://github.com/zara-shahid/crisis-campus.git
cd crisis-campus
```

### 2. Set up the backend

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Copy the example environment file and fill in your values:

```powershell
copy .env.example .env
```

```env
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=a_long_random_secret_string
DATABASE_URL=postgresql://user:password@host:5432/crisis_compass
```

Start the server:

```powershell
uvicorn main:app --reload --port 8000
```

### 3. Set up the frontend

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | API key from [console.groq.com](https://console.groq.com) |
| `JWT_SECRET` | Yes | A long, random secret for signing auth tokens |
| `DATABASE_URL` | Yes | PostgreSQL connection string |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Defaults to `http://localhost:8000` |

---

## Quick Navigation

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with overview |
| AI Assistant | `/assistant` | Describe your emergency, get a plan |
| Dashboard | `/dashboard` | Live weather, alerts, and shelter map |
| Checklist | `/checklist` | Household preparedness tracker |
| Community | `/community` | Post and browse help requests |
| Profile | `/profile` | Manage medical info and contacts |
| API Docs | `http://localhost:8000/docs` | FastAPI interactive documentation |

---

## Project Structure

```
crisis-compass/
├── backend/
│   ├── db/          # Database models and session config
│   ├── models/      # SQLAlchemy ORM models
│   ├── routers/     # FastAPI route handlers
│   ├── services/    # AI assistant and business logic
│   └── main.py      # App entrypoint
└── frontend/
    ├── public/      # Static assets and PWA icons
    └── src/
        ├── components/  # Reusable UI components
        ├── hooks/       # Custom React hooks
        ├── pages/       # Route-level page components
        └── services/    # API client functions
```

---

## Roadmap

- [x] AI Emergency Assistant with personalized plans
- [x] User profiles with medical conditions
- [x] Live weather and disaster alerts
- [x] Community Help Board
- [x] Offline Mode (PWA)
- [x] Mobile responsive navigation
- [ ] Push notifications for nearby disaster alerts
- [ ] AI Damage Analysis via photo upload
- [ ] Community board real-time updates

---

<div align="center">

Built with care for **Next Byte Hacks V3** — helping communities prepare, respond, and recover together.

</div>
