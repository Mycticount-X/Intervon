import json
import os
from pinecone import Pinecone
from dotenv import load_dotenv

# 1. Load Environment Variables (API Key dari .env)
load_dotenv()
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index = pc.Index("intervon") # Pastikan nama index sesuai

def upload_data():
    print("Membaca file dataset.json...")
    # 2. Buka dan baca dataset.json
    with open("dataset.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    records = []
    print(f"Ditemukan {len(data)} soal. Memulai proses embedding (mengubah teks ke angka)...")
    
    for item in data:
        # 3. Ubah jawaban ideal menjadi Vektor menggunakan model dari PRD
        embedding_response = pc.inference.embed(
            model="multilingual-e5-large",
            inputs=[item["ideal_answer"]],
            parameters={"input_type": "passage", "truncate": "END"}
        )
        
        # 4. Siapkan paket data (Vektor + Metadata) untuk disimpan
        records.append({
            "id": item["id"],
            "values": embedding_response[0].values,
            "metadata": {
                "question_id": item["id"],
                "role": item["role"],
                "ideal_answer": item["ideal_answer"],
                "question": item["question"]
            }
        })

    # 5. Tembakkan ke database Pinecone
    print("Mengunggah data ke Pinecone...")
    index.upsert(vectors=records)
    print("✅ Sukses! Database Pinecone sekarang sudah terisi.")

if __name__ == "__main__":
    upload_data()