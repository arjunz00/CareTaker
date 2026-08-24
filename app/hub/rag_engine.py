import os
import json
import re
import math
from typing import List, Dict, Any, Optional

class RAGEngine:
    def __init__(self, knowledge_dir: Optional[str] = None):
        if knowledge_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            knowledge_dir = os.path.join(base_dir, "knowledge")
        self.knowledge_dir = knowledge_dir
        self.role_kbs: Dict[str, List[Dict[str, Any]]] = {}
        self._load_knowledge_bases()

    def _load_knowledge_bases(self):
        roles = ["patient", "guardian", "doctor", "volunteer", "college"]
        for role in roles:
            file_path = os.path.join(self.knowledge_dir, f"{role}_kb.json")
            if os.path.exists(file_path):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        self.role_kbs[role] = json.load(f)
                except Exception as e:
                    print(f"Error loading KB for {role}: {e}")
                    self.role_kbs[role] = []
            else:
                self.role_kbs[role] = []

        # Load dynamic custom knowledge base if available
        custom_file = os.path.join(self.knowledge_dir, "custom_kb.json")
        if os.path.exists(custom_file):
            try:
                with open(custom_file, "r", encoding="utf-8") as f:
                    custom_chunks = json.load(f)
                    for chunk in custom_chunks:
                        target_roles = chunk.get("roles") or [chunk.get("role", "all")]
                        if isinstance(target_roles, str):
                            target_roles = [target_roles]
                        for r in target_roles:
                            r_lower = r.lower()
                            if r_lower == "all":
                                for role in roles:
                                    if chunk not in self.role_kbs[role]:
                                        self.role_kbs[role].append(chunk)
                            elif r_lower in self.role_kbs:
                                if chunk not in self.role_kbs[r_lower]:
                                    self.role_kbs[r_lower].append(chunk)
            except Exception as e:
                print(f"Error loading custom_kb.json: {e}")

    def reload(self):
        """Reload all knowledge bases from disk."""
        self._load_knowledge_bases()


    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r'\w+', text.lower())
        return [w for w in words if len(w) > 2]

    def _compute_vector(self, tokens: List[str]) -> Dict[str, float]:
        tf: Dict[str, float] = {}
        for token in tokens:
            tf[token] = tf.get(token, 0.0) + 1.0
        norm = math.sqrt(sum(v * v for v in tf.values())) or 1.0
        return {k: v / norm for k, v in tf.items()}

    def _cosine_similarity(self, vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        score = 0.0
        for k, v in vec1.items():
            if k in vec2:
                score += v * vec2[k]
        return score

    def retrieve_context(self, role: str, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        kb = self.role_kbs.get(role.lower(), self.role_kbs.get("patient", []))
        if not kb:
            return []

        query_tokens = self._tokenize(query)
        query_vec = self._compute_vector(query_tokens)

        scored_chunks = []
        for chunk in kb:
            # Combine content and keywords for scoring
            combined_text = f"{chunk.get('content', '')} {' '.join(chunk.get('keywords', []))} {chunk.get('category', '')}"
            doc_tokens = self._tokenize(combined_text)
            doc_vec = self._compute_vector(doc_tokens)
            
            sim = self._cosine_similarity(query_vec, doc_vec)
            
            # Additional keyword match boost
            keyword_matches = sum(1 for kw in chunk.get('keywords', []) if kw.lower() in query.lower())
            total_score = sim + (keyword_matches * 0.25)
            
            scored_chunks.append((total_score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [chunk for score, chunk in scored_chunks[:top_k] if score > 0.05]
    def generate_response(self, role: str, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        from app.hub.rag_pipeline import process_rag_query
        return process_rag_query(query=query, role=role)

rag_engine = RAGEngine()


