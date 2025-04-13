import json
import os
import pandas as pd
import google.cloud.storage as storage
from dotenv import load_dotenv
from langchain.schema import Document
import json
from uuid import uuid4
import nltk
from nltk.tokenize import sent_tokenize
import faiss

from store_data import upload_faiss_index_to_bucket
nltk.download('punkt')
load_dotenv(override=True)
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
BUCKET_NAME = os.getenv("BUCKET_NAME")
RAW_DATA_FOLDER = os.getenv("RAW_DATA_FOLDER")
def fetch_data( ):
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    blobs = bucket.list_blobs(prefix=RAW_DATA_FOLDER)
    result=[]
    for blob in blobs:
        content=blob.download_as_text()
        content=json.loads(content) 
        result.append(content)

    with open("data.json", "w") as f:
        json.dump(result, f)
    return 

def chunk_data( ):
    with open("data.json", "r") as f:
        data=json.load(f)
    for item in data:
        text=item["text"]
        sentences = sent_tokenize(text)
    
    chunks = []
    for i in range(0, len(sentences), 2):
        chunk = ' '.join(sentences[i:i + 2])
        chunks.append(chunk)
    return chunks

def create_new_index_with_local_embeddings():
    """Create a new vector store using local HuggingFace embeddings"""
    # Load document chunks
    with open("data.json", "r") as f:
        chunks = json.load(f)
    
    # Create Document objects
    documents = [Document(page_content=chunk['text'], metadata={'source': chunk['url']}) for chunk in chunks]
    
    # Create vector store
    print(f"Creating new vector store with {len(documents)} documents...")
    vector_store = FAISS.from_documents(documents, embeddings)
    
    # Save to a new location
    vector_store.save_local("faiss_index")
    print("Saved new vector store to faiss_index/")
    
    return vector_store




if __name__ == "__main__":
    fetch_data()
    chunks=chunk_data()
    print("chunking done")
    create_new_index_with_local_embeddings()
    upload_faiss_index_to_bucket()
