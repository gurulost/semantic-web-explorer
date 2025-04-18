
import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { Node } from '@/services/api';
import chroma from 'chroma-js';

interface GraphTooltip {
  display: string;
  left: number;
  top: number;
}

export const useSemanticGraph = (
  nodes: Node[], 
  edges: string[][], 
  commonNeighbors: string[] = []
) => {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<GraphTooltip>({ display: 'none', left: 0, top: 0 });
  const [tooltipContent, setTooltipContent] = useState('');

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

  useEffect(() => {
    if (!cyRef.current || !nodes.length) return;
    cyRef.current.fit();
    cyRef.current.zoom({
      level: 1.2,
      position: { x: 0, y: 0 }
    });
  }, [nodes]);

  const setupGraphEvents = (cy: cytoscape.Core) => {
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
      setTooltipStyle(prev => ({ ...prev, display: 'none' }));
    });

    cy.on('tap', 'node', (event) => {
      const node = event.target;
      console.log('Selected node:', node.data('label'));
    });
  };

  return {
    cyRef,
    elements,
    tooltipStyle,
    tooltipContent,
    setupGraphEvents
  };
};
