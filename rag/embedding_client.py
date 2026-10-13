import requests


class EmbeddingClient:

    def __init__(self):
        self.url = "http://localhost:11434/api/embeddings"
        self.model = "nomic-embed-text"

    def embed(self, text):

        payload = {
            "model": self.model,
            "prompt": text
        }

        try:
            response = requests.post(
                self.url,
                json=payload,
                timeout=120
            )

            data = response.json()

            return data["embedding"]

        except Exception as e:
            print("Embedding Error:", e)
            return None