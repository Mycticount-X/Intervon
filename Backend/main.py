from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import os
from datetime import datetime

app = FastAPI(title="Intervon Audio API")

# CORS configuration to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change this for production!)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a directory to store uploaded audio files
UPLOAD_DIR = Path("./audio_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "Intervon Audio API is running",
        "version": "0.1.0"
    }


@app.post("/api/audio/upload")
async def upload_audio(file: UploadFile = File(...)):
    """
    Upload audio file from the frontend.
    
    Receives the recorded audio blob and saves it locally.
    Returns the file ID for later retrieval.
    """
    try:
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"interview_{timestamp}.webm"
        file_path = UPLOAD_DIR / filename
        
        # Save the uploaded file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        return {
            "status": "success",
            "filename": filename,
            "message": f"Audio file saved as {filename}",
            "download_url": f"/api/audio/download/{filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading audio: {str(e)}")


@app.get("/api/audio/download/{filename}")
async def download_audio(filename: str):
    """
    Download a previously uploaded audio file.
    
    Example: /api/audio/download/interview_20260506_120000.webm
    """
    try:
        file_path = UPLOAD_DIR / filename
        
        # Security: prevent directory traversal attacks
        if not file_path.exists() or not file_path.is_file():
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type="audio/webm"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading audio: {str(e)}")


@app.get("/api/audio/list")
async def list_audios():
    """
    List all uploaded audio files.
    Useful for testing and debugging.
    """
    try:
        files = list(UPLOAD_DIR.glob("*.webm"))
        file_list = [
            {
                "filename": f.name,
                "size_bytes": f.stat().st_size,
                "created": datetime.fromtimestamp(f.stat().st_ctime).isoformat(),
                "download_url": f"/api/audio/download/{f.name}"
            }
            for f in sorted(files, reverse=True)
        ]
        return {
            "status": "success",
            "total_files": len(file_list),
            "files": file_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
