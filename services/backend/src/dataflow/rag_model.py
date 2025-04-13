import os
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
import getpass
from langchain_mistralai import ChatMistralAI
from dotenv import load_dotenv
import mlflow
from mlflow.exceptions import MlflowException
import time
import uuid

from src.dataflow.store_data import get_blob_from_bucket

load_dotenv(override=True)
FAISS_INDEX_FOLDER=os.getenv("FAISS_INDEX_FOLDER")
# Set your MistralAI API key
if not os.getenv("MISTRAL_API_KEY"):
    os.environ["MISTRAL_API_KEY"] = getpass.getpass("Enter API key for MistralAI: ")

# Set MLflow tracking URI (optional - use if you have a remote tracking server)
# If not set, MLflow will use a local directory (./mlruns) by default
if os.getenv("MLFLOW_TRACKING_URI"):
    mlflow.set_tracking_uri(os.getenv("MLFLOW_TRACKING_URI"))

# Define the experiment name for our RAG system
EXPERIMENT_NAME = "rag_mistral_system"

def get_or_create_experiment(experiment_name):
    """
    Find an existing MLflow experiment or create it if it doesn't exist.
    If it exists but is deleted, create a new one with a timestamp.
    
    Args:
        experiment_name: Name of the experiment to find or create
        
    Returns:
        experiment_id: ID of the existing or newly created experiment
    """
    # Check if experiment exists
    try:
        experiment = mlflow.get_experiment_by_name(experiment_name)
        
        if experiment is not None:
            # Check if experiment is active (not deleted)
            if experiment.lifecycle_stage == "active":
                print(f"Found active experiment '{experiment_name}' with ID: {experiment.experiment_id}")
                return experiment.experiment_id
            else:
                # Experiment exists but is deleted, create a new one with timestamp
                new_name = f"{experiment_name}_{int(time.time())}"
                experiment_id = mlflow.create_experiment(new_name)
                print(f"Original experiment was deleted. Created new experiment '{new_name}' with ID: {experiment_id}")
                return experiment_id
        else:
            # Create new experiment
            experiment_id = mlflow.create_experiment(experiment_name)
            print(f"Created new experiment '{experiment_name}' with ID: {experiment_id}")
            return experiment_id
    except Exception as e:
        print(f"Error getting or creating experiment: {e}")
        # Fallback - create a new experiment with timestamp
        new_name = f"{experiment_name}_{int(time.time())}"
        experiment_id = mlflow.create_experiment(new_name)
        print(f"Created fallback experiment '{new_name}' with ID: {experiment_id}")
        return experiment_id

