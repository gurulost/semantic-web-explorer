
# Semantic Web Explorer

A visualization tool that displays semantic relationships between words using GloVe word embeddings.

## Project Structure

- `/frontend` - React/Vite frontend application
- `/backend` - FastAPI backend service providing word embeddings and semantic mapping

## Setup and Running

### Backend

1. Set up Python environment:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Run the backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   
   The first run will download the GloVe embeddings (~200MB) which may take a few minutes.

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

## Development Configuration

- The frontend automatically connects to the backend using a proxy in development mode
- For production, set the `VITE_API_BASE_URL` environment variable to your deployed backend URL

## Features

- Search for any English word to visualize its semantic relationships
- Interactive graph with zoom, pan, and hover functionality
- Color-coded word clusters based on semantic similarity
