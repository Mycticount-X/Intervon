import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def preprocess_text(text: str) -> str:
    """
    Fungsi Preprocessing NLP Dasar untuk Paper:
    1. Lowercasing
    2. Menghapus tanda baca dan karakter khusus
    3. Ekstra whitespace removal
    """
    if not text:
        return ""
    
    # 1. Lowercase
    text = text.lower()
    
    # 2. Hapus tanda baca (hanya sisakan huruf dan angka)
    text = re.sub(r'[^\w\s]', '', text)
    
    # 3. Hapus spasi berlebih
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def calculate_tfidf_similarity(user_answer: str, ideal_answer: str) -> float:
    """
    Menghitung Cosine Similarity antara jawaban user dan ideal answer 
    menggunakan algoritma TF-IDF.
    """
    clean_user = preprocess_text(user_answer)
    clean_ideal = preprocess_text(ideal_answer)
    
    if not clean_user or not clean_ideal:
        return 0.0

    # 2. Inisialisasi TF-IDF Vectorizer
    # stop_words='english' otomatis membuang kata hubung (the, is, at, which, dll)
    vectorizer = TfidfVectorizer(stop_words='english')
    
    try:
        # 3. Fit dan Transform teks menjadi vector (Matriks TF-IDF)
        tfidf_matrix = vectorizer.fit_transform([clean_ideal, clean_user])
        
        # tfidf_matrix[0] = Vektor Jawaban Ideal
        # tfidf_matrix[1] = Vektor Jawaban User
        
        # 4. Hitung Cosine Similarity
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        
        # Ambil nilai skornya (karena outputnya berupa matrix 2D)
        score = float(cosine_sim[0][0])
        return round(score, 4) # Bulatkan 4 angka di belakang koma biar rapi di JSON
        
    except Exception as e:
        print(f"Error calculating TF-IDF: {e}")
        return 0.0
