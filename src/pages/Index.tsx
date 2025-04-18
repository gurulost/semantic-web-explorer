
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SearchBar from '@/components/SearchBar';
import SemanticGraph from '@/components/SemanticGraph';
import Legend from '@/components/Legend';
import HistoryChips from '@/components/HistoryChips';
import { getSemanticMap } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useSemanticSearch } from '@/hooks/useSemanticSearch';
import { useSearchHistory } from '@/hooks/useSearchHistory';

const Index = () => {
  const { searchTerm, secondWord, semanticMap, setSearch, setMap } = useSemanticSearch();
  const { history, addToHistory } = useSearchHistory();
  const { toast } = useToast();

  const { data, error, isLoading } = useQuery({
    queryKey: ['semanticMap', searchTerm, secondWord],
    queryFn: () => getSemanticMap(searchTerm, secondWord),
    enabled: !!searchTerm,
  });
  
  // Handle successful data fetching
  useEffect(() => {
    if (!data) return;
    setMap(data);
    addToHistory(searchTerm, secondWord);
    if (data.comparison) {
      toast({
        title: "Word Comparison",
        description: data.comparison.similarity_explanation,
      });
    }
  }, [data, searchTerm, secondWord, addToHistory, setMap, toast]);
  
  // Handle errors
  useEffect(() => {
    if (!error) return;
    toast({
      title: 'Error',
      description: (error as Error).message,
      variant: 'destructive',
    });
    setMap(null);
  }, [error, toast, setMap]);

  const handleSearch = async (query: string, second?: string) => {
    setSearch(query, second);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b py-4 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h1 className="text-2xl font-bold text-primary">Semantic Web Explorer</h1>
          <div className="flex items-center gap-4">
            <Legend />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 p-6 flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {/* Search bar and history */}
          <div className="mb-6 space-y-4">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            <HistoryChips history={history} onSelect={handleSearch} />
          </div>
          
          {/* Graph visualization */}
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 h-[calc(100vh-16rem)]">
              <SemanticGraph 
                nodes={semanticMap?.nodes || []} 
                edges={semanticMap?.edges || []} 
                isLoading={isLoading}
                commonNeighbors={semanticMap?.comparison?.common_neighbors}
              />
            </CardContent>
          </Card>
          
          {/* Info section */}
          {semanticMap && !isLoading && (
            <div className="mt-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Showing semantic relationships for{' '}
                <span className="font-medium text-primary">{searchTerm}</span>
                {secondWord && (
                  <> and <span className="font-medium text-primary">{secondWord}</span></>
                )}
              </p>
              {semanticMap.comparison && (
                <div className="text-sm space-y-1">
                  <p>{semanticMap.comparison.similarity_explanation}</p>
                  {semanticMap.comparison.common_neighbors.length > 0 && (
                    <p>
                      Common semantic neighbors:{' '}
                      <span className="font-medium">
                        {semanticMap.comparison.common_neighbors.join(', ')}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-4 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>Semantic Web Explorer uses word embeddings to visualize language relationships</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
