from groq import Groq
from app.core.config import settings

groq_client = Groq(api_key = settings.GROQ_API_KEY)

def test_groq_connection():
    try: 
        response = groq_client.chat.completions.create(
            messages=[
                {"role": "user", "content":"Halo tes koneksi"}
            ],
            model="llama-3.3-70b-versatile",
            max_completion_tokens=50,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error {e}"