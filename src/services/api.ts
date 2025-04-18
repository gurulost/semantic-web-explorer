
import axios from 'axios';

// You can set this in an environment variable for production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface Node {
  id: string;
  x: number;
  y: number;
  size: number;
  cluster: number;
}

export interface Edge {
  source: string;
  target: string;
}

export interface MapResponse {
  nodes: Node[];
  edges: string[][];
}

export const getSemanticMap = async (query: string): Promise<MapResponse> => {
  try {
    // For now, we'll use a mock response to show the UI without the backend
    if (process.env.NODE_ENV === 'development' && !API_BASE_URL) {
      return getMockSemanticMap(query);
    }

    const response = await axios.post(`${API_BASE_URL}/map`, { query });
    return response.data;
  } catch (error) {
    console.error('Error fetching semantic map:', error);
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Word not found in vocabulary');
    }
    throw new Error('Failed to fetch semantic map');
  }
};

// Mock function for development without a backend
const getMockSemanticMap = (query: string): MapResponse => {
  // Generate some random nodes and edges for demo purposes
  const nodes: Node[] = [
    { id: query, x: 0, y: 0, size: 100, cluster: 0 },
  ];
  
  // Generate 20 random related nodes
  const words = [
    'dog', 'cat', 'pet', 'animal', 'cute', 'furry', 'small', 'playful',
    'loyal', 'companion', 'friend', 'pup', 'puppy', 'canine', 'kitten',
    'fluffy', 'cuddly', 'adorable', 'friendly', 'loving'
  ];
  
  for (let i = 0; i < 20; i++) {
    const word = words[i] || `related-${i}`;
    const angle = (i / 20) * Math.PI * 2;
    const distance = 0.5 + Math.random() * 1.5;
    
    nodes.push({
      id: word,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 30 + Math.random() * 40,
      cluster: Math.floor(Math.random() * 8)
    });
  }
  
  // Connect all nodes to the query node
  const edges = nodes.slice(1).map(node => [query, node.id]);
  
  return { nodes, edges };
};
