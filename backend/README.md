
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

## First Run

On first run, the backend will download the GloVe word embeddings (glove-wiki-gigaword-100), which is approximately 200MB in size. This might take a few minutes depending on your internet connection, but happens only once.

## API Endpoints

- `POST /map` - Generate a semantic map for a given word
  - Request body: `{"query": "word", "n": 40}`
  - Response: Map of nodes and edges

## How It Works

1. The backend loads GloVe word embeddings into memory
2. When a query word is received, it:
   - Finds the nearest semantic neighbors using cosine similarity
   - Projects the high-dimensional vectors to 2D using UMAP
   - Clusters the words using K-means for color coding
   - Returns a graph representation with nodes and edges

## Docker

The backend can be containerized using the Dockerfile:

```bash
docker build -t semantic-explorer-backend .
docker run -p 8000:8000 semantic-explorer-backend
```

For development with hot reloading, use docker-compose from the parent directory.
