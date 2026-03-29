import os
import ollama
from pinecone import Pinecone
from .embedding import get_embedding_function
# Credentials will be fetched dynamically inside functions

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
        return "Error: Pinecone credentials missing in .env"

    # 1. Initialize Pinecone
    pc = Pinecone(api_key=api_key)
    index = pc.Index(index_name)

    # 2. Get embedding function and embed the query
    embedding_func = get_embedding_function()
    query_embedding = embedding_func.embed_query(query_text)

    # 3. Search Pinecone
    # Optional: filter by doc_id if provided
    filter_dict = {"doc_id": doc_id} if doc_id else None
    
    results = index.query(
        vector=query_embedding,
        top_k=5,
        include_metadata=True,
        filter=filter_dict
    )

    if not results.matches:
        return "Unable to find relevant context in the document."

    # 4. Extract context and sources
    context_text = "\n\n---\n\n".join([res.metadata["text"] for res in results.matches])
    sources = [res.id for res in results.matches]

    # 5. Formulate prompt for Ollama
    prompt = PROMPT_TEMPLATE.format(context=context_text, question=query_text)

    # 6. Call Ollama
    response = ollama.chat(model='mistral', messages=[
        {'role': 'user', 'content': prompt},
    ])

    response_text = response['message']['content']
    print(f"Response: {response_text}\nSources: {sources}")

    return response_text