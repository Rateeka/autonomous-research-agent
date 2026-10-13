# config.py

import os

# -------------------------
# Folders
# -------------------------
PAPERS_DIR = "papers"
REPORTS_DIR = "reports"
VECTOR_DB_PATH = "vector_store/faiss.index"

# -------------------------
# Ollama
# -------------------------
OLLAMA_URL = "http://localhost:11434"

# LLM Model
OLLAMA_MODEL = "gemma3:1b"

# Embedding Model
EMBEDDING_MODEL = "nomic-embed-text"

# -------------------------
# Search Settings
# -------------------------
MAX_PAPERS = 5
MAX_RESULTS = 5

# -------------------------
# MongoDB
# -------------------------
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "research_agent"
COLLECTION_NAME = "research_runs"

# -------------------------
# Create folders automatically
# -------------------------
os.makedirs(PAPERS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs("vector_store", exist_ok=True)