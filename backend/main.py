import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import random
import uuid

# --- FIREBASE SETUP ---
# Use the key file you downloaded
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# --- DATA MODELS (Pydantic) ---
# We use Pydantic now because Firestore is NoSQL
class Lead(BaseModel):
    id: Optional[str] = None
    name: str
    company: str
    email: str
    notes: str
    status: str = "New"
    ai_score: Optional[int] = 0
    ai_category: Optional[str] = "Cold Lead ❄️"

class LeadUpdate(BaseModel):
    status: Optional[str] = None

# --- APP SETUP ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

def generate_email_content(lead: Lead):
    if lead.ai_score > 80:
        subject = f"Urgent opportunity for {lead.company}"
        opener = "I noticed your team is moving fast, and I don't want you to miss this."
        cta = "Can we hop on a 5-minute call tomorrow?"
    elif lead.ai_score > 50:
        subject = f"Ideas for {lead.company}"
        opener = f"I was researching {lead.company} and saw some potential for growth."
        cta = "Do you have time next week to chat?"
    else:
        subject = f"Introduction: Nexus x {lead.company}"
        opener = "I hope this email finds you well."
        cta = "Let me know if this sounds interesting."

    return f"""Subject: {subject}

Hi {lead.name},

{opener}

Based on your notes ("{lead.notes}"), I think our solution fits perfectly. We help companies like {lead.company} streamline their workflow using AI.

{cta}

Best,
The Nexus Team"""

# --- ROUTES (Connected to Firebase) ---

@app.post("/leads/", response_model=Lead)
def create_lead(lead: Lead):
    # 1. AI Analysis
    score, category = analyze_lead(lead.notes)
    lead.ai_score = score
    lead.ai_category = category
    
    # 2. Save to Firestore
    # We create a new document reference to get an ID
    doc_ref = db.collection("leads").document()
    lead.id = doc_ref.id
    
    # Write the data (convert Pydantic model to dict)
    doc_ref.set(lead.dict())
    
    return lead

@app.get("/leads/", response_model=List[Lead])
def read_leads():
    # Read all documents from 'leads' collection
    leads_ref = db.collection("leads")
    docs = leads_ref.stream()
    
    leads = []
    for doc in docs:
        lead_data = doc.to_dict()
        leads.append(lead_data)
        
    return leads

@app.patch("/leads/{lead_id}")
def update_lead(lead_id: str, lead_update: LeadUpdate):
    doc_ref = db.collection("leads").document(lead_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Update only the fields provided
    update_data = {k: v for k, v in lead_update.dict().items() if v is not None}
    doc_ref.update(update_data)
    
    return {"id": lead_id, "status": "updated"}

@app.delete("/leads/{lead_id}")
def delete_lead(lead_id: str):
    db.collection("leads").document(lead_id).delete()
    return {"ok": True}

@app.delete("/leads/reset/all")
def reset_database():
    # Batch delete all leads
    batch = db.batch()
    docs = db.collection("leads").list_documents()
    deleted = 0
    
    for doc in docs:
        batch.delete(doc)
        deleted += 1
        # Commit batch every 500 items (Firestore limit)
        if deleted >= 400:
            batch.commit()
            batch = db.batch()
            deleted = 0
            
    batch.commit()
    return {"message": "Database wiped."}

@app.get("/leads/{lead_id}/email")
def get_ai_email(lead_id: str):
    doc_ref = db.collection("leads").document(lead_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Convert Firestore Dict to Lead Object
    lead_data = doc.to_dict()
    lead = Lead(**lead_data)
    
    email_content = generate_email_content(lead)
    return {"email": email_content}