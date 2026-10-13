from agent.search_agent import SearchAgent
from agent.semantic_scholar_agent import SemanticScholarAgent
import time


class MultiSearchAgent:

    def __init__(self):
        self.arxiv = SearchAgent()
        self.semantic = SemanticScholarAgent()

    # -----------------------------
    # QUERY EXPANSION (IMPORTANT)
    # -----------------------------
    def expand_query(self, query):

        return [
            query,
            "plant disease detection deep learning",
            "crop disease classification CNN",
            "agriculture image classification AI"
        ]

    # -----------------------------
    # MAIN SEARCH FUNCTION
    # -----------------------------
    def search(self, query, max_results=5):

        all_results = []
        queries = self.expand_query(query)

        for q in queries:

            print(f"\nSearching: {q}")

            # -----------------
            # 1. ARXIV SEARCH
            # -----------------
            try:
                arxiv_results = self.arxiv.search_papers(q, max_results)
                all_results.extend(arxiv_results)
                print("Arxiv:", len(arxiv_results))

            except Exception as e:
                print("Arxiv error:", e)

            time.sleep(1)  # avoid rate issues

            # -----------------------------
            # 2. SEMANTIC SCHOLAR SEARCH
            # -----------------------------
            try:
                semantic_results = self.semantic.search(q, max_results)
                all_results.extend(semantic_results)
                print("Semantic:", len(semantic_results))

            except Exception as e:
                print("Semantic error:", e)

            time.sleep(1)

        # -----------------------------
        # REMOVE DUPLICATES
        # -----------------------------
        unique = self.deduplicate(all_results)

        return unique

    # -----------------------------
    # DEDUPLICATION LOGIC
    # -----------------------------
    def deduplicate(self, papers):

        seen = set()
        unique_papers = []

        for p in papers:

            title = p.get("title", "").lower()

            if title not in seen:
                seen.add(title)
                unique_papers.append(p)

        return unique_papers