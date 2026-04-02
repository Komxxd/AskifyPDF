import os
import pypdf
import httpx
import tempfile
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env BEFORE any other imports to ensure credentials are available
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

from core.embedding import get_embedding_function
from core.engine import query_rag
from core.processor import split_documents, add_to_pinecone

app = FastAPI(title="AskifyPDF AI Engine")

# CORS setup for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    doc_id: str

class ProcessRequest(BaseModel):
    storage_path: str
    user_id: str
    doc_id: str

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "AskifyPDF-AI-Engine-Pinecone",
    }

@app.post("/api/process")
async def process_document(req: ProcessRequest):
    """
    Downloads the PDF from Supabase, chunks it, and indexes it into Pinecone.
    """
    supabase_url = os.getenv("SUPABASE_URL")
    bucket = "documents"
    
    url = f"{supabase_url}/storage/v1/object/public/{bucket}/{req.storage_path}"
    print(f"DEBUG: Processing request for: {url}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Failed to download PDF from Supabase: {response.text}")
            
            # Use OS temp directory instead of local 'data' folder
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
                tmp_file.write(response.content)
                pdf_path = tmp_file.name

        # 1. Parse PDF
        documents = []
        reader = pypdf.PdfReader(pdf_path)
        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                documents.append({
                    "text": text,
                    "metadata": {"source": req.storage_path, "page": page_num, "doc_id": req.doc_id}
                })

        # 2. Chunking
        chunks = split_documents(documents)

        # 3. Add to Pinecone
        add_to_pinecone(chunks)

        # Cleanup temp file
        os.remove(pdf_path)

        return {"status": "success", "message": f"Cloud-indexed {len(chunks)} chunks for {req.storage_path}"}

    except Exception as e:
        print(f"Error processing doc: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def query_document(req: QueryRequest):
    """
    Performs RAG query on indexed documents in Pinecone.
    """
    try:
        # Pass the specific doc_id to narrow down the search
        result = query_rag(req.query, doc_id=req.doc_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
