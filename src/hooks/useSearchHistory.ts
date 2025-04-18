
import { useEffect, useState } from 'react';

const MAX_HISTORY = 5;
const HISTORY_KEY = 'semantic-search-history';

export interface HistoryItem {
  query: string;
  secondWord?: string;
  timestamp: number;
}

export function useSearchHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = (query: string, secondWord?: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(
        item => !(item.query === query && item.secondWord === secondWord)
      );
      
      return [{
        query,
        secondWord,
        timestamp: Date.now()
      }, ...newHistory].slice(0, MAX_HISTORY);
    });
  };

  return {
    history,
    addToHistory
  };
}
