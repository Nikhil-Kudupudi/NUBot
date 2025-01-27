# NUBot: Retrieval-Augmented Generation (RAG) Chatbot

### Team Members

- Sai Nikhil Kunapareddy
- Arjun Pesaru
- Udisha Dutta Chowdhury
- Likitha Kukunarapu
- Nikhil Kudupudi
- Jaya Raghu Ram Penugonda

## Introduction

NUBot is a Retrieval-Augmented Generation (RAG) chatbot designed to answer queries related to course planning, available programs, co-op opportunities, and other academic information during a student's degree.

This system integrates a vector database created from data scraped from Northeastern University's official webpages. The chatbot retrieves relevant context based on user queries, processes it using a language model (LLM), and provides accurate and coherent responses.

## Dataset Information

The dataset consists of structured and preprocessed data scraped from Northeastern University webpages. It includes details about courses, faculty, programs, and co-op opportunities. Data preprocessing techniques such as lemmatization and TF-IDF are applied to ensure optimal performance in information retrieval.

## Project Scope

### Problem Statement

Accessing university information is often inefficient, requiring navigation through multiple pages. Scheduling academic advisor appointments can also be challenging due to limited availability, delaying query resolution.

### Proposed Solution

NUBot offers instant access to academic information via a chatbot powered by the ChatGPT API. It enables users to:

- Get answers to queries without navigating multiple pages.
- Obtain quick guidance on academic or course-related matters.
- Reduce dependency on direct appointments with advisors.

### Objectives

- Provide accurate and timely responses to user queries.
- Automate common queries to reduce the workload on support staff.
- Enhance user satisfaction with fast, reliable responses.
- Ensure scalability and efficiency for handling high query volumes.

## Current Approach

### Workflow Overview

1. **Frontend**: Built using Streamlit for user interaction.
2. **Backend**: Developed using Python with Flask or Django.
3. **Cloud**: Hosted on Google Cloud Platform (GCP).
4. **Data Processing**: Data scraped using Beautiful Soup or Scrapy, preprocessed, and stored in a vector database.
5. **Model**: RAG model retrieves context using cosine similarity and generates responses via an LLM.
6. **Deployment**: Dockerized applications managed with Kubernetes.
7. **CI/CD**: GitHub Actions automate testing and deployment.

### End-to-End Pipeline

1. Scrape data from university webpages.
2. Preprocess data into JSON, applying lemmatization and TF-IDF.
3. Query processed by RAG model using cosine similarity for context retrieval.
4. Context passed to LLM to generate a response.
5. Response returned to the user interface.

## Key Metrics

- **Response Accuracy**: Percentage of correctly answered queries.
- **Query Coverage**: Percentage of query types handled.
- **User Satisfaction**: Ratings from user feedback surveys.
- **Response Time**: Average query response time.
- **Fallback Rate**: Percentage of queries requiring live support.
- **Engagement Metrics**: Daily/weekly queries handled and active users.
- **Retention Metrics**: Frequency of repeat interactions.

## Deployment Infrastructure

### Cloud Platform

- **Google Cloud Platform (GCP)**: Primary cloud provider.

### Containerization

- **Docker**: For consistent application packaging.
- **Kubernetes**: For efficient scaling and orchestration.

### Frontend

- Streamlit-based interface for user interaction.

### ML Model Management

- **MLflow**: Tracks experiments, packages code, and deploys models.

### CI/CD Pipeline

1. Build Docker images.
2. Run unit and integration tests.
3. Deploy to staging and production via Kubernetes.

### Supported Platforms

- Web browsers (desktop and mobile).
- Mobile applications (iOS and Android).

## Monitoring Plan

### What to Monitor

- **Performance Metrics**: Response time, query success rate.
- **User Interactions**: Logs of queries and responses, fallback rates.
- **Model Metrics**: Accuracy, relevance, drift detection.
- **System Health**: Server uptime, API response rates, resource usage.

### Tools for Monitoring

- **Google Cloud Monitoring**: Tracks system metrics and sets alerts.
- **Logs Explorer**: Analyzes user interactions.
- **Pinecone Dashboard**: Monitors vector search performance.
- **MLflow**: Tracks model performance and experiments.

## Business Goals

- Improve prospective student experience and increase application rates.
- Optimize operational efficiency by automating FAQs.
- Build a reputation for technological innovation.
- Use user interaction data to identify and address resource gaps.

## License

This project is licensed under the MIT License.

---

For more information or contributions, please contact the project team.
