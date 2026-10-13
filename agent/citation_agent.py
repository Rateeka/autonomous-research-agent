import re


class CitationAgent:

    def __init__(self):
        pass

    # -----------------------------
    # Extract citation info (basic heuristic)
    # -----------------------------
    def extract_metadata(self, paper_text):

        title = self._extract_title(paper_text)
        year = self._extract_year(paper_text)
        authors = self._extract_authors(paper_text)
        doi = self._extract_doi(paper_text)

        return {
            "title": title,
            "year": year,
            "authors": authors,
            "doi": doi
        }

    # -----------------------------
    # APA format
    # -----------------------------
    def format_apa(self, meta):

        authors = meta["authors"] or "Unknown"
        year = meta["year"] or "n.d."
        title = meta["title"] or "No Title"

        return f"{authors} ({year}). {title}."

    # -----------------------------
    # IEEE format
    # -----------------------------
    def format_ieee(self, meta):

        authors = meta["authors"] or "Unknown"
        title = meta["title"] or "No Title"
        year = meta["year"] or "n.d."

        return f"{authors}, \"{title}\", {year}."

    # -----------------------------
    # Helpers
    # -----------------------------
    def _extract_title(self, text):

        match = re.search(r"Title[:\-]\s*(.*)", text, re.IGNORECASE)

        return match.group(1) if match else "Unknown Title"

    def _extract_year(self, text):

        match = re.search(r"(20\d{2})", text)

        return match.group(1) if match else None

    def _extract_authors(self, text):

        match = re.search(r"Authors?[:\-]\s*(.*)", text, re.IGNORECASE)

        return match.group(1) if match else "Unknown Authors"

    def _extract_doi(self, text):

        match = re.search(r"10\.\d{4,9}/[-._;()/:A-Z0-9]+", text, re.IGNORECASE)

        return match.group(0) if match else None


# -----------------------------
# TEST
# -----------------------------
if __name__ == "__main__":

    sample_text = """
    Title: Deep Learning for Agriculture
    Authors: John Smith, Ali Khan
    Year: 2024
    DOI: 10.1000/xyz123
    """

    agent = CitationAgent()

    meta = agent.extract_metadata(sample_text)

    print("APA:", agent.format_apa(meta))
    print("IEEE:", agent.format_ieee(meta))