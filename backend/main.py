from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, BaseSettings
from typing import List, Tuple, Optional, Dict
import numpy as np
import umap
import gensim.downloader as api
from sklearn.cluster import KMeans
import os
import time
import functools
from cachetools import LRUCache

# ---------- Configuration ---------- #
class Settings(BaseSettings):
    glove_home: str = ""  # Default empty uses gensim's cache location
    n_clusters: int = 8
    max_neighbours: int = 40
    allow_origins: List[str] = ["*"]  # In production, set to your frontend URL
    umap_n_components: int = 2
    umap_n_neighbors: int = 15
    umap_min_dist: float = 0.1
    umap_metric: str = "cosine"
    word_vector_cache_size: int = 10_000
    layout_cache_size: int = 100
    
    class Config:
        env_file = ".env"
        env_prefix = "APP_"

settings = Settings()

# ---------- Load embeddings once ---------- #
print("Loading GloVe 100-d embeddings... (this might take a few minutes on first run)")
start_time = time.time()
GLOVE = api.load("glove-wiki-gigaword-100")   # Should be already downloaded during container build
print(f"GloVe embeddings loaded in {time.time() - start_time:.2f} seconds")
DIM = 100

# Create an LRU cache for word vectors and UMAP results
@functools.lru_cache(maxsize=settings.word_vector_cache_size)
def vec(word: str) -> np.ndarray:
    if word in GLOVE:
        return GLOVE[word]
    raise KeyError(f"'{word}' not found in vocabulary")

@functools.lru_cache(maxsize=settings.layout_cache_size)
def generate_layout_and_clusters(frozen_vocab: frozenset) -> tuple:
    """
    Generate UMAP layout and clusters for a given vocabulary set.
    Uses frozen_vocab as input since cache keys must be immutable.
    """
    vocab = list(frozen_vocab)
    M = np.vstack([vec(w) for w in vocab])
    
    # Generate 2D layout
    coords = umap.UMAP(
        n_components=settings.umap_n_components,
        n_neighbors=settings.umap_n_neighbors,
        min_dist=settings.umap_min_dist,
        metric=settings.umap_metric,
        random_state=42
    ).fit_transform(M)
    
    # Clustering
    clusters = KMeans(
        n_clusters=settings.n_clusters, 
        n_init="auto", 
        random_state=42
    ).fit(M).labels_.tolist()
    
    return coords, clusters

def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

# ---------- I/O models ---------- #
class Query(BaseModel):
    query: str
    second_word: Optional[str] = None
    n: int = settings.max_neighbours
    cursor: Optional[int] = None  # Starting index for pagination

class Node(BaseModel):
    id: str
    x: float
    y: float
    size: float
    cluster: int

class ComparisonResult(BaseModel):
    similarity: float
    common_neighbors: List[str]
    similarity_explanation: str

class MapResponse(BaseModel):
    nodes: List[Node]
    edges: List[List[str]]
    comparison: Optional[ComparisonResult] = None
    next_cursor: Optional[int] = None

# ---------- FastAPI app ---------- #
app = FastAPI(title="Semantic-Map API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_methods=["POST"],
    allow_headers=["*"],
)

# LRU cache for build_map results (100 entries, smaller than word vectors cache)
map_cache = LRUCache(maxsize=settings.layout_cache_size)

# ---------- Core algorithm ---------- #
def find_common_neighbors(word1: str, word2: str, n: int = 10) -> List[str]:
    """Find words that are semantically similar to both input words."""
    v1, v2 = vec(word1), vec(word2)
    
    # Get similarities to all words
    mat = GLOVE.vectors
    sims1 = mat @ v1 / (np.linalg.norm(mat, axis=1) * np.linalg.norm(v1) + 1e-9)
    sims2 = mat @ v2 / (np.linalg.norm(mat, axis=1) * np.linalg.norm(v2) + 1e-9)
    
    # Combine similarities
    combined_sims = (sims1 + sims2) / 2
    top_idx = combined_sims.argsort()[-n:][::-1]
    
    all_words = np.array(list(GLOVE.key_to_index.keys()))
    return [w for w in all_words[top_idx] if w not in [word1, word2]]

def build_map(root: str, second_word: Optional[str], n: int, cursor: Optional[int] = None) -> MapResponse:
    cache_key = f"{root}:{second_word or ''}:{n}:{cursor or 0}"
    if cache_key in map_cache:
        return map_cache[cache_key]
    
    try:
        v_root = vec(root)
        if second_word:
            try:
                v_second = vec(second_word)
                similarity = cosine_similarity(v_root, v_second)
                common = find_common_neighbors(root, second_word)
                
                # Generate explanation
                explanation = f"The words '{root}' and '{second_word}' have a semantic similarity of {similarity:.2f}"
                if similarity > 0.7:
                    explanation += " (very similar)"
                elif similarity > 0.4:
                    explanation += " (moderately similar)"
                else:
                    explanation += " (not very similar)"
                
                comparison = ComparisonResult(
                    similarity=similarity,
                    common_neighbors=common[:5],
                    similarity_explanation=explanation
                )
            except KeyError:
                raise HTTPException(status_code=404, detail=f"Word '{second_word}' not found in vocabulary")
        else:
            comparison = None
            
        # Find nearest neighbors with pagination
        all_words = np.array(list(GLOVE.key_to_index.keys()))
        mat = GLOVE.vectors
        sims = mat @ v_root / (np.linalg.norm(mat, axis=1) * np.linalg.norm(v_root) + 1e-9)
        top_idx = sims.argsort()[-(n+1):][::-1]
        
        # Generate vocabulary list with pagination
        start_idx = cursor or 0
        end_idx = min(start_idx + 30, n)  # Show 30 nodes per page
        
        vocab = [root]
        if second_word and second_word in GLOVE:
            vocab.append(second_word)
        
        vocab.extend([w for w in all_words[top_idx] if w not in vocab][start_idx:end_idx])
        
        has_more = end_idx < len(top_idx)
        next_cursor = end_idx if has_more else None
        
        # Use cached layout and clustering
        coords, clusters = generate_layout_and_clusters(frozenset(vocab))
        
        # Generate nodes with cached results
        nodes = [Node(
            id=w,
            x=float(coords[i,0]),
            y=float(coords[i,1]),
            size=120 if w in [root, second_word] else 50,
            cluster=int(clusters[i])
        ) for i,w in enumerate(vocab)]
        
        # Generate edges
        edges = [[root, w] for w in vocab[1:]]
        if second_word and second_word in vocab:
            edges.extend([[second_word, w] for w in vocab if w not in [root, second_word]])
        
        result = MapResponse(
            nodes=nodes, 
            edges=edges, 
            comparison=comparison if 'comparison' in locals() else None,
            next_cursor=next_cursor
        )
        
        map_cache[cache_key] = result
        return result
        
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Word '{root}' not found in vocabulary")

# ---------- Route ---------- #
@app.post("/map", response_model=MapResponse)
def get_map(q: Query):
    return build_map(
        q.query.lower(), 
        q.second_word.lower() if q.second_word else None, 
        q.n,
        q.cursor
    )
