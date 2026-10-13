import requests

class LLMClient:

    def __init__(self, model="gemma3:1b"):
        self.model = model
        self.url = "http://localhost:11434/api/generate"

    def generate(self, prompt):

        response = requests.post(
            self.url,
            json={
                "model": self.model,
                "prompt": prompt,
                "stream": False
            }
        )

        if response.status_code == 200:
            return response.json()["response"]

        return f"Error: {response.text}"