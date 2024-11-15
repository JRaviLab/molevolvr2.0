import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FaCropSimple,
  FaDownload,
  FaExpand,
  FaRegImage,
  FaShareNodes,
  FaTableCellsLarge,
} from "react-icons/fa6";
import clsx from "clsx";
import cytoscape from "cytoscape";
import type {
  BreadthFirstLayoutOptions,
  CircleLayoutOptions,
  ConcentricLayoutOptions,
  Core,
  CoseLayoutOptions,
  Css,
  EdgeSingular,
  GridLayoutOptions,
  LayoutOptions,
  Layouts,
  NodeSingular,
  RandomLayoutOptions,
} from "cytoscape";
import avsdf, { type AvsdfLayoutOptions } from "cytoscape-avsdf";
import cola from "cytoscape-cola";
import dagre, { type DagreLayoutOptions } from "cytoscape-dagre";
import fcose, { type FcoseLayoutOptions } from "cytoscape-fcose";
import klay, { type KlayLayoutOptions } from "cytoscape-klay";
import spread from "cytoscape-spread";
import { extent } from "d3";
import domtoimage from "dom-to-image-more";
import { omit, orderBy, startCase, truncate } from "lodash";
import {
  useFullscreen,
  useLocalStorage,
  useResizeObserver,
} from "@reactuses/core";
import Collapse from "@/assets/collapse.svg?react";
import Expand from "@/assets/expand.svg?react";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Popover from "@/components/Popover";
import type { Option } from "@/components/SelectSingle";
import SelectSingle from "@/components/SelectSingle";
import Slider from "@/components/Slider";
import { getColorMap, mixColors } from "@/util/color";
import {
  downloadCsv,
  downloadJpg,
  downloadJson,
  downloadPng,
  downloadTsv,
} from "@/util/download";
import { useTheme } from "@/util/hooks";
import { lerp } from "@/util/math";
import { sleep } from "@/util/misc";
import { getShapeMap } from "@/util/shapes";
import { formatNumber } from "@/util/string";
import classes from "./Network.module.css";

type Node = {
  /** unique id */
  id: string;
  /** human-readable label */
  label?: string;
  /** arbitrary type/category */
  type?: string;
  /** metric that determines node size, sorting, and filtering */
  strength?: number;
  /** any extra info about edge */
  [key: string]: string | number | undefined;
};

type Edge = {
  /** unique id */
  id: string;
  /** human-readable label */
  label?: string;
  /** start node id */
  source: string;
  /** end node id */
  target: string;
  /** arbitrary type/category */
  type?: string;
  /** -1 = backwards, 1 = forwards, 0 = both, undefined = neither */
  direction?: -1 | 0 | 1;
  /** metric that determines edge size, sorting, and filtering */
  strength?: number;
  /** any extra info about edge */
  [key: string]: string | number | undefined;
};

type Props = {
  nodes: Node[];
  edges: Edge[];
};

/** settings */
const minNodeSize = 30;
const maxNodeSize = 50;
const minEdgeSize = 1;
const maxEdgeSize = 3;
const edgeLength = maxNodeSize * 1.5;
const fontSize = 10;
const padding = 10;
const minZoom = 0.2;
const maxZoom = 5;
const aspectRatio = 16 / 9;
const boundingBox = {
  x1: 8 * -minNodeSize * aspectRatio,
  y1: 8 * -minNodeSize,
  x2: 8 * minNodeSize * aspectRatio,
  y2: 8 * minNodeSize,
};

/** import non-built-in layout algorithms */
cytoscape.use(fcose);
cytoscape.use(dagre);
cytoscape.use(cola);
cytoscape.use(klay);
cytoscape.use(avsdf);
cytoscape.use(spread);

/** extra props on layout options */
type LayoutExtras = { label: string };

