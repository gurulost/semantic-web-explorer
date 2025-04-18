
import axios from 'axios';

// Define the base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Type definitions for the API responses
export interface Node {
  id: string;
  x: number;
  y: number;
  size: number;
  cluster: number;
}

export interface Comparison {
  similarity_explanation: string;
  common_neighbors: string[];
}

export interface MapResponse {
  nodes: Node[];
  edges: string[][];
  next_cursor: number | null;
  comparison?: Comparison;
}

// API functions
export const getSemanticMap = async (
  query: string, 
  secondWord?: string, 
  cursor: number | null = null
): Promise<MapResponse> => {
  try {
    // Build query parameters
    const params: Record<string, string | number> = { q: query };
    
    if (secondWord) {
      params.compare = secondWord;
    }
    
    if (cursor !== null) {
      params.cursor = cursor;
    }
    
    // Make the API request
    const response = await axios.get(`${API_BASE_URL}/semantic-map`, { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch semantic map');
    }
    throw new Error('Failed to fetch semantic map');
  }
};
