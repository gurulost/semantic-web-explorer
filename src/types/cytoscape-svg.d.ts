
import 'cytoscape';

declare module 'cytoscape' {
  interface Core {
    /**
     * Export the graph as an SVG string
     * @param opts - same options the plugin accepts
     */
    svg(opts?: Record<string, unknown>): string;
  }
}
