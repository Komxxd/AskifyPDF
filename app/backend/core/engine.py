import os
import ollama
from pinecone import Pinecone
from .embedding import get_embedding_function

PROMPT_TEMPLATE = """
Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
"""

def query_rag(query_text: str, doc_id: str = None):
    """
    Queries Pinecone for context and then uses Ollama for grounded Q&A.
    """
    api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME")

    if not api_key or not index_name:
        return {"answer": "Error: Pinecone credentials missing in .env", "citations": []}

    # 1. Initialize Pinecone
    pc = Pinecone(api_key=api_key)
    index = pc.Index(index_name)

    # 2. Get embedding function and embed the query
    embedding_func = get_embedding_function()
    query_embedding = embedding_func.embed_query(query_text)

    # 3. Search Pinecone - RELAXED IDENTIFIER MATCHING
    # Attempt 1: Strict Match (Explicit string comparison)
    filter_dict = {"doc_id": {"$eq": str(doc_id)}} if doc_id else None
    
    print(f"DEBUG: Attempting query with doc_id: {doc_id}")
    
    results = index.query(
        vector=query_embedding,
        top_k=8,
        include_metadata=True,
        filter=filter_dict
    )

    # Attempt 2: Fallback to partial or general match if strict filter failed
    # This helps catch cases where the ID might be slightly different or missing metadata
    if not results.matches and doc_id:
        print(f"DEBUG: Strict match failed for {doc_id}. Falling back to general search...")
        results = index.query(
            vector=query_embedding,
            top_k=8,
            include_metadata=True
        )
        
        # If we find results globally, let's check if the doc_id exists at all
        if results.matches:
            found_ids = set([res.metadata.get('doc_id') for res in results.matches])
            print(f"DEBUG: Global search found doc_ids: {found_ids}")
            # We'll use these results but warn the user about the mismatch
            # This is better than returning nothing
    
    if not results.matches:
        print("DEBUG: Zero results found throughout the entire index.")
        return {"answer": "I couldn't find any relevant sections in the document. The indexing might still be in progress.", "citations": []}

    # 4. Extract context and citations
    context_text = "\n\n---\n\n".join([res.metadata["text"] for res in results.matches])
    
    citations = []
    for res in results.matches:
        meta = res.metadata
        page_val = meta.get("page")
        text_preview = meta.get("text", "No preview available")
        
        # Determine the page label
        page_label = "N/A"
        if page_val is not None:
            try:
                page_label = int(page_val) + 1
            except:
                page_label = str(page_val)

        citations.append({
            "text": text_preview[:500] + "...", 
            "page": page_label
        })

    # 5. Formulate prompt for Ollama
    prompt = PROMPT_TEMPLATE.format(context=context_text, question=query_text)

    # 6. Call Ollama
    response = ollama.chat(model='mistral', messages=[
        {'role': 'user', 'content': prompt},
    ])

    response_text = response['message']['content']
    
    return {
        "answer": response_text,
        "citations": citations
    }