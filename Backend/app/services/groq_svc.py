from groq import Groq
from app.core.config import settings
import json

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

def evaluate_answer(user_answer:str, ideal_answer:str, question:str)->dict:
    system_prompt =  """Kamu adalah evaluator wawancara kerja AI. 
    Bandingkan "Jawaban User" dengan "Jawaban Ideal".
    Keluarkan HANYA JSON valid dengan struktur persis seperti ini:
    {
        "answer_relevance": <float 0.0 sampai 1.0> (Seberapa relevan jawaban user terhadap pertanyaan),
        "faithfulness": <float 0.0 sampai 1.0> (Seberapa sesuai jawaban user dengan jawaban ideal),
        "summary_feedback": "<Komentar membangun>",
        "comparison_points": [
            {"point": "<Poin kriteria ideal 1 (harus berdasarkan poin penting di jawaban ideal )>", "mentioned": true/false},
            {"point": "<Poin kriteria ideal 2>", "mentioned": true/false}
        ]
    }
    RULES :
    - Array "comparison_points" HANYA BOLEH berisi MAKSIMAL 3 poin. Pilih 3 kriteria paling krusial/penting dari Jawaban Ideal untuk dievaluasi.
    """ 
    user_prompt = f"Pertanyaan Wawancara: \n{question}\n\n Jawbaan ideal: \n{ideal_answer}\n\n Jawaban user:\n{user_answer}"
    try: 
        response = groq_client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role":"user", "content": user_prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            max_completion_tokens=400,
            temperature=0.2
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return f"Error: {e}"
    