from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, select
from database import create_db_and_tables, get_session
from typing import List, Optional
import random

# --- DATA MODEL ---
class Lead(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    company: str
    email: str
    notes: str
    status: str = "New" # <--- New Column
    ai_score: int
    ai_category: str

class LeadUpdate(SQLModel):
    status: Optional[str] = None
    notes: Optional[str] = None

# --- APP SETUP ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- AI LOGIC ---
def analyze_lead(notes: str):
    score = 0
    notes_lower = notes.lower()
    high_value_keywords = ["urgent", "budget", "enterprise", "ready", "buy"]
    
    for word in high_value_keywords:
        if word in notes_lower:
            score += 20
            
    score += random.randint(10, 30)
    if score > 100: score = 100
    
    category = "Cold Lead ❄️"
    if score > 50: category = "Warm Lead 🔥"
    if score > 80: category = "Hot Lead 🚀"
    
    return score, category

# --- ROUTES ---

@app.post("/leads/", response_model=Lead)
def create_lead(lead: Lead, session: Session = Depends(get_session)):
    score, category = analyze_lead(lead.notes)
    lead.ai_score = score
    lead.ai_category = category
    session.add(lead)
    session.commit()
    session.refresh(lead)
    return lead

@app.get("/leads/", response_model=List[Lead])
def read_leads(session: Session = Depends(get_session)):
    leads = session.exec(select(Lead)).all()
    return leads

@app.patch("/leads/{lead_id}", response_model=Lead)
def update_lead(lead_id: int, lead_update: LeadUpdate, session: Session = Depends(get_session)):
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead_data = lead_update.dict(exclude_unset=True)
    for key, value in lead_data.items():
        setattr(lead, key, value)
        
    session.add(lead)
    session.commit()
    session.refresh(lead)
    return lead

@app.delete("/leads/{lead_id}")
def delete_lead(lead_id: int, session: Session = Depends(get_session)):
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    session.delete(lead)
    session.commit()
    return {"ok": True}