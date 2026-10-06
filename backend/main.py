import os
import traceback
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
from transformers import pipeline

load_dotenv()

app = FastAPI(title="Hydra AI Triage API")

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

print("Loading Flan-T5 AI Triage Model...")
try:
    triage_classifier = pipeline("text-generation", model="google/flan-t5-small")
    print("Flan-T5 Model loaded successfully")
except Exception as e:
    print(f"Warning: Could not load local HF model ({e}). Falling back to heuristic extraction.")
    triage_classifier = None

class TriageRequest(BaseModel):
    report_id: str
    transcript: str

class SummaryRequest(BaseModel):
    descriptions: list[str]
    issue_type: str

@app.get("/")
def read_root():
    return {"status": "Hydra Backend with Flan-T5 Triage Engine is operational"}

@app.post("/api/triage")
def triage_report(req: TriageRequest):
    try:
        transcript = req.transcript.lower()
        issue_category = "WATER_SHORTAGE"
        
        if "burst" in transcript or "leak" in transcript or "phat" in transcript:
            issue_category = "PIPE_BURST"
        elif "block" in transcript or "jam" in transcript:
            issue_category = "CANAL_BLOCK"
        elif "dirty" in transcript or "smell" in transcript or "color" in transcript or "contamination" in transcript:
            issue_category = "CONTAMINATION"
        elif "nahi" in transcript or "shortage" in transcript or "dry" in transcript or "no water" in transcript:
            issue_category = "WATER_SHORTAGE"
        elif triage_classifier:
            prompt = (
                f"Classify this water report into one of these categories "
                f"(PIPE_BURST, CANAL_BLOCK, WATER_SHORTAGE, CONTAMINATION): '{req.transcript}'"
            )
            ai_res = triage_classifier(prompt, max_new_tokens=15, do_sample=False)
            
            generated_text = ""
            if isinstance(ai_res, list) and len(ai_res) > 0:
                if 'generated_text' in ai_res[0]:
                    generated_text = ai_res[0]['generated_text'].strip().upper()
            
            valid_categories = ["PIPE_BURST", "CANAL_BLOCK", "WATER_SHORTAGE", "CONTAMINATION"]
            for cat in valid_categories:
                if cat in generated_text:
                    issue_category = cat
                    break

        update_payload = {
            "issue_type": issue_category,
            "description": f"{req.transcript}",
            "status": "active"
        }

        db_response = supabase.table("reports").update(update_payload).eq("id", req.report_id).execute()

        return {
            "message": "AI Triage complete",
            "category": issue_category,
            "transcript": req.transcript,
            "data": db_response.data
        }
    
    except Exception as e:
        print("Error:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize-cluster")
def summarize_cluster(req: SummaryRequest):
    try:
        combined_text = " ".join(req.descriptions)
        if triage_classifier and len(combined_text.strip()) > 0:
            prompt = f"Summarize these reports about {req.issue_type} into a concise executive brief: '{combined_text}'"
            ai_res = triage_classifier(prompt, max_new_tokens=45, do_sample=False)
            summary = ""
            if isinstance(ai_res, list) and len(ai_res) > 0 and 'generated_text' in ai_res[0]:
                summary = ai_res[0]['generated_text'].replace(prompt, "").strip()
            if len(summary) < 5:
                summary = f"Cluster of {len(req.descriptions)} reports regarding {req.issue_type} detected. Field intervention recommended."
            return {"summary": summary}
        else:
            return {"summary": f"Cluster of {len(req.descriptions)} reports regarding {req.issue_type} requiring municipal attention."}
    except Exception as e:
        print("Summary Error:")
        traceback.print_exc()
        return {"summary": f"Cluster of {len(req.descriptions)} reports regarding {req.issue_type}."}