/** layout algorithms and their options */
const layouts = [
  {
    /** https://js.cytoscape.org/#layouts/random */
    name: "random",
    label: "Random",
    padding,
    boundingBox,
  } satisfies RandomLayoutOptions & LayoutExtras,
  {
    /** https://js.cytoscape.org/#layouts/grid */
    name: "grid",
    label: "Grid",
    padding,
    boundingBox,
    avoidOverlap: true,
    avoidOverlapPadding: padding,
    spacingFactor: 1.5,
    condense: true,
    sort: undefined,
  } satisfies GridLayoutOptions & LayoutExtras,
  {
    /** https://js.cytoscape.org/#layouts/circle */
    name: "circle",
    label: "Circle",
    padding,
    boundingBox,
    avoidOverlap: true,
    spacingFactor: 1,
    radius: (boundingBox.y2 - boundingBox.y1) / 4,
    startAngle: (3 / 2) * Math.PI,
    clockwise: true,
    sort: undefined,
  } satisfies CircleLayoutOptions & LayoutExtras,
  {
    /** https://js.cytoscape.org/#layouts/concentric */
    name: "concentric",
    label: "Concentric",
    padding,
    boundingBox,
    startAngle: (3 / 2) * Math.PI,
    clockwise: true,
    minNodeSpacing: minNodeSize,
    avoidOverlap: true,
    spacingFactor: 1,
  } satisfies ConcentricLayoutOptions & LayoutExtras,
  /** https://js.cytoscape.org/#layouts/breadthfirst */
  {
    name: "breadthfirst",
    label: "Breadth First",
    padding,
    boundingBox,
    directed: false,
    circle: false,
    grid: false,
    spacingFactor: 1.5,
    avoidOverlap: true,
  } satisfies BreadthFirstLayoutOptions & LayoutExtras,
  {
    /** https://js.cytoscape.org/#layouts/cose */
    name: "cose",
    label: "CoSE",
    padding,
    boundingBox,
    componentSpacing: maxNodeSize,
    idealEdgeLength: () => edgeLength,
  } satisfies CoseLayoutOptions & LayoutExtras,
  {
    /** https://github.com/iVis-at-Bilkent/cytoscape.js-fcose?tab=readme-ov-file#api */
    name: "fcose",
    label: "fCoSE",
    padding,
    quality: "proof",
    randomize: false,
    animate: false,
    nodeSeparation: minNodeSize,
    idealEdgeLength: edgeLength,
  } satisfies FcoseLayoutOptions & LayoutExtras,
  {
    /** https://github.com/cytoscape/cytoscape.js-dagre?tab=readme-ov-file#api */
    name: "dagre",
    label: "Dagre",
    padding,
    boundingBox,
    spacingFactor: 1,
  } satisfies DagreLayoutOptions & LayoutExtras,
  {
    /** https://github.com/cytoscape/cytoscape.js-cola?tab=readme-ov-file#api */
    name: "cola",
    label: "Cola",
    padding,
    boundingBox,
    animate: false,
    nodeSpacing: 0,
    avoidOverlap: true,
    edgeLength: edgeLength,
    edgeSymDiffLength: edgeLength,
    edgeJaccardLength: edgeLength,
  } as LayoutOptions & LayoutExtras,
  {
    /** https://github.com/cytoscape/cytoscape.js-klay?tab=readme-ov-file#api */
    name: "klay",
    label: "Klay",
    padding,
    klay: {
      aspectRatio: 16 / 9,
      borderSpacing: padding,
      compactComponents: false,
      edgeSpacingFactor: 0.5,
      inLayerSpacingFactor: 0.5,
      spacing: minNodeSize,
      thoroughness: 7,
    },
  } satisfies KlayLayoutOptions & LayoutExtras,
  {
    /** https://github.com/iVis-at-Bilkent/cytoscape.js-avsdf?tab=readme-ov-file#api */
    name: "avsdf",
    label: "AVSDF",
    padding,
    animate: false,
    nodeSeparation: edgeLength,
  } satisfies AvsdfLayoutOptions & LayoutExtras,
  {
    /** https://github.com/cytoscape/cytoscape.js-spread?tab=readme-ov-file#api */
    name: "spread",
    label: "Spread",
    padding,
    boundingBox,
    minDist: edgeLength,
  } as LayoutOptions & LayoutExtras,
] as const;

/** layout algorithm dropdown options */
const layoutOptions = layouts.map(({ name, label }) => ({
  id: name,
  primary: label,
})) satisfies Option[];

