from llm.llm_client import LLMClient
import json
import re


class PlannerAgent:

    def __init__(self):
        self.llm = LLMClient()

    # --------------------------
    # CLEAN LLM OUTPUT
    # --------------------------
    def sanitize_llm_output(self, text):

        text = text.strip()

        # remove markdown
        text = text.replace("```json", "").replace("```", "")

        # fix smart quotes
        text = text.replace("“", "\"").replace("”", "\"")

        # remove trailing commas
        text = re.sub(r",\s*}", "}", text)
        text = re.sub(r",\s*]", "]", text)

        return text

    # --------------------------
    # MAIN PLANNER FUNCTION
    # --------------------------
    def create_plan(self, query):

        prompt = f"""
You are a JSON generator for an AI system.

Return ONLY valid JSON.

No markdown. No explanation. No extra text.

Format:
{{
  "search": true,
  "download_pdfs": true,
  "extract_text": true,
  "chunk_text": true,
  "analysis": true,
  "verification": true,
  "citation": true,
  "report": true
}}

Query: {query}
"""

        response = self.llm.generate(prompt)

        # CLEAN OUTPUT
        response = self.sanitize_llm_output(response)

        # PARSE JSON SAFELY
        try:
            return json.loads(response)

        except Exception as e:
            return {
                "error": str(e),
                "raw_output": response
            }