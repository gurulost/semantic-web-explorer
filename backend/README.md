
# Semantic Web Explorer Backend

This FastAPI application provides a semantic mapping service that converts words into 2D coordinates based on their semantic similarity using GloVe word embeddings.

## Setup

1. Create a virtual environment:
   ```
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the server:
   ```
   uvicorn main:app --reload --port 8000
   ```

## API Endpoints

- `POST /map` - Generate a semantic map for a given word
  - Request body: `{"query": "word", "n": 40}`
  - Response: Map of nodes and edges
