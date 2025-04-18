
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      toast({
        title: "Empty search",
        description: "Please enter a word to visualize.",
        variant: "destructive"
      });
      return;
    }
    
    onSearch(trimmedQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <Input
        type="text"
        placeholder="Enter any English word (e.g. 'puppy')"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
        disabled={isLoading}
      />
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
    </form>
  );
};

export default SearchBar;
