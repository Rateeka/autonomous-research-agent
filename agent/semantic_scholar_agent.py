import requests


class SemanticScholarAgent:

    def search(self, query, limit=5):

        url = "https://api.semanticscholar.org/graph/v1/paper/search"

        params = {
            "query": query,
            "limit": limit,
            "fields": "title,year,authors,url"
        }

        headers = {
            "User-Agent": "Mozilla/5.0 (AI Research Agent)"
        }

        try:
            response = requests.get(
                url,
                params=params,
                headers=headers,
                timeout=20
            )

            print("Status:", response.status_code)

            if response.status_code != 200:
                print("Response:", response.text)
                return []

            data = response.json()

            # DEBUG (IMPORTANT)
            print("Total papers:", data.get("total", 0))

            papers = []

            for paper in data.get("data", []):

                papers.append({
                    "title": paper.get("title"),
                    "year": paper.get("year"),
                    "url": paper.get("url"),
                    "authors": [
                        a.get("name") for a in paper.get("authors", [])
                    ]
                })

            return papers

        except Exception as e:
            print("Error:", e)
            return []