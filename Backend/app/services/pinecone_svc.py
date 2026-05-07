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


def search(user_answer:str, question_id: str, role:str, experience:str) -> dict:
    try: 
        search_result = index.search(
            namespace="__default__",
            top_k = 1,
            inputs = {
                "text": user_answer
            },
            filter={
                "question_id": {"$eq": question_id}, 
                "role": {"$eq":role },
                "experience": {"$eq":experience}
            },
        )
        print("ini search result", search_result)
        if search_result.result.hits:
            match = search_result.result.hits[0]
            ideal_answer = match.fields.get("answer", "")
            return {
                "ideal_answer": ideal_answer,
                "embeding_score": match.score
            }
        return {
            "ideal_answer": "",
            "embeding_score": 0
        }
    except Exception as e:
        return {f"error": {e}}
