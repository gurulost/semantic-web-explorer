
import axios from 'axios';

// You can set this in an environment variable for production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
    console.log(`Attempting to fetch semantic map for: ${query}`);
    
    // Use the proxy in development, or the API_BASE_URL in production
    const url = `${API_BASE_URL}/map`;
    console.log(`Fetching from: ${url}`);
    
    const response = await axios.post(url, { query });
    console.log('Received response:', response.data);
    
    // If we receive an empty nodes array or just one node (the query word), 
    // the word probably wasn't found in the vocabulary
    if (!response.data.nodes || response.data.nodes.length <= 1) {
      console.warn('Word not found or no related words in vocabulary');
      if (response.data.nodes.length === 1) {
        return response.data; // Return just the query word node
      }
      throw new Error('Word not found in vocabulary');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching semantic map:', error);
    
    // Fall back to mock data if in development
    if (!API_BASE_URL) {
      console.log('Falling back to mock data after error');
      return getMockSemanticMap(query);
    }
    
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
