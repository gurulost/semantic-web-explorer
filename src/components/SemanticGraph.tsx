import React, { useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Node } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

declare module 'cytoscape' {
  interface Core {
    svg(options?: { scale?: number; full?: boolean; output?: 'string' | 'svg' }): string;
  }
}

cytoscape.use(graphml);

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
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState({ display: 'none', left: 0, top: 0 });
  const [tooltipContent, setTooltipContent] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const maxCluster = Math.max(...nodes.map(node => node.cluster), 0);
  const colorScale = chroma.scale(['#3498db', '#e74c3c']).mode('lab').colors(maxCluster + 1);

  const elements = [
    ...nodes.map(node => ({
      data: { 
        id: node.id, 
        label: node.id,
        size: node.size,
        cluster: node.cluster,
        color: colorScale[node.cluster]
      },
      position: { 
        x: node.x * 200, 
        y: node.y * 200 
      },
      classes: `cluster-${node.cluster}`
    })),
    ...edges.map(([source, target], i) => ({
      data: { 
        id: `edge-${i}`, 
        source, 
        target,
        isCommon: commonNeighbors.includes(source) && commonNeighbors.includes(target)
      },
      classes: ['hidden-edge', commonNeighbors.includes(source) && commonNeighbors.includes(target) ? 'common-edge' : ''].filter(Boolean).join(' ')
    }))
  ];

  const cytoscapeStyle = [
    {
      selector: 'node',
      style: {
        'width': 'data(size)',
        'height': 'data(size)',
        'background-color': 'data(color)',
        'label': 'data(label)',
        'color': '#fff',
        'text-outline-color': '#000',
        'text-outline-width': 1,
        'font-size': '12px',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-max-width': '100px',
        'text-wrap': 'ellipsis',
        'text-background-opacity': 0.8,
        'text-background-shape': 'roundrectangle',
        'text-background-padding': '2px',
        'z-index': 10,
        'transition-property': 'background-color, width, height',
        'transition-duration': '0.3s'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 1,
        'line-color': '#ccc',
        'opacity': 0,
        'z-index': 1,
        'curve-style': 'bezier',
        'transition-property': 'opacity',
        'transition-duration': '0.3s'
      }
    },
    {
      selector: '.common-edge',
      style: {
        'line-color': '#e74c3c',
        'width': 2,
        'z-index': 2
      }
    },
    {
      selector: '.hidden-edge',
      style: {
        'opacity': 0
      }
    },
    {
      selector: '.visible-edge',
      style: {
        'opacity': 0.6
      }
    },
    {
      selector: 'node:selected',
      style: {
        'border-width': 3,
        'border-color': '#ffcc00',
        'border-opacity': 0.8,
        'background-color': 'data(color)',
        'text-outline-color': '#ffcc00',
        'z-index': 20
      }
    },
    {
      selector: 'node:active',
      style: {
        'overlay-color': '#ffcc00',
        'overlay-padding': 10,
        'overlay-opacity': 0.3,
        'z-index': 30
      }
    },
    {
      selector: 'edge:selected',
      style: {
        'width': 3,
        'line-color': '#ffcc00',
        'opacity': 1,
        'z-index': 3
      }
    }
  ];

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

  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    cy.on('mouseover', 'node', (event) => {
      const node = event.target;
      cy.edges().removeClass('visible-edge');
      node.connectedEdges().addClass('visible-edge');
      
      const position = node.renderedPosition();
      setTooltipContent(node.data('label'));
      setTooltipStyle({
        display: 'block',
        left: position.x + 10,
        top: position.y - 30
      });
    });

    cy.on('mouseout', 'node', () => {
      cy.edges().removeClass('visible-edge');
      setTooltipStyle({ ...tooltipStyle, display: 'none' });
    });

    cy.on('tap', 'node', (event) => {
      const node = event.target;
      console.log('Selected node:', node.data('label'));
    });
  }, []);

  useEffect(() => {
    if (cyRef.current && !isLoading && nodes.length > 0) {
      cyRef.current.fit();
      cyRef.current.zoom({
        level: 1.2,
        position: { x: 0, y: 0 }
      });
    }
  }, [nodes, isLoading]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-primary animate-pulse-soft">Building semantic map...</p>
          </div>
        </div>
      ) : nodes.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">Search for a word to see its semantic map</p>
        </div>
      ) : (
        <>
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
            stylesheet={cytoscapeStyle}
            cy={(cy) => { cyRef.current = cy; }}
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
        </>
      )}
    </div>
  );
};

export default SemanticGraph;
