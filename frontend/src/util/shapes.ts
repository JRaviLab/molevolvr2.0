import cytoscape from "cytoscape";

export type NodeShape = {
  name: string;
  points?: number[];
};

type CytoscapeRenderer = {
  prototype: {
    registerNodeShapes: () => void;
    nodeShapes: Record<string, NodeShape>;
  };
};

/** initialise cytoscape base renderer extension and access only nodeShapes */
export const nodeShapes = ((): Record<string, NodeShape> => {
  const baseRenderer = cytoscape("renderer", "base") as CytoscapeRenderer;
  baseRenderer.prototype.registerNodeShapes();
  const shapes = baseRenderer.prototype.nodeShapes;
  return Object.fromEntries(
    Object.entries(shapes).filter(([key]) => key !== "makePolygon"),
  );
})();
