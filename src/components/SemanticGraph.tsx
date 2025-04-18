
import React, { useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import { Node, Edge } from '../services/api';

interface SemanticGraphProps {
  nodes: Node[];
  edges: string[][];
  isLoading?: boolean;
}

const SemanticGraph: React.FC<SemanticGraphProps> = ({ nodes, edges, isLoading = false }) => {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState({ display: 'none', left: 0, top: 0 });
  const [tooltipContent, setTooltipContent] = useState('');

  // Convert data to cytoscape format
  const elements = [
    ...nodes.map(node => ({
      data: { 
        id: node.id, 
        label: node.id,
        size: node.size,
        cluster: node.cluster
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
        target 
      }
    }))
  ];

  // Cytoscape style
  const cytoscapeStyle = [
    {
      selector: 'node',
      style: {
        'width': 'data(size)',
        'height': 'data(size)',
        'background-color': 'mapData(cluster, 0, 7, #3498db, #e74c3c)',
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
        'opacity': 0.6,
        'z-index': 1,
        'curve-style': 'bezier'
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

  useEffect(() => {
    if (!cyRef.current) return;

    // Set up event handlers
    const cy = cyRef.current;

    cy.on('mouseover', 'node', (event) => {
      const node = event.target;
      const position = node.renderedPosition();
      
      // Show tooltip
      setTooltipContent(node.data('label'));
      setTooltipStyle({
        display: 'block',
        left: position.x + 10,
        top: position.y - 30
      });
      
      // Highlight the node
      node.style({
        'width': (node.data('size') * 1.2),
        'height': (node.data('size') * 1.2),
        'z-index': 100
      });
    });

    cy.on('mouseout', 'node', (event) => {
      const node = event.target;
      
      // Hide tooltip
      setTooltipStyle({ ...tooltipStyle, display: 'none' });
      
      // Reset node size
      node.style({
        'width': node.data('size'),
        'height': node.data('size'),
        'z-index': 10
      });
    });

    cy.on('tap', 'node', (event) => {
      const node = event.target;
      console.log('Selected node:', node.data('label'));
    });
  }, []);

  useEffect(() => {
    if (cyRef.current && !isLoading && nodes.length > 0) {
      // Center the graph
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
