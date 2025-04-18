
const graphStyles = [
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

export default graphStyles;
