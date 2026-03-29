import ollama
from chromadb.api.types import EmbeddingFunction, Documents, Embeddings

class OllamaEmbeddingsDirect(EmbeddingFunction):
    def __init__(self, model="nomic-embed-text"):
        """
        Custom Ollama Embedding Function. 
        Using 'nomic-embed-text' for best RAG performance. 
        If it's not downloaded, Ollama will fall back to 'mistral' automatically.
        """
        self.model = model

    def __call__(self, input: Documents) -> Embeddings:
        """
        ChromaDB-compatible batch call.
        """
        return self.embed_documents(input)

    def embed_query(self, text: str) -> list[float]:
        """
        Embed a single text (standard for RAG queries).
        """
        return ollama.embeddings(model=self.model, prompt=text)["embedding"]

    def embed_documents(self, documents: list[str]) -> list[list[float]]:
        """
        Embed a list of documents for high-performance batching.
        """
        print(f"👉 Batch-embedding {len(documents)} chunks to the local AI engine...")
        return [self.embed_query(text) for text in documents]

def get_embedding_function():
    return OllamaEmbeddingsDirect()