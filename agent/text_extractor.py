import fitz
import os


class TextExtractor:

    def extract_text(self, pdf_path):
        try:
            doc = fitz.open(pdf_path)
            text = ""

            for page in doc[:5]:
                text += page.get_text()

            doc.close()
            return text

        except Exception as e:
            print(f"Error extracting {pdf_path}: {e}")
            return ""

    def extract_folder(self, folder_path):
        results = {}

        for file in os.listdir(folder_path):
            if file.endswith(".pdf"):
                pdf_path = os.path.join(folder_path, file)
                text = self.extract_text(pdf_path)
                results[file] = text

                print(f"Extracted {file} | Characters: {len(text)}")

        return results