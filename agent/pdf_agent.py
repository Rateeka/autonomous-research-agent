import os
import requests
from urllib.parse import urlparse

PAPERS_DIR = "papers"
os.makedirs(PAPERS_DIR, exist_ok=True)


class PDFAgent:

    # -------------------------
    # Create safe filename
    # -------------------------
    def get_filename(self, url, title=None):

        if title:
            safe_title = "".join(
                c for c in title if c.isalnum() or c in (" ", "_")
            ).strip().replace(" ", "_")

            return safe_title[:120] + ".pdf"

        path = urlparse(url).path
        filename = os.path.basename(path)

        if not filename.endswith(".pdf"):
            filename += ".pdf"

        return filename

    # -------------------------
    # Download single PDF
    # -------------------------
    def download_pdf(self, url, title=None):

        try:
            filename = self.get_filename(url, title)
            file_path = os.path.join(PAPERS_DIR, filename)

            # skip if already exists
            if os.path.exists(file_path):
                print(f"[SKIP] {filename}")
                return file_path

            headers = {
                "User-Agent": "Mozilla/5.0 (Research-Agent)"
            }

            response = requests.get(url, headers=headers, timeout=30)

            if response.status_code != 200:
                print(f"[ERROR] Failed: {url}")
                return None

            with open(file_path, "wb") as f:
                f.write(response.content)

            print(f"[DOWNLOADED] {filename}")
            return file_path

        except Exception as e:
            print(f"[EXCEPTION] {url} -> {e}")
            return None

    # -------------------------
    # Batch download
    # -------------------------
    def download_papers(self, papers):

        downloaded = []

        for paper in papers:

            url = paper.get("pdf_url")
            title = paper.get("title")

            if not url:
                continue

            file_path = self.download_pdf(url, title)

            if file_path:
                downloaded.append(file_path)

        return downloaded