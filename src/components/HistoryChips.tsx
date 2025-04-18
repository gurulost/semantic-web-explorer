
import { Clock } from 'lucide-react';
import { Button } from './ui/button';
import type { HistoryItem } from '@/hooks/useSearchHistory';

interface HistoryChipsProps {
  history: HistoryItem[];
  onSelect: (query: string, secondWord?: string) => void;
}

const HistoryChips = ({ history, onSelect }: HistoryChipsProps) => {
  if (history.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Clock className="w-4 h-4 text-muted-foreground mt-1.5" />
      {history.map((item) => (
        <Button
          key={`${item.query}-${item.secondWord}-${item.timestamp}`}
          variant="outline"
          size="sm"
          onClick={() => onSelect(item.query, item.secondWord)}
          className="text-sm"
        >
          {item.query}
          {item.secondWord && ` & ${item.secondWord}`}
        </Button>
      ))}
    </div>
  );
};

export default HistoryChips;
