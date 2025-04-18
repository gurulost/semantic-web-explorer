import axios from 'axios';

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

export interface ComparisonResult {
  similarity: number;
  common_neighbors: string[];
  similarity_explanation: string;
}

export interface MapResponse {
  nodes: Node[];
  edges: string[][];
  comparison?: ComparisonResult;
  next_cursor?: number | null;
}

export const getSemanticMap = async (
  query: string, 
  secondWord?: string,
  cursor?: number
): Promise<MapResponse> => {
  try {
    console.log(`Fetching semantic map for: ${query}${secondWord ? ` and ${secondWord}` : ''} cursor: ${cursor}`);
    
    const url = `${API_BASE_URL}/map`;
    const response = await axios.post(url, { 
      query,
      second_word: secondWord,
      n: secondWord ? 30 : 40,
      cursor
    });
    
    if (!response.data.nodes || response.data.nodes.length <= 1) {
      throw new Error('Word not found in vocabulary');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching semantic map:', error);
    
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error(error.response.data.detail || 'Word not found in vocabulary');
    }
    throw new Error('Failed to fetch semantic map');
  }
};