const Network = ({ nodes: _nodes, edges: _edges }: Props) => {
  const root = useRef<HTMLDivElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);
  const graph = useRef<Core | null>(null);
  const layout = useRef<Layouts | null>(null);

  /** reactive CSS vars */
  const theme = useTheme();

  /** selected nodes/edges */
  const [selectedItems, setSelectedItems] = useState<(Node | Edge)[]>([]);

  /** max number of nodes */
  const [maxNodes, setMaxNodes] = useState(20);

  /** selected node/edge layout algorithm */
  const [selectedLayout, setSelectedLayout] = useState<
    (typeof layoutOptions)[number]["id"]
  >(layoutOptions[6]!.id);

  /** selected layout parameters */
  const layoutParams =
    layouts.find((layout) => layout.name === selectedLayout) ?? layouts[0]!;

  /** full width */
  const [expanded, setExpanded] = useLocalStorage("network-expanded", false);

  /** map of node types to colors */
  const nodeColors = useMemo(
    () => getColorMap(_nodes.map((node) => node.type ?? "")),
    [_nodes],
  );
  /** map of node types to shapes */
  const nodeShapes = useMemo(
    () => getShapeMap(_nodes.map((node) => node.type ?? "")),
    [_nodes],
  );
  /** range of node strengths */
  const [minNodeStrength = 0, maxNodeStrength = 1] = useMemo(
    () => extent(_nodes.flatMap((node) => node.strength ?? [])),
    [_nodes],
  );
  /** derive and map properties for each node */
  const nodes = useMemo(
    () =>
      orderBy(_nodes, "strength")
        .slice(0, maxNodes)
        .map((node) => ({
          ...node,
          label: node.label ?? node.id,
          type: node.type ?? "",
          size: lerp(
            node.strength ?? minNodeStrength,
            minNodeStrength,
            maxNodeStrength,
            minNodeSize,
            maxNodeSize,
          ),
          color: nodeColors[node.type ?? ""]!,
          shape: nodeShapes[node.type ?? ""]!,
        })),
    [
      _nodes,
      maxNodes,
      minNodeStrength,
      maxNodeStrength,
      nodeColors,
      nodeShapes,
    ],
  );

  type Node = (typeof nodes)[number];
  type Edge = (typeof edges)[number];

  /** map of edge types to colors */
  const edgeColors = useMemo(
    () => getColorMap(_edges.map((edge) => edge.type ?? "")),
    [_edges],
  );
  /** range of edge strengths */
  const [minEdgeStrength = 0, maxEdgeStrength = 1] = useMemo(
    () => extent(_edges.flatMap((edge) => edge.strength ?? [])),
    [_edges],
  );
  /** derive and map properties for each edge */
  const edges = useMemo(
    () =>
      _edges
        .map((edge) => ({
          ...edge,
          label: edge.label ?? edge.id,
          type: edge.type ?? "",
          size: lerp(
            edge.strength ?? minEdgeStrength,
            minEdgeStrength,
            maxEdgeStrength,
            minEdgeSize,
            maxEdgeSize,
          ),
          color: edgeColors[edge.type ?? ""]!,
        }))
        /** remove edges whose source/target nodes have been filtered out */
        .filter(
          (edge) =>
            nodes.find((node) => node.id === edge.source) &&
            nodes.find((node) => node.id === edge.target),
        ),
    [_edges, nodes, minEdgeStrength, maxEdgeStrength, edgeColors],
  );

  /** fit view to contents */
  const fit = async () => {
    await sleep(10);
    graph.current?.fit(undefined, padding);
  };

  /** init cytoscape graph and attach event listeners */
  useEffect(() => {
    if (!container.current) return;
    if (graph.current) return;

    /** init graph */
    graph.current = cytoscape({
      container: container.current,
      minZoom,
      maxZoom,
    });

    /** select/deselect items */
    graph.current.on("select unselect", "node, edge", () =>
      setSelectedItems(
        graph.current
          ?.elements(":selected")
          .map((element) => element.data() as Node | Edge) ?? [],
      ),
    );

    /** prevent infinite recursion from pan adjustment */
    let justPanned = false;

    /** when panning, limit pan */
    graph.current.on("viewport", () => {
      if (!graph.current) return;

      if (justPanned) return (justPanned = false);
      justPanned = true;

      /** get current graph props */
      const zoom = graph.current.zoom();
      const pan = graph.current.pan();
      const width = graph.current.width();
      const height = graph.current.height();
      const paddingH = width / 2;
      const paddingV = height / 2;

      /** get bounding box of graph elements */
      const { x1, y1, x2, y2 } = graph.current.elements().boundingBox();

      /** limit left pan */
      if (x2 * zoom + pan.x < paddingH) pan.x = paddingH - x2 * zoom;
      /** limit up pan */
      if (y2 * zoom + pan.y < paddingV) pan.y = paddingV - y2 * zoom;
      /** limit right pan */
      if (x1 * zoom + pan.x > width - paddingH)
        pan.x = width - paddingH - x1 * zoom;
      /** limit down pan */
      if (y1 * zoom + pan.y > height - paddingV)
        pan.y = height - paddingV - y1 * zoom;

      /** adjust pan */
      graph.current.pan(pan);
    });

    /** fit view */
    graph.current.on("layoutstop", fit);
    graph.current.on("dblclick", fit);

    /** indicate hover-ability */
    const over = () => {
      if (!container.current) return;
      container.current.style.cursor = "pointer";
    };
    const out = () => {
      if (!container.current) return;
      container.current.style.cursor = "";
    };
    graph.current.on("mouseover", "node", over);
    graph.current.on("mouseout", "node", out);
    graph.current.on("mouseover", "edge", over);
    graph.current.on("mouseout", "edge", out);
  }, []);

  /** update node/edge styles */
  useEffect(() => {
    if (!graph.current) return;

    /** style accessors, extracted to avoid repetition */
    const getNodeLabel = (node: NodeSingular) => node.data().label;
    const getNodeSize = (node: NodeSingular) => node.data().size;
    const getNodeColor = (node: NodeSingular) =>
      mixColors(
        node.selected() ? (theme["--black"] ?? "") : node.data().color,
        theme["--white"] ?? "",
      );
    const getNodeShape = (node: NodeSingular) => node.data().shape;
    const getNodeOpacity = (node: NodeSingular) => (node.active() ? 0.1 : 0);
    const getEdgeLabel = (edge: EdgeSingular) =>
      truncate(edge.data().label, { length: 10 });
    const getEdgeSize = (edge: EdgeSingular) => edge.data().size;
    const getEdgeArrowSize = () => 1;
    const getEdgeColor = (edge: EdgeSingular) =>
      mixColors(
        edge.selected() ? (theme["--black"] ?? "") : edge.data().color,
        theme["--white"] ?? "",
      );
    const getEdgeArrow =
      (directions: Edge["direction"][]) => (edge: EdgeSingular) =>
        directions.includes(edge.data().direction) ? "triangle" : "none";
    const getEdgeOpacity = (node: NodeSingular) => (node.active() ? 0.1 : 0);

    /** node style options */
    const nodeStyle: Css.Node | Css.Core | Css.Overlay = {
      width: getNodeSize,
      height: getNodeSize,
      backgroundColor: getNodeColor,
      shape: "polygon",
      "shape-polygon-points": getNodeShape,
      label: getNodeLabel,
      "font-size": fontSize,
      color: theme["--black"],
      "text-halign": "center",
      "text-valign": "center",
      "text-max-width": getNodeSize,
      "text-wrap": "wrap",
      // @ts-expect-error no type defs
      "underlay-padding": minNodeSize / 4,
      "underlay-opacity": getNodeOpacity,
      "underlay-shape": "ellipse",
      "overlay-opacity": 0,
    };

    /** edge style options */
    const edgeStyle: Css.Edge | Css.Core | Css.Overlay = {
      width: getEdgeSize,
      "curve-style": "bezier",
      "control-point-step-size": maxNodeSize,
      "line-color": getEdgeColor,
      "source-arrow-color": getEdgeColor,
      "target-arrow-color": getEdgeColor,
      "source-arrow-shape": getEdgeArrow([0, 1]),
      "target-arrow-shape": getEdgeArrow([0, -1]),
      "arrow-scale": getEdgeArrowSize,
      label: getEdgeLabel,
      "font-size": fontSize,
      color: theme["--black"],
      "text-rotation": "autorotate",
      // @ts-expect-error no type defs
      "underlay-padding": minEdgeSize / 2,
      "underlay-opacity": getEdgeOpacity,
      "underlay-shape": "ellipse",
      "overlay-opacity": 0,
      "loop-direction": "0",
    };

    graph.current.style([
      { selector: "node", style: nodeStyle },
      { selector: "edge", style: edgeStyle },
    ]);
  }, [theme]);

  /** update nodes/edges and layout */
  useEffect(() => {
    if (!graph.current) return;

    /** quick lookups for existing (old) and incoming (new) nodes/edges */
    const oldNodes = Object.fromEntries(
      graph.current.nodes().map((node) => [node.id, true]),
    );
    const oldEdges = Object.fromEntries(
      graph.current.edges().map((edge) => [edge.id, true]),
    );
    const newNodes = Object.fromEntries(nodes.map((node) => [node.id, true]));
    const newEdges = Object.fromEntries(edges.map((edge) => [edge.id, true]));

    /** remove nodes/edges that no longer exist */
    graph.current.remove(
      graph.current.nodes().filter((oldNode) => !newNodes[oldNode.id()]),
    );
    graph.current.remove(
      graph.current.edges().filter((oldEdge) => !newEdges[oldEdge.id()]),
    );
    /** add new nodes/edges */
    graph.current.add(
      nodes
        .filter((newNode) => !oldNodes[newNode.id])
        .map((newNode) => ({ group: "nodes", data: newNode })),
    );
    graph.current.add(
      edges
        .filter((newEdge) => !oldEdges[newEdge.id])
        .map((newEdge) => ({ group: "edges", data: newEdge })),
    );

    /** update layout */
    layout.current?.stop();
    layout.current = graph.current.layout(layoutParams);
    layout.current.start();
  }, [nodes, edges, layoutParams]);

  /** on resize */
  useResizeObserver(root, () => {
    graph.current?.resize();
  });

  /** download network */
  const download = useCallback(
    (format: string) => {
      if (!graph.current) return;
      if (!root.current) return;

      if (format === "png")
        domtoimage
          // @ts-expect-error non-comprehensive types for dom-to-image-more
          .toPng(root.current, { scale: 2 })
          .then((blob) => downloadPng(blob, "network"));

      if (format === "jpg")
        domtoimage
          // @ts-expect-error non-comprehensive types for dom-to-image-more
          .toJpeg(root.current, { scale: 2 })
          .then((blob) => downloadJpg(blob, "network"));

      if (format === "csv" || format === "tsv") {
        const download = format === "csv" ? downloadCsv : downloadTsv;
        download(
          nodes.map((node) =>
            omit(node, ["color", "shape", "size", "strength"]),
          ),
          ["network", "nodes"],
        );
        download(
          edges.map((edge) =>
            omit(edge, ["color", "shape", "size", "strength"]),
          ),
          ["network", "edges"],
        );
      }

      if (format === "json") downloadJson(graph.current.json(), "network");
    },
    [nodes, edges],
  );

  /** fullscreen viz */
  const [, { toggleFullscreen }] = useFullscreen(container);

  return (
    <Flex direction="column" full>
      <div
        ref={root}
        className={clsx(classes.network, expanded && classes.expanded)}
        style={{ aspectRatio }}
      >
        {/* legend */}
        <Flex
          direction="column"
          hAlign="left"
          vAlign="top"
          className={classes.legend}
          tabIndex={0}
        >
          {selectedItems.length ? (
            /** show info about selected nodes/edges */
            <>
              <Flex direction="column" hAlign="left" gap="sm">
                <strong>Selected items</strong>
                {selectedItems.map((node, index) => (
                  <Fragment key={index}>
                    <hr />
                    <div className="mini-table">
                      <span>Name</span>
                      <span>{node.label}</span>
                      {Object.entries(
                        omit(node, [
                          "id",
                          "source",
                          "target",
                          "label",
                          "direction",
                          "strength",
                          "size",
                          "color",
                          "shape",
                        ]),
                      ).map(([key, value]) => (
                        <Fragment key={key}>
                          <span>{startCase(key)}</span>
                          <span>{value}</span>
                        </Fragment>
                      ))}
                    </div>
                  </Fragment>
                ))}
              </Flex>
            </>
          ) : (
            /** if nothing selected, show color key */
            <>
              <Flex direction="column" hAlign="left" gap="sm">
                <div>
                  <strong>Nodes</strong>{" "}
                  <span className="secondary">
                    {formatNumber(nodes.length)}
                  </span>
                </div>

                {Object.entries(nodeColors).map(([key, value]) => (
                  <Flex key={key} gap="sm" wrap={false}>
                    <svg
                      viewBox="-1 -1 2 2"
                      className={classes["node-symbol"]}
                      style={{ color: value }}
                    >
                      <polygon
                        fill="currentColor"
                        points={nodeShapes[key]?.join(" ")}
                      />
                    </svg>
                    <div className={clsx(!key && "secondary")}>
                      {startCase(key) || "none"}
                    </div>
                  </Flex>
                ))}
              </Flex>

              <Flex direction="column" hAlign="left" gap="sm">
                <div>
                  <strong>Edges</strong>{" "}
                  <span className="secondary">
                    {formatNumber(edges.length)}
                  </span>
                </div>

                {Object.entries(edgeColors).map(([key, value]) => (
                  <Flex key={key} gap="sm" wrap={false}>
                    <div
                      className={classes["edge-symbol"]}
                      style={{ background: value }}
                    />
                    <div className={clsx(!key && "secondary")}>
                      {startCase(key) || "none"}
                    </div>
                  </Flex>
                ))}
              </Flex>
            </>
          )}
        </Flex>

        {/* cytoscape mount container */}
        <div ref={container} className={classes.container}></div>
      </div>

      {/* controls */}
      <Flex gap="lg" gapRatio={0.5}>
        <Flex>
          <Slider
            label="Max Nodes"
            layout="horizontal"
            min={1}
            max={100}
            step={1}
            value={maxNodes}
            onChange={setMaxNodes}
          />
          <SelectSingle
            label="Layout"
            layout="horizontal"
            options={layoutOptions}
            value={selectedLayout}
            onChange={setSelectedLayout}
          />
        </Flex>

        <Flex gap="xs">
          <Popover
            content={
              <Flex direction="column" hAlign="stretch" gap="xs">
                <Button
                  icon={<FaRegImage />}
                  text="PNG"
                  onClick={() => download("png")}
                  tooltip="High-resolution image"
                />
                <Button
                  icon={<FaRegImage />}
                  text="JPEG"
                  onClick={() => download("jpg")}
                  tooltip="Compressed image"
                />

                <Button
                  icon={<FaTableCellsLarge />}
                  text="CSV"
                  onClick={() => download("csv")}
                  tooltip="Raw node and edge data, comma-separated"
                />
                <Button
                  icon={<FaTableCellsLarge />}
                  text="TSV"
                  onClick={() => download("tsv")}
                  tooltip="Raw node and edge data, tab-separated"
                />

                <Button
                  icon={<FaShareNodes />}
                  text="JSON"
                  onClick={() => download("json")}
                  tooltip="For import into Cytoscape"
                />
              </Flex>
            }
          >
            <Button
              icon={<FaDownload />}
              design="hollow"
              tooltip="Download network"
            />
          </Popover>

          <Button
            icon={<FaCropSimple />}
            design="hollow"
            tooltip="Fit view to contents"
            onClick={fit}
          />

          <Button
            icon={expanded ? <Collapse /> : <Expand />}
            tooltip={expanded ? "Collapse width" : "Expand width"}
            design="hollow"
            onClick={() => setExpanded(!expanded)}
          />

          <Button
            icon={<FaExpand />}
            design="hollow"
            tooltip="Full screen"
            onClick={toggleFullscreen}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Network;
