
# Semantic Web Explorer

A visualization tool that displays semantic relationships between words using GloVe word embeddings.

## Project Structure

- `/frontend` - React/Vite frontend application
- `/backend` - FastAPI backend service providing word embeddings and semantic mapping

## Quick Start (Docker)

The easiest way to run the application is with Docker Compose:

```bash
docker-compose up
```

This will:
1. Build and start the backend on port 8000
2. Build and start the frontend on port 8080
3. Download the GloVe embeddings (~200MB) on first run

Then open http://localhost:8080 in your browser.

## Manual Setup

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

## Usage

1. Enter an English word in the search bar (e.g., "puppy", "computer", "ocean")
2. The application will display related words in a graph visualization
3. Hover over nodes to see word details
4. Use mouse wheel to zoom and drag to pan the visualization

## Development Configuration

- The frontend automatically connects to the backend using a proxy in development mode
- For production, set the `VITE_API_BASE_URL` environment variable to your deployed backend URL

## Features

- Search for any English word to visualize its semantic relationships
- Interactive graph with zoom, pan, and hover functionality
- Color-coded word clusters based on semantic similarity

## Deployment

To deploy the application:

1. Deploy the backend to your chosen platform (e.g., Fly.io, Render, DigitalOcean)
2. Set the `VITE_API_BASE_URL` in your frontend deployment to point to your backend URL
3. Deploy the frontend to a static hosting service (e.g., Vercel, Netlify)
