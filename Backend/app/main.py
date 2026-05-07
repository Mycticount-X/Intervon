from fastapi import FastAPI, File,  UploadFile
from app.services.groq_svc import test_groq_connection
from app.services.whisper_svc import transcribe_audio
from app.services.pinecone_svc import pinecone_connection, test_search
from app.api.endpoints import router as interview_router
app = FastAPI()


app.include_router(interview_router, prefix="/api", tags=["interview"])


@app.get("/")
def read_root():
    return {"message": "Intervon AI Backend is Running"}
