from pinecone import Pinecone
from app.core.config import settings
pc = Pinecone(api_key=settings.PINECONE_API_KEY)
index_name = "intervon"
index = pc.Index(index_name)

def pinecone_connection():
    try: 
        stats = index.describe_index_stats()
        return f"Sukses connect pinecone Total vector saat ini {stats.total_vector_count}"
    except Exception as e:
        return f"Error Pinecone: {e}"

def test_search():
    try: 
        query = "Hello"
        search_result = index.search(
            namespace="__default__",
            top_k = 1,
            inputs = {
                "text": query
            }
        )
        return search_result
    except Exception as e:
        return f"error: {e}"


