from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as interview_router

app = FastAPI(title="Intervon Backend")

# --- KONFIGURASI CORS (PEMBERI IZIN UNTUK FRONTEND) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Mengizinkan semua frontend (termasuk localhost:5173 / 5174)
    allow_credentials=True,
    allow_methods=["*"],  # Mengizinkan POST, GET, dll
    allow_headers=["*"],
)

# Memasukkan router yang sudah kita buat
app.include_router(interview_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Intervon Backend is running!"}