
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple
import numpy as np
import umap
import gensim.downloader as api
from sklearn.cluster import KMeans
import os
import time

# ---------- Load embeddings once ---------- #
print("Loading GloVe 100-d embeddings... (this might take a few minutes on first run)")
start_time = time.time()
GLOVE = api.load("glove-wiki-gigaword-100")   # ~200 MB, one-time
print(f"GloVe embeddings loaded in {time.time() - start_time:.2f} seconds")
DIM = 100

def vec(word: str) -> np.ndarray:
    if word in GLOVE:
        return GLOVE[word]
    raise KeyError(f"'{word}' not found in vocabulary")

# ---------- I/O models ---------- #
class Query(BaseModel):
    query: str
    n: int = 40       # how many neighbours to return

class Node(BaseModel):
    id: str
    x: float
    y: float
    size: float
    cluster: int

class MapResponse(BaseModel):
    nodes: List[Node]
    edges: List[List[str]]  # Match frontend's expectation: string[][]

# ---------- FastAPI app ---------- #
app = FastAPI(title="Semantic-Map API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # tighten in prod
    allow_methods=["POST"],
    allow_headers=["*"],
)

# ---------- Core algorithm ---------- #
def build_map(root: str, n: int) -> MapResponse:
    # 1. find n nearest neighbours by cosine sim
    all_words = np.array(list(GLOVE.key_to_index.keys()))
    try:
        v_root = vec(root)
    except KeyError:
        # Return empty map if word not in vocabulary
        return MapResponse(
            nodes=[Node(id=root, x=0, y=0, size=120, cluster=0)],
            edges=[]
        )
        
    mat = GLOVE.vectors          # (400k, 100)
    sims = mat @ v_root / (
        np.linalg.norm(mat, axis=1) * np.linalg.norm(v_root) + 1e-9)
    top_idx = sims.argsort()[-(n+1):][::-1]   # drop self later

    vocab = [root] + [w for w in all_words[top_idx] if w != root][:n]
    M = np.vstack([vec(w) for w in vocab])

    # 2. 2-D layout
    coords = umap.UMAP(
        n_components=2, n_neighbors=15, min_dist=0.1,
        metric="cosine", random_state=42).fit_transform(M)

    # 3. clustering for colour
    kmeans = KMeans(n_clusters=8, n_init="auto", random_state=42).fit(M[1:])  # exclude root
    clusters = [0] + kmeans.labels_.tolist()  # Root node is cluster 0

    # 4. JSON
    nodes = [Node(
        id=w,
        x=float(coords[i,0]),
        y=float(coords[i,1]),
        size=(120 if i==0 else 50),   # central node bigger
        cluster=int(clusters[i])
    ) for i,w in enumerate(vocab)]
    
    # Format edges as expected by frontend: string[][]
    edges = [[root, w] for w in vocab[1:]]
    
    return MapResponse(nodes=nodes, edges=edges)

# ---------- Route ---------- #
@app.post("/map", response_model=MapResponse)
def get_map(q: Query):
    return build_map(q.query.lower(), q.n)
