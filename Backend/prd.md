Research Purpose (Tujuan Riset)Tujuan utama proyek ini adalah mengevaluasi efektivitas RAG (Retrieval-Augmented Generation) dalam memberikan penilaian objektif terhadap jawaban wawancara kerja.Akurasi Semantik: Menilai apakah model embedding (seperti multilingual-e5-large) mampu menangkap maksud jawaban user meskipun tidak sama persis secara kata-kata dengan kunci jawaban.Efisiensi Baseline: Membandingkan metode statistik tradisional (TF-IDF) dengan metode AI modern untuk melihat margin of improvement dalam penilaian otomatis.Scalability: Menguji apakah sistem mampu menangani dataset besar (1.2 GB dari Kaggle) tanpa penurunan latency yang signifikan.Product Requirements Document (PRD) - Backend Task1. Project OverviewMembangun engine backend untuk "AI-Powered Interview Coach" yang mampu memberikan transkrip, pencarian jawaban ideal (Retrieval), dan evaluasi jawaban (Scoring) secara real-time.2. User StoriesUser: "Gue pengen dapet feedback langsung setelah gue jawab soal pake suara."System: "Harus bisa nangkep audio, nyari jawaban paling mirip di database, dan kasih skor pake Llama 3."3. Functional RequirementsIDRequirementDeskripsiFR-01Audio TranscriptionSistem harus mampu mengubah audio user (WAV/MP3) menjadi teks via Whisper.FR-02Metadata FilteringPencarian di Pinecone WAJIB menggunakan filter metadata: question, role, dan experience.FR-03Similarity RetrievalSistem harus mengembalikan ideal_answer yang paling relevan dari index intervon.FR-04AI EvaluationMenggunakan Llama 3 (Groq) untuk membandingkan user_answer vs ideal_answer.4. Technical SpecificationsVector DB: Pinecone (Serverless) dengan model multilingual-e5-large.Model Inference: Input type untuk query diatur sebagai query (sesuai settingan di [image_f2e858.png]).Field Mapping: ideal_answer sebagai basis embedding dan metadata.LLM API: Groq SDK (Llama 3-70b/8b) untuk latency < 2 detik.Implementation Plan (Backend Task)Phase 1: Environment & Core SetupRepo Setup: Inisialisasi folder sesuai struktur yang udah kita bahas tadi.Secret Management: Masukkan PINECONE_API_KEY dan GROQ_API_KEY ke .env.Connection Test: Bikin script pendek buat pastiin FastAPI bisa "ping" ke Host URL Pinecone.Phase 2: The Service LayerPinecone Service: Buat fungsi retrieve_ideal_answer(user_text, filters) yang mengembalikan teks jawaban ideal.Groq Service: Buat Prompt Template yang menyuruh Llama 3 menilai jawaban berdasarkan: Akurasi, Kejelasan, dan Profesionalisme.Whisper Service: Integrasi library untuk proses audio-to-text.Phase 3: Integration & TestingEndpoint API: Satukan semua service di satu endpoint /evaluate.Logic Validation: Tes skenario di mana user jawab ngaco (skor harus rendah) dan user jawab mirip (skor harus tinggi).

4. 🗂️ Project Structure (Modular Architecture)
   intervon-backend/
   ├── app/
   │ ├── main.py # Entry point
   │ ├── api/
   │ │ └── v1/
   │ │ └── endpoints.py # API routes
   │ ├── services/
   │ │ ├── pinecone_svc.py # Retrieval logic
   │ │ ├── groq_svc.py # LLM evaluation
   │ │ └── whisper_svc.py # Transcription
   │ ├── core/
   │ │ └── config.py # Env & settings
   │ ├── models/
   │ │ └── schemas.py # Request/response models
   │ └── utils/
   │ └── helpers.py # Utility functions
   ├── .env
   ├── requirements.txt
   └── README.md
