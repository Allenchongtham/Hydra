import os
import traceback
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Hydra Browser-Speech Triage API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase_url: str = os.getenv("SUPABASE_URL")
supabase_key: str = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials in .env file")

supabase: Client = create_client(supabase_url, supabase_key)

class TriageRequest(BaseModel):
    report_id: str
    transcript: str  # Direct text coming from browser speech API

@app.get("/")
def read_root():
    return {"status": "Hydra Backend with Browser AI is operational 🟢"}

@app.post("/api/triage")
def triage_report(req: TriageRequest):
    try:
        # Save the browser-transcribed text straight into Supabase
        update_payload = {
            "issue_type": "VOICE_REPORT_PROCESSED",
            "description": f"[BROWSER AI SPEECH]: {req.transcript}",
            "status": "active"
        }

        db_response = supabase.table("reports").update(update_payload).eq("id", req.report_id).execute()

        return {
            "message": "Triage complete", 
            "transcript": req.transcript, 
            "data": db_response.data
        }
    
    except Exception as e:
        print("Error:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))