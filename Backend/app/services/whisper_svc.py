from groq import Groq
from app.core.config import settings

groq_client = Groq(api_key = settings.GROQ_API_KEY)

def transcribe_audio(filename:str, file_bytes:bytes) -> str:
    try: 
        transcription = groq_client.audio.transcriptions.create(
            file=(filename, file_bytes),
            model="whisper-large-v3",
            response_format="json",
        ) 
        return transcription.text
    except Exception as e:
        return f"Error transcribing audio: {e}"