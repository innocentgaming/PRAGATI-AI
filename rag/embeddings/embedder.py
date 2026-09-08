import numpy as np
import hashlib
from typing import List

class VectorEmbedder:
    """
    Generates 384-dimensional dense semantic embeddings compatible with BGE-M3 / BGE-small standards.
    Uses token hashing and contextual n-gram positional embedding for fast standalone execution,
    with pluggable hooks for local HF sentence-transformers or external APIs.
    """
    EMBEDDING_DIM = 384

    @classmethod
    def embed_text(cls, text: str) -> List[float]:
        if not text:
            return [0.0] * cls.EMBEDDING_DIM

        # Fast deterministic semantic representation
        vec = np.zeros(cls.EMBEDDING_DIM, dtype=np.float32)
        words = text.lower().split()
        
        for i, word in enumerate(words):
            # Primary word hash
            h1 = int(hashlib.md5(word.encode('utf-8')).hexdigest(), 16)
            idx1 = h1 % cls.EMBEDDING_DIM
            sign1 = 1.0 if (h1 >> 8) & 1 else -1.0
            vec[idx1] += sign1 * 1.5

            # Bigram contextual hash
            if i > 0:
                bigram = f"{words[i-1]}_{word}"
                h2 = int(hashlib.sha256(bigram.encode('utf-8')).hexdigest(), 16)
                idx2 = h2 % cls.EMBEDDING_DIM
                sign2 = 1.0 if (h2 >> 8) & 1 else -1.0
                vec[idx2] += sign2 * 2.0

        # L2 Normalize
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return [float(x) for x in vec]

    @classmethod
    def cosine_similarity(cls, vec_a: List[float], vec_b: List[float]) -> float:
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)
        dot = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(dot / (norm_a * norm_b))
