from llm.llm_client import LLMClient
import json
import re


class AnalysisAgent:

    def __init__(self):
        self.llm = LLMClient()

    def analyze(self, text):

        prompt = f"""
You are an expert AI research assistant.

Analyze ONLY the research paper content below.

{text[:8000]}

Return ONLY valid JSON in this format:

{{
    "objective": "",
    "dataset": "",
    "model": "",
    "accuracy": "",
    "limitations": ""
}}

Rules:
- Do NOT translate the language.
- Do NOT invent information.
- Do NOT explain your reasoning.
- If information is missing, return "Not Found".
- Return ONLY JSON.
"""

        try:

            response = self.llm.generate(prompt)

            print("\n===== RAW LLM OUTPUT =====\n")
            print(response)
            print("\n==========================\n")

            # Remove markdown
            response = response.strip()
            response = response.replace("```json", "")
            response = response.replace("```", "")

            # Fix smart quotes
            response = response.replace("“", "\"")
            response = response.replace("”", "\"")
            response = response.replace("‘", "'")
            response = response.replace("’", "'")

            # Extract JSON only
            match = re.search(r"\{.*\}", response, re.DOTALL)

            if match:
                response = match.group()

            data = json.loads(response)

            # -----------------------------
            # Normalize possible key names
            # -----------------------------

            aliases = {

                "objectived": "objective",

                "objectivity": "objective",

                "model_used": "model",

                "accuracy_level": "accuracy"

            }

            for old_key, new_key in aliases.items():

                if old_key in data:
                    data[new_key] = data.pop(old_key)

            # -----------------------------
            # Ensure all required keys exist
            # -----------------------------

            required = [

                "objective",

                "dataset",

                "model",

                "accuracy",

                "limitations"

            ]

            for key in required:

                if key not in data:
                    data[key] = "Not Found"

                value = str(data[key]).strip()

                if value.lower() in [

                    "",

                    "none",

                    "null",

                    "unknown",

                    "n/a",

                    "parsing failed"

                ]:

                    data[key] = "Not Found"

                else:

                    data[key] = value

            return data

        except Exception as e:

            print("Analysis Error:", e)

            return {

                "objective": "Not Found",

                "dataset": "Not Found",

                "model": "Not Found",

                "accuracy": "Not Found",

                "limitations": "Not Found"

            }


# ---------------------------------
# TEST
# ---------------------------------

if __name__ == "__main__":

    sample_text = """
    This paper proposes a CNN model for plant disease detection.

    Dataset: PlantVillage

    Accuracy: 96%

    Limitation: Small dataset.
    """

    agent = AnalysisAgent()

    result = agent.analyze(sample_text)

    print(result)