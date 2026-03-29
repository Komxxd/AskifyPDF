import os
import pypdf
from pinecone import Pinecone
from .embedding import get_embedding_function

# Credentials will be fetched dynamically inside functions

def split_documents(documents, chunk_size=800, overlap=80):
    chunks = []
    for doc in documents:
        text = doc["text"]
        metadata = doc["metadata"]
        start = 0
        chunk_idx = 0
        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end]
            # Create a unique ID for each chunk based on source, page, and index
            chunk_id = f"{metadata['source']}:{metadata['page']}:{chunk_idx}"
            chunks.append({
                "text": chunk_text,
                "metadata": {**metadata, "id": chunk_id}
            })
            start += (chunk_size - overlap)
            chunk_idx += 1
    return chunks

def add_to_pinecone(chunks):
    """
    Connects to Pinecone and upserts the document chunks in one single batch.
    """
    # Dynamic fetch of credentials
    api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME")

    if not api_key or not index_name:
        print("❌ Error: Pinecone credentials missing in .env")
        return

    # 1. Initialize Pinecone
    pc = Pinecone(api_key=api_key)
    index = pc.Index(index_name)
    
    # 2. Get embedding function
    embedding_func = get_embedding_function()
    
    # 3. Batch Prepare Data
    print(f"👉 Preparation complete. Processing {len(chunks)} chunks... one moment.")

    texts = [c["text"] for c in chunks]
    
    # Batch Call to Embeddings
    embeddings = embedding_func.embed_documents(texts)
    
    # Prepare Vectors for Pinecone upsert
    vectors_to_upsert = []
    for i, chunk in enumerate(chunks):
        vectors_to_upsert.append((
            chunk["metadata"]["id"], 
            embeddings[i], 
            {
                "text": chunk["text"], 
                "source": chunk["metadata"]["source"],
                "page": chunk["metadata"]["page"],
                "doc_id": chunk["metadata"].get("doc_id", "unknown")
            }
        ))
        
    print(f"👉 Uploading {len(chunks)} vectors to Pinecone cloud...")

    # 4. Final Cloud Upsert (pinecone-client handles batches of 100 perfectly)
    index.upsert(vectors=vectors_to_upsert)

    print(f"✅ Successfully cloud-indexed {len(chunks)} chunks for {index_name}")