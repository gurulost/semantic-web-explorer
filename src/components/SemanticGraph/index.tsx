
import React, { useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Node } from '@/services/api';
import { useSemanticGraph } from '@/hooks/useSemanticGraph';
import graphStyles from './styles';
import LoadingOverlay from './LoadingOverlay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface SemanticGraphProps {
  nodes: Node[];
  edges: string[][];
  isLoading?: boolean;
  commonNeighbors?: string[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const SemanticGraph: React.FC<SemanticGraphProps> = ({ 
  nodes, 
  edges, 
  isLoading = false, 
  commonNeighbors = [],
  onLoadMore,
  hasMore = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { cyRef, elements, tooltipStyle, tooltipContent, setupGraphEvents } = useSemanticGraph(nodes, edges, commonNeighbors);

  const exportSVG = () => {
    if (!cyRef.current) return;
    
    const svg = cyRef.current.svg({
      scale: 2,
      full: true,
      output: 'svg'
    });
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'semantic-graph.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!nodes.length && !isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-muted-foreground">Search for a word to see its semantic map</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {isLoading && <LoadingOverlay />}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {hasMore && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Load More
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={exportSVG}>
              Export SVG (High Resolution)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        stylesheet={graphStyles}
        cy={(cy) => { 
          cyRef.current = cy;
          setupGraphEvents(cy);
        }}
        wheelSensitivity={0.2}
        boxSelectionEnabled={true}
        autounselectify={false}
        panningEnabled={true}
        userZoomingEnabled={true}
        userPanningEnabled={true}
      />
      <div 
        className="cy-tooltip absolute z-50 bg-white/90 p-2 rounded shadow-md text-xs pointer-events-none"
        style={{
          left: `${tooltipStyle.left}px`,
          top: `${tooltipStyle.top}px`,
          display: tooltipStyle.display
        }}
      >
        {tooltipContent}
      </div>
    </div>
  );
};

export default SemanticGraph;
