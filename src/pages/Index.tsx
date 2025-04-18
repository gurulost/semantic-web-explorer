
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SearchBar from '@/components/SearchBar';
import SemanticGraph from '@/components/SemanticGraph';
import Legend from '@/components/Legend';
import { getSemanticMap, Node, MapResponse } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [semanticMap, setSemanticMap] = useState<MapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setLoading(true);
    setSearchTerm(query);
    
    try {
      const result = await getSemanticMap(query);
      setSemanticMap(result);
    } catch (error) {
      let message = 'Failed to generate semantic map';
      
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      
      setSemanticMap(null);
    } finally {
      setLoading(false);
    }
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
            <SearchBar onSearch={handleSearch} isLoading={loading} />
          </div>
          
          {/* Graph visualization */}
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 h-[calc(100vh-16rem)]">
              <SemanticGraph 
                nodes={semanticMap?.nodes || []} 
                edges={semanticMap?.edges || []} 
                isLoading={loading}
              />
            </CardContent>
          </Card>
          
          {/* Info section */}
          {semanticMap && !loading && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Showing semantic relationships for <span className="font-medium text-primary">{searchTerm}</span> 
                with {semanticMap.nodes.length - 1} related words
              </p>
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
