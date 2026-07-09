from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import Base, engine
from db.models import User, HelpPost
from routers import assistant, auth, alerts, locations, help_board

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Crisis Compass API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assistant.router)
app.include_router(auth.router)
app.include_router(alerts.router)
app.include_router(locations.router)
app.include_router(help_board.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "crisis-compass-api"}