# app.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pymongo import MongoClient
import os
import re
from datetime import datetime
import importlib.util
import sys
from RAG_PDF_App import RAGApplication

# Load environment variables
load_dotenv()

app = FastAPI()

# Database helpers

def get_database():
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        return None
    client = MongoClient(mongo_uri)
    client.server_info()
    return client.rag_app_db

def validate_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def log_email(email):
    db = get_database()
    if db is not None:
        user_collection = db.users
        timestamp = datetime.now()
        result = user_collection.insert_one({
            "email": email,
            "timestamp": timestamp
        })
        return bool(result.inserted_id)
    return False

# In-memory store for PDF sessions (for demo; use persistent store in prod)
pdf_sessions = {}

@app.post("/upload_pdf/")
async def upload_pdf(pdf: UploadFile = File(...), email: str = Form(None)):
    if email and not validate_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format.")
    if email:
        log_email(email)
    contents = await pdf.read()
    rag_app = RAGApplication()
    num_chunks = rag_app.process_pdf(contents)
    if num_chunks == 0:
        raise HTTPException(status_code=500, detail="Failed to process PDF.")
    session_id = os.urandom(8).hex()
    pdf_sessions[session_id] = rag_app
    return {"session_id": session_id, "num_chunks": num_chunks}

@app.post("/ask/")
async def ask_question(session_id: str = Form(...), query: str = Form(...)):
    rag_app = pdf_sessions.get(session_id)
    if not rag_app:
        raise HTTPException(status_code=404, detail="Session not found. Please upload a PDF first.")
    answer = rag_app.get_answer(query)
    return {"answer": answer}

@app.get("/")
def root():
    return {"message": "PDF Q&A API is running. Use /upload_pdf/ and /ask/ endpoints."}