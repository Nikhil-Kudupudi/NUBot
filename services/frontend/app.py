import streamlit as st
import requests
import os
from dotenv import load_dotenv

load_dotenv(override=True)

# Load API URL from environment variable
API_URL = os.getenv("API_URL", "http://localhost:8000/api/chat")

# Streamlit app config
st.set_page_config(page_title="NU Bot", page_icon="🤖", layout="centered")
st.title("🤖 NU Bot")
st.markdown("### Smart Chatbot for Northeastern University")

# Input field for user questions
user_input = st.text_input("Ask NU Bot a question:", "")

# Display response
if user_input:
    try:
        response = requests.post(API_URL, json={"query": user_input},verify=False)
        # print(response.json())
        if response.status_code == 200:
            answer = response.json().get("answer", "No answer provided.")
        else:
            answer = f"Error: {response.status_code} - {response.text}"
    except Exception as e:
        answer = f"An error occurred: {e}"

    st.markdown(f"**NU Bot says:** {answer}")

# Technologies
with st.expander("🔧 Technologies Used"):
    st.markdown("""
    - Google Cloud Platform (GCP)
    - Mistral AI
    - Python
    - GitHub
    """)

# Features
with st.expander("💡 Features"):
    st.markdown("""
    - Interactive chatbot interface
    - Smart Q&A using university web data
    - Real-time responses
    - Scalable architecture
    """)

# Contact
with st.expander("📬 Contact Us"):
    st.markdown("Email us at [nubot@northeastern.edu](mailto:nubot@northeastern.edu)")

