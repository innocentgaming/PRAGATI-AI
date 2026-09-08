import re
from typing import List, Dict, Any

class DocumentChunker:
    """
    Semantic chunker designed for government infrastructure documents,
    monthly project monitoring reports, and DPRs (Detailed Project Reports).
    """

    @classmethod
    def chunk_text(cls, text: str, chunk_size: int = 500, overlap: int = 80, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        if not text:
            return []
        
        # Split by logical sections or double newlines first
        paragraphs = re.split(r'\n\s*\n', text)
        chunks = []
        current_chunk = []
        current_len = 0
        chunk_idx = 0

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            words = para.split()
            para_len = len(words)

            if current_len + para_len > chunk_size and current_chunk:
                chunk_text = " ".join(current_chunk)
                chunks.append({
                    "chunk_index": chunk_idx,
                    "content": chunk_text,
                    "metadata": metadata or {}
                })
                chunk_idx += 1
                
                # Keep overlap
                overlap_words = current_chunk[-overlap:] if len(current_chunk) > overlap else current_chunk
                current_chunk = list(overlap_words)
                current_len = len(current_chunk)

            current_chunk.extend(words)
            current_len += para_len

        if current_chunk:
            chunks.append({
                "chunk_index": chunk_idx,
                "content": " ".join(current_chunk),
                "metadata": metadata or {}
            })

        return chunks