# Initialize embeddings model
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def get_rag_response(query, vector_store, llm, k=2, run_id=None):
    """
    Generate RAG response with MLflow tracking for the query
    
    Args:
        query: User query
        vector_store: FAISS vector store
        llm: Language model
        k: Number of documents to retrieve
        run_id: MLflow run ID for tracking
    
    Returns:
        The response text
    """
    start_time = time.time()
    
    # Your prompt template
    template = """Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.
Always say "thanks for asking!" at the end of the answer.
{context}
Question: {question}
Helpful Answer:"""
    custom_rag_prompt = PromptTemplate.from_template(template)
    
    # Step 1: Retrieve relevant documents from vector store
    retrieval_start = time.time()
    docs = vector_store.similarity_search(query, k=k)
    retrieval_time = time.time() - retrieval_start
    
    # Step 2: Format the context (join the document contents)
    context = "\n\n".join([doc.page_content for doc in docs])
    
    # Step 3: Format the prompt with context and question
    formatted_prompt = custom_rag_prompt.format(context=context, question=query)
    
    # Step 4: Create an LLM chain with the prompt
    chain = LLMChain(llm=llm, prompt=custom_rag_prompt)
    
    # Step 5: Run the chain to get the response
    generation_start = time.time()
    response = chain.invoke({"context": context, "question": query})
    generation_time = time.time() - generation_start
    
    total_time = time.time() - start_time
    
    # Log metrics to MLflow in a nested run to avoid interference with parent run
    try:
        # Generate a unique run ID for this nested run
        nested_run_id = f"nested_run_{uuid.uuid4().hex[:8]}"
        
        # First, check if there's an active run and end it to avoid conflicts
        active_run = mlflow.active_run()
        if active_run is not None and active_run.info.run_id == run_id:
            # We're in the parent run, so use nested=True
            with mlflow.start_run(run_name=nested_run_id, nested=True):
                # Log timing metrics
                mlflow.log_metric("retrieval_time", retrieval_time)
                mlflow.log_metric("generation_time", generation_time)
                mlflow.log_metric("total_response_time", total_time)
                
                # Log the number of retrieved documents
                mlflow.log_metric("num_retrieved_docs", len(docs))
                
                # Log the query and response as artifacts
                with open("query.txt", "w") as f:
                    f.write(query)
                with open("response.txt", "w") as f:
                    f.write(response["text"])
                with open("context.txt", "w") as f:
                    f.write(context)
                    
                mlflow.log_artifact("query.txt")
                mlflow.log_artifact("response.txt")
                mlflow.log_artifact("context.txt")
        else:
            # We're not in a parent run, so create a standalone run
            with mlflow.start_run(run_name=nested_run_id):
                # Log timing metrics
                mlflow.log_metric("retrieval_time", retrieval_time)
                mlflow.log_metric("generation_time", generation_time)
                mlflow.log_metric("total_response_time", total_time)
                
                # Log the number of retrieved documents
                mlflow.log_metric("num_retrieved_docs", len(docs))
                
                # Log the query and response as artifacts
                with open("query.txt", "w") as f:
                    f.write(query)
                with open("response.txt", "w") as f:
                    f.write(response["text"])
                with open("context.txt", "w") as f:
                    f.write(context)
                    
                mlflow.log_artifact("query.txt")
                mlflow.log_artifact("response.txt")
                mlflow.log_artifact("context.txt")
    except Exception as e:
        # If MLflow logging fails, just continue without stopping the RAG process
        print(f"Warning: Failed to log metrics to MLflow: {e}")
    
    return response["text"]

# Example usage:
# Global variables to cache vector store
_vector_store = None
_vector_store_last_updated = 0
_vector_store_update_interval = 3600  # Update interval in seconds (1 hour)

def download_faiss_index():
    """
    Download FAISS index from cloud storage.
    Returns True if download was successful, False otherwise.
    """
    try:
        bucket = get_blob_from_bucket()
        blobs = bucket.list_blobs(prefix=FAISS_INDEX_FOLDER)
        files_downloaded = False
        
        for blob in blobs:
            # Skip if the blob name is the same as the prefix (this is the "directory" itself)
            if blob.name == FAISS_INDEX_FOLDER:
                continue
        
            # Get the relative path of the blob from the prefix
            relative_path = blob.name[len(FAISS_INDEX_FOLDER):].lstrip('/')
        
            # Create the full destination path
            destination_file_path = os.path.join('faiss_index_local', relative_path)
        
            # Create subdirectories if needed
            os.makedirs(os.path.dirname(destination_file_path), exist_ok=True)
        
            # Download the blob
            blob.download_to_filename(destination_file_path)
            print(f"Downloaded {blob.name} to {destination_file_path}")
            files_downloaded = True
            
        return files_downloaded
    except Exception as e:
        print(f"Error downloading FAISS index: {e}")
        return False

