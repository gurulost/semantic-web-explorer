import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SearchBar from '@/components/SearchBar';
import SemanticGraph from '@/components/SemanticGraph';
import Legend from '@/components/Legend';
import { getSemanticMap } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useSemanticSearch } from '@/hooks/useSemanticSearch';

const Index = () => {
  const { searchTerm, secondWord, semanticMap, setSearch, setMap } = useSemanticSearch();
  const { toast } = useToast();

  const { isLoading } = useQuery({
    queryKey: ['semanticMap', searchTerm, secondWord],
    queryFn: () => getSemanticMap(searchTerm, secondWord),
    enabled: !!searchTerm,
    onSuccess: (data) => {
      setMap(data);
      if (data.comparison) {
        toast({
          title: "Word Comparison",
          description: data.comparison.similarity_explanation,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setMap(null);
    }
  });

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
          {/* Search bar */}
          <div className="mb-6 flex justify-center">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>
          
          {/* Graph visualization */}
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 h-[calc(100vh-16rem)]">
              <SemanticGraph 
                nodes={semanticMap?.nodes || []} 
                edges={semanticMap?.edges || []} 
                isLoading={isLoading}
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
