import feedparser
import requests
import time


class SearchAgent:

    def search_papers(self, query, max_results=5):

        queries = self.build_queries(query)

        all_papers = []
        seen_urls = set()

        # Keywords from user query
        query_keywords = [
            word.lower()
            for word in query.split()
            if len(word) > 2
        ]

        for idx, q in enumerate(queries):

            if idx > 0:
                print("Waiting 3 seconds to comply with arXiv rate limits...")
                time.sleep(3)

            url = (
                "https://export.arxiv.org/api/query?"
                f"search_query=all:{q}"
                f"&start=0&max_results={max_results}"
            )

            print("Trying:", url)

            response_text = None

            retries = 3
            backoff = 2

            for attempt in range(retries):

                try:

                    headers = {
                        "User-Agent": "Research-Agent/1.0"
                    }

                    response = requests.get(
                        url,
                        headers=headers,
                        timeout=20
                    )

                    if response.status_code == 200:
                        response_text = response.text
                        break

                    print(f"HTTP {response.status_code}")

                except Exception as e:

                    print(e)

                time.sleep(backoff)
                backoff *= 2

            if response_text is None:
                continue

            feed = feedparser.parse(response_text)

            print("Found:", len(feed.entries))

            for entry in feed.entries:

                title = entry.title.strip()

                summary = entry.summary.lower()

                pdf_url = entry.id.replace("abs", "pdf") + ".pdf"

                if pdf_url in seen_urls:
                    continue

                score = 0

                # Score title
                for keyword in query_keywords:
                    if keyword in title.lower():
                        score += 3

                # Score abstract
                for keyword in query_keywords:
                    if keyword in summary:
                        score += 1

                # Skip unrelated papers
                if score < 3:
                    continue

                seen_urls.add(pdf_url)

                all_papers.append({

                    "title": title,

                    "summary": entry.summary,

                    "authors": [
                        a.name for a in entry.authors
                    ],

                    "published": entry.published,

                    "pdf_url": pdf_url,

                    "score": score

                })

        # Sort by relevance
        all_papers.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        # Return top papers
        return all_papers[:20]

    def build_queries(self, query):

        query = query.replace(" ", "+")

        return [

            query,

            query + "+deep+learning",

            query + "+cnn",

            query + "+transformer",

            query + "+computer+vision"

        ]