from pydantic import BaseModel
from typing import List

class ComparisonPoint(BaseModel):
    point:str
    mentioned:bool

class Metrics(BaseModel):
    embedding_similarity_score: float
    ragas_answer_relevance: float
    ragas_faithfulness: float
    ragas_final_score: float
    tfidf_cosine_score: float

class EvalResponse(BaseModel):
    user_transcription:str
    ideal_answer:str
    metrics:Metrics
    feedback:str
    comparison_points: List[ComparisonPoint]


class QuestionItem(BaseModel):
    id: str
    question:str
    role:str

class QuestionListResponse(BaseModel):
    total: int
    data: List[QuestionItem]