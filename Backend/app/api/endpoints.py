from fastapi import APIRouter, File, UploadFile, Form, Query, HTTPException
from app.services.whisper_svc import transcribe_audio
from app.services.pinecone_svc import search
from app.services.groq_svc import evaluate_answer
from app.utils.nlp_utils import calculate_tfidf_similarity
from app.models.schema import EvalResponse , QuestionListResponse
import os
import json
from typing import Optional


router = APIRouter()

@router.post("/evaluate", response_model=EvalResponse)
async def evaluate_interview(
    question_id:str = Form(...),
    role:str = Form(...),
    file: UploadFile = File(...),
): 
    """Endpoint utama untuk evaluation user answer"""

    file_bytes = await file.read()
    user_answer =transcribe_audio(file.filename, file_bytes)
    if "Error" in user_answer:
        raise HTTPException(status_code=500, detail="Failed to transcribe audio")
    
    pinecone_res = search(user_answer,question_id, role)

    if "error" in pinecone_res:
        raise HTTPException(status_code=500, detail=pinecone_res["error"])
    ideal_answer = pinecone_res.get("ideal_answer", "")
    embedding_score = pinecone_res.get("embeding_score", "0.0")

    if not ideal_answer:
        raise HTTPException(status_code=400, detail="Ideal answer not found")
    
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    json_path = os.path.join(base_dir, "dataset.json")
    question_text = ""
    try: 
        with open(json_path, "r", encoding="utf-8") as f: 
            data = json.load(f)
            for item in data: 
                if item.get("id") == question_id:
                    question_text = item.get("question", "")
                    break
    except: 
        pass

    ragas_eval = evaluate_answer(user_answer, ideal_answer, question_text)
    if "error" in ragas_eval:
        raise HTTPException(status_code=500, detail=ragas_eval["error"])
    
    # ------------------ HITUNG TF-IDF ------------------
    tfidf_score = calculate_tfidf_similarity(user_answer, ideal_answer)
    answer_relevance = float(ragas_eval.get("answer_relevance", 0.0))
    ragas_faithfulness = float(ragas_eval.get("faithfulness", 0.0))
    final_score = round((answer_relevance + ragas_faithfulness) / 2, 4)
    return {
        "user_transcription": user_answer,
        "ideal_answer": ideal_answer,
        "metrics": {
            "embedding_similarity_score": embedding_score,
            "ragas_answer_relevance": answer_relevance,
            "ragas_faithfulness": ragas_faithfulness,
            "ragas_final_score": final_score,
            "tfidf_cosine_score": tfidf_score,
        },
        "feedback": ragas_eval.get("summary_feedback"),
        "comparison_points": ragas_eval.get("comparison_points")
    }

@router.get("/questions", response_model=QuestionListResponse)
def get_question(role: Optional[str] = Query(None,description="Filter soal based on Role")): 
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__))) #krna naik 3x ya -api-app-backend
    json_path = os.path.join(base_dir, "dataset.json")
    try: 
        with open(json_path, "r", encoding="utf-8") as f: 
            data = json.load(f)

        format_data = [ 
            {
                "id": item.get("id"),
                "question": item.get("question"),
                "role": item.get("role"),
            }
            for item in data
        ]
        

        if role: 
            filtered_data = [item for item in format_data if item.get("role").lower() == role.lower()]
            return { 
                "total":  len(filtered_data),
                "data": filtered_data
            }
        
        return { 
            "total": len(format_data),
            "data": format_data,
        }
    except Exception as e: 
        raise HTTPException(
        status_code=500,
        detail=f"Gagal membaca dataset: {str(e)}"
    )

