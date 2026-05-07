from fastapi import APIRouter, File, UploadFile, Form
from app.services.whisper_svc import transcribe_audio
from app.services.pinecone_svc import search
from app.services.groq_svc import evaluate_answer

router = APIRouter()

@router.post("/evaluate")
async def evaluate_interview(
    question_id:str = Form(...),
    role:str = Form(...),
    experience:str = Form(...),
    file: UploadFile = File(...),
): 
    """Endpoint utama untuk evaluation user answer"""

    file_bytes = await file.read()
    user_answer =transcribe_audio(file.filename, file_bytes)
    if "Error" in user_answer:
        return {"error": "Gagal transkrip audio"}
    
    pinecone_res = search(user_answer,question_id, role, experience)
    if "error" in pinecone_res:
        return {"error": pinecone_res["error"]}
    ideal_answer = pinecone_res.get("ideal_answer", "")
    embedding_score = pinecone_res.get("embeding_score", "0.0")

    if not ideal_answer:
        return {"error": "Kunci jawaban tidak ditemukan di database."}

    evaluation_result = evaluate_answer(user_answer,ideal_answer)
    if "error" in evaluation_result:
        return {"error": evaluation_result["error"]}
    
    ragas_eval = evaluate_answer(user_answer, ideal_answer)
    return {
        "user_transcription": user_answer,
        "ideal_answer": ideal_answer,
        "metrics": {
            "embedding_similarity_score": embedding_score,
            "ragas_answer_relevance": ragas_eval.get("answer_relevance"),
            "ragas_faithfulness": ragas_eval.get("faithfulness")
        },
        "feedback": ragas_eval.get("summary_feedback"),
        "comparison_points": ragas_eval.get("comparison_points")
    }

