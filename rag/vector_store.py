import faiss
import numpy as np
import json
import os


class VectorStore:

    def __init__(self, dimension=768):

        self.dimension = dimension

        self.index = faiss.IndexFlatL2(dimension)

        # Each item will be:
        # {
        #     "paper": "...",
        #     "chunk": "..."
        # }
        self.chunks = []

    # ---------------------------------
    # Add embedding + metadata
    # ---------------------------------
    def add(self, embedding, item):

        vector = np.array(
            embedding,
            dtype=np.float32
        ).reshape(1, -1)

        self.index.add(vector)

        self.chunks.append(item)

    # ---------------------------------
    # Search most relevant chunks
    # ---------------------------------
    def search(self, embedding, top_k=5):

        if len(self.chunks) == 0:
            return []

        vector = np.array(
            embedding,
            dtype=np.float32
        ).reshape(1, -1)

        top_k = min(top_k, len(self.chunks))

        distances, indices = self.index.search(
            vector,
            top_k
        )

        results = []

        for idx in indices[0]:

            if idx < len(self.chunks):

                results.append(self.chunks[idx])

        return results

    # ---------------------------------
    # Save FAISS index
    # ---------------------------------
    def save(self, index_path, chunks_path):

        os.makedirs(
            os.path.dirname(index_path),
            exist_ok=True
        )

        os.makedirs(
            os.path.dirname(chunks_path),
            exist_ok=True
        )

        faiss.write_index(
            self.index,
            index_path
        )

        with open(
            chunks_path,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                self.chunks,
                f,
                ensure_ascii=False,
                indent=4
            )

    # ---------------------------------
    # Load FAISS index
    # ---------------------------------
    def load(self, index_path, chunks_path):

        if not (
            os.path.exists(index_path)
            and
            os.path.exists(chunks_path)
        ):
            return False

        self.index = faiss.read_index(index_path)

        with open(
            chunks_path,
            "r",
            encoding="utf-8"
        ) as f:

            self.chunks = json.load(f)

        return True