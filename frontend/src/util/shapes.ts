import cytoscape from "cytoscape";
import { omit } from "lodash";

type NodeShapesRecord = Record<cytoscape.Css.NodeShape, { points?: number[] }>;

type CytoscapeRenderer = {
  prototype: {
    registerNodeShapes: () => void;
    nodeShapes: NodeShapesRecord;
  };
};

/** initialise cytoscape base renderer extension and access only nodeShapes */
export const nodeShapes = ((): NodeShapesRecord => {
  const baseRenderer = cytoscape("renderer", "base") as CytoscapeRenderer;
  baseRenderer.prototype.registerNodeShapes();
  const shapes = baseRenderer.prototype.nodeShapes;
  return omit(shapes, "makePolygon");
})();
