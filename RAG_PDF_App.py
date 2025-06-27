from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
import os
import uuid
import re
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables from .env file
load_dotenv()
api_key = os.getenv("API_KEY")
if not api_key:
    raise RuntimeError("API_KEY is not set in the environment or .env file.")
os.environ["OPENAI_API_KEY"] = api_key
os.environ["OPENAI_API_BASE"] = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

# MongoDB setup - Using environment variables
def get_database():
    try:
        # Get MongoDB connection string directly from .env file
        mongo_uri = os.getenv("MONGODB_URI")
        
        if not mongo_uri:
            return None
            
        client = MongoClient(mongo_uri)
        # Test the connection
        client.server_info()  # This will raise an exception if connection fails
        return client.rag_app_db  # database name
    except Exception as e:
        return None

def validate_email(email):
    """Validate email format using regex"""
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def log_email(email):
    """Log email with timestamp to MongoDB"""
    try:
        db = get_database()
        if db is not None:  # Proper way to check if database connection exists
            user_collection = db.users
            timestamp = datetime.now()
            result = user_collection.insert_one({
                "email": email,
                "timestamp": timestamp
            })
            # Check if insertion was successful
            return bool(result.inserted_id)
        return False
    except Exception as e:
        return False

# Global cache for the embedding model
_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return _embedding_model

class RAGApplication:
    def __init__(self):
        # Do not load embeddings here
        # Use OpenRouter for LLM responses
        model_name = os.getenv("OPENROUTER_MODEL", "mistralai/mistral-7b-instruct")  # Default to Mistral if not set
        self.llm = ChatOpenAI(
            model_name=model_name,
            temperature=0,
            openai_api_base=os.getenv("OPENAI_API_BASE", "https://openrouter.ai/api/v1"),
            openai_api_key=os.getenv("OPENROUTER_API_KEY")
        )
        self.vector_store = None
        self.persist_directory = "vector_store"

    def process_pdf(self, pdf_bytes):
        """Process uploaded PDF file and create vector store"""
        try:
            # Create a unique temporary file name
            temp_pdf_path = f"temp_{uuid.uuid4()}.pdf"
            # Save uploaded file temporarily
            with open(temp_pdf_path, "wb") as f:
                f.write(pdf_bytes)
            
            # Load and split the PDF
            loader = PyPDFLoader(temp_pdf_path)
            documents = loader.load()
            
            # Split text into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=600,
                chunk_overlap=100,
                length_function=len
            )
            texts = text_splitter.split_documents(documents)
            
            # Lazily load and cache the embedding model
            embeddings = get_embedding_model()
            # Create vector store
            self.vector_store = FAISS.from_documents(
                documents=texts,
                embedding=embeddings
            )
            
            # Clean up temporary file
            os.remove(temp_pdf_path)
            return len(texts)
        except Exception as e:
            print("PDF processing error:", e)
            return 0

    def get_answer(self, query):
        """Get answer for the query using RAG"""
        try:
            if not self.vector_store:
                return "Please upload a PDF document first."
            
            # Create retrieval chain
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vector_store.as_retriever(
                    search_kwargs={"k": 3}
                )
            )
            
            # Get answer
            response = qa_chain.invoke({"query": query})
            return response["result"]
        except Exception as e:
            return f"Error generating answer: {str(e)}"
