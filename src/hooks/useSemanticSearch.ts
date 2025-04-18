
import { useReducer } from 'react';
import { MapResponse } from '@/services/api';

interface SemanticState {
  searchTerm: string;
  secondWord?: string;
  semanticMap: MapResponse | null;
}

type SemanticAction = 
  | { type: 'SET_SEARCH'; payload: { query: string; secondWord?: string } }
  | { type: 'SET_MAP'; payload: MapResponse | null }
  | { type: 'RESET' };

const initialState: SemanticState = {
  searchTerm: '',
  secondWord: undefined,
  semanticMap: null
};

function semanticReducer(state: SemanticState, action: SemanticAction): SemanticState {
  switch (action.type) {
    case 'SET_SEARCH':
      return {
        ...state,
        searchTerm: action.payload.query,
        secondWord: action.payload.secondWord
      };
    case 'SET_MAP':
      return {
        ...state,
        semanticMap: action.payload
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useSemanticSearch() {
  const [state, dispatch] = useReducer(semanticReducer, initialState);
  
  return {
    ...state,
    setSearch: (query: string, secondWord?: string) => 
      dispatch({ type: 'SET_SEARCH', payload: { query, secondWord } }),
    setMap: (map: MapResponse | null) => 
      dispatch({ type: 'SET_MAP', payload: map }),
    reset: () => dispatch({ type: 'RESET' })
  };
}
