from fastapi import FastAPI, File,  UploadFile
from .services.groq_svc import test_groq_connection
from .services.whisper_svc import transcribe_audio
from .services.pinecone_svc import pinecone_connection, test_search
app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Intervon AI Backend is Running"}

@app.get("/test-groq")
def test_groq():
    result = test_groq_connection()
    return {"message": result}


@app.post("/test-upload-audio")
async def test_upload_audio(file:UploadFile = File(...)):
    file_bytes = await file.read()

    hasil_text = transcribe_audio(file.filename, file_bytes)
    return {
                "filename": file.filename, "transcription": hasil_text
            }

@app.get('/pinecone-connection')
def test_pinecone():
    result = pinecone_connection()
    return {"message": result}

@app.get('/pinecone-test-search')
def test_search_pinecone():
    result = test_search()
    return {"message": result}