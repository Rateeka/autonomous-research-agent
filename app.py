from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

load_dotenv()

from agent.search_agent import SearchAgent
from agent.pdf_agent import PDFAgent
from agent.text_extractor import TextExtractor
from agent.analysis_agent import AnalysisAgent
from agent.verification_agent import VerificationAgent
from agent.citation_agent import CitationAgent
from agent.report_agent import ReportAgent
from rag.chunker import TextChunker
from rag.embedding_client import EmbeddingClient
from rag.vector_store import VectorStore
from database.mongodb import MongoDB
from api.auth_routes import auth

from api.routes import api, init_routes

app=Flask(__name__)

app.config["JWT_SECRET_KEY"]=os.getenv("JWT_SECRET_KEY")
jwt=JWTManager(app)
db=MongoDB()
CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
)

def run_pipeline(query, callback=None):
    def update(step, progress, message, data=None):
        if callback:
            callback(step, progress, message, data=data)

    update("search", 10, "Searching relevant research papers on arXiv...")
    papers = SearchAgent().search_papers(query)
    update("search", 20, f"Found {len(papers)} research papers. Initializing downloads...", data={"papers": papers})

    if not papers:
        # If no papers found, save empty research and finish
        reports = {"docx": "", "pdf": "", "ppt": ""}
        empty_res = {"papers": [], "summaries": [], "verification": {"is_reliable": False, "reason": "No papers found"}, "citations": [], "reports": reports}
        db.save_research(query, [], [], empty_res["verification"], [], reports)
        return empty_res

    update("download", 30, "Downloading PDF documents for academic analysis...")
    pdfs = PDFAgent().download_papers(papers)
    update("download", 40, f"Successfully downloaded {len(pdfs)} paper PDFs. Starting text extraction...")

    update("extract", 45, "Extracting text contents from downloaded PDF files...")
    ex = TextExtractor()
    extracted = {f: ex.extract_text(f) for f in pdfs}
    
    update("chunk", 55, "Segmenting document text into logical paragraphs/chunks...")
    all_chunks = []
    chunker = TextChunker()
    for pdf, text in extracted.items():
        for ch in chunker.chunk_text(text, 800, 100):
            all_chunks.append({"paper": pdf, "chunk": ch})
    all_chunks = all_chunks[:500]
    
    update("embed", 60, f"Generating Nomical Vector Embeddings for {len(all_chunks)} chunks...")
    embedder = EmbeddingClient()
    store = VectorStore()
    
    for i, item in enumerate(all_chunks):
        emb = embedder.embed(item["chunk"])
        if emb:
            store.add(emb, item)
        if i > 0 and i % 50 == 0:
            update("embed", 60 + int((i / len(all_chunks)) * 10), f"Generating vector embeddings ({i}/{len(all_chunks)} chunks)...")

    update("index", 70, "Indexing embeddings into local FAISS vector space...")
    qemb = embedder.embed(query)
    rel = store.search(qemb, 5)

    update("analyze", 75, "Running analysis agent with local LLM on matching chunks...")
    analyzer = AnalysisAgent()
    summaries = []
    for idx, item in enumerate(rel):
        update("analyze", 75 + idx * 2, f"Analyzing matching text chunk {idx+1}/{len(rel)}...")
        s = analyzer.analyze(item["chunk"])
        s["paper"] = item["paper"]
        summaries.append(s)

    update("verify", 85, "Running verification agent to check reliability and factuality...")
    verification = VerificationAgent().verify(summaries)

    update("cite", 90, "Running citation agent to format APA bibliographical references...")
    citer = CitationAgent()
    citations = [
        citer.format_apa({"title": p.get("title", "Unknown Title"), "authors": ", ".join(p.get("authors", ["Unknown"])), "year": "2025"}) 
        for p in papers
    ]

    update("report", 95, "Running report compiler to build PDF, DOCX, and PPTX briefs...")
    reporter = ReportAgent()
    reports = {
        "docx": reporter.generate_docx(query, summaries, citations),
        "pdf": reporter.generate_pdf(query, summaries, citations),
        "ppt": reporter.generate_ppt(query, summaries)
    }

    update("save", 98, "Writing all research, analysis, and report links to MongoDB database...")
    db.save_research(query, papers, summaries, verification, citations, reports)

    result = {
        "papers": papers,
        "summaries": summaries,
        "verification": verification,
        "citations": citations,
        "reports": reports
    }
    return result

init_routes(run_pipeline)
app.register_blueprint(api,url_prefix="/api")
app.register_blueprint(auth,url_prefix="/api")

@app.route("/")
def home():
    return {"message":"Autonomous Research Agent API","status":"Running"}

if __name__=="__main__":
    app.run(host="0.0.0.0",port=5000,debug=True)
