
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SplitSquareVertical } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SearchBarProps {
  onSearch: (query: string, secondWord?: string) => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [secondWord, setSecondWord] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedQuery = query.trim();
    const trimmedSecondWord = secondWord.trim();
    
    if (!trimmedQuery) {
      toast({
        title: "Empty search",
        description: "Please enter at least one word to visualize.",
        variant: "destructive"
      });
      return;
    }
    
    if (isComparing && !trimmedSecondWord) {
      toast({
        title: "Missing second word",
        description: "Please enter both words for comparison.",
        variant: "destructive"
      });
      return;
    }
    
    onSearch(trimmedQuery, isComparing ? trimmedSecondWord : undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl gap-2 flex-col sm:flex-row">
      <div className="flex-1 flex gap-2">
        <Input
          type="text"
          placeholder="Enter first word (e.g. 'puppy')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        {isComparing && (
          <Input
            type="text"
            placeholder="Enter second word"
            value={secondWord}
            onChange={(e) => setSecondWord(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
        )}
      </div>
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => {
            setIsComparing(!isComparing);
            if (isComparing) setSecondWord('');
          }}
          disabled={isLoading}
        >
          <SplitSquareVertical className="h-4 w-4 mr-2" />
          {isComparing ? 'Single Word' : 'Compare Words'}
        </Button>
        <Button type="submit" disabled={isLoading || !query.trim()}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              Searching...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Visualize
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