def get_vector_store():
    """
    Get the vector store, downloading it if necessary or if it's time to refresh.
    """
    global _vector_store, _vector_store_last_updated, _vector_store_update_interval
    
    current_time = time.time()
    
    # Check if we need to initialize or update the vector store
    if (_vector_store is None or 
        current_time - _vector_store_last_updated > _vector_store_update_interval):
        
        # Check if local index exists
        if not os.path.exists('faiss_index_local'):
            print("Local FAISS index not found. Downloading...")
            download_faiss_index()
        elif current_time - _vector_store_last_updated > _vector_store_update_interval:
            print("FAISS index may be outdated. Checking for updates...")
            download_faiss_index()
        
        # Load vector store
        try:
            _vector_store = FAISS.load_local("faiss_index_local", embeddings, 
                                           allow_dangerous_deserialization=True)
            _vector_store_last_updated = current_time
            print("Vector store loaded successfully")
        except Exception as e:
            print(f"Error loading vector store: {e}")
            # If loading fails and we don't have a vector store yet, try downloading again
            if _vector_store is None:
                print("Attempting to download FAISS index again...")
                if download_faiss_index():
                    _vector_store = FAISS.load_local("faiss_index_local", embeddings, 
                                                  allow_dangerous_deserialization=True)
                    _vector_store_last_updated = current_time
    
    return _vector_store

def generate_response(query):
    try:
        # Make sure no runs are active when we start
        try:
            if mlflow.active_run():
                mlflow.end_run()
        except:
            pass
        
        # Find or create MLflow experiment with improved error handling
        experiment_id = get_or_create_experiment(EXPERIMENT_NAME)
        
        # Generate a unique run ID
        run_id = f"rag_query_{uuid.uuid4().hex[:8]}"
        
        # Start an MLflow run with proper error handling
        try:
            mlflow.set_experiment(experiment_id)
            active_run = mlflow.start_run(run_name=run_id)
            run_id = active_run.info.run_id
        except MlflowException as e:
            # If we can't set the experiment, create a new one with timestamp
            print(f"Error setting experiment: {e}")
            new_experiment_id = get_or_create_experiment(f"{EXPERIMENT_NAME}_{int(time.time())}")
            mlflow.set_experiment(new_experiment_id)
            active_run = mlflow.start_run(run_name=run_id)
            run_id = active_run.info.run_id
        
        try:
            # Log parameters
            mlflow.log_param("embedding_model", "all-MiniLM-L6-v2")
            mlflow.log_param("llm_model", "mistral-tiny-latest")
            mlflow.log_param("k_documents", 2)
            mlflow.log_param("query", query)
            
            # Get vector store (cached if possible)
            vector_store = get_vector_store()
            if vector_store is None:
                raise Exception("Failed to load vector store")
                
            # Log the vector store path and update time
            mlflow.log_param("vector_store_path", "faiss_index_local")
            mlflow.log_param("vector_store_last_updated", _vector_store_last_updated)
            
            # Initialize MistralAI chat model
            llm = ChatMistralAI(
                model="mistral-tiny-latest",
                temperature=0
            )
            
            # Get RAG response and track it with MLflow
            response = get_rag_response(query, vector_store, llm, run_id=run_id)
            
            # Log the response as a parameter
            mlflow.log_param("response", response)
            
            # End the run properly
            mlflow.end_run()
            
            return response
        except Exception as e:
            # Log the error in the current run if possible
            try:
                mlflow.log_param("error", str(e))
                mlflow.set_tag("status", "failed")
            except:
                pass
            
            # End the run
            try:
                mlflow.end_run()
            except:
                pass
                
            raise e  # Re-raise the exception
    except Exception as e:
        # Start a new error run if all else fails
        try:
            with mlflow.start_run(run_name=f"error_run_{int(time.time())}") as error_run:
                mlflow.log_param("error", str(e))
                mlflow.log_param("query", query)
                mlflow.set_tag("status", "failed")
        except:
            pass
            
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        
        # Return an error message to the user
        return f"I'm sorry, but there was an error processing your query. Technical details: {str(e)}"


if __name__ == "__main__":
    # Enable autologging (optional)
    mlflow.autolog()
    
    response = generate_response("tell me about khoury college?")
    print(response)
    
    # You can view the MLflow UI by running:
    # mlflow ui
    # Then visit http://localhost:5000 in your browser