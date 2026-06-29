import type { HierarchyNode } from "d3";
import type { Filename } from "@/util/download";
import { Fragment, useState } from "react";
import { hierarchy } from "d3";
import { map, mapValues, max, min, orderBy, sum } from "lodash";
import Chart from "@/components/Chart";
import CheckBox from "@/components/CheckBox";
import Legend from "@/components/Legend";
import NumberBox from "@/components/NumberBox";
import SelectSingle from "@/components/SelectSingle";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import { useTextSize, useTheme } from "@/util/hooks";
import { round } from "@/util/math";
import { getShapeMap, shapeToString } from "@/util/shapes";

/** row height */
const rowHeight = 30;
/** circle size */
const nodeSize = 20;
/** line thickness */
const lineWidth = 1;
/** label size */
const labelWidth = 200;
/** dash pattern */
const dash = [2 * lineWidth, 4 * lineWidth].join(" ");

type Props = {
  /** title text */
  title?: string;
  /** download filename */
  filename?: Filename;
  /** chart data */
  data: Item[];
};

export type Item = {
  /** human-readable label */
  label?: string;
  /** arbitrary type/category */
  type?: string;
  /** distance from parent */
  dist?: number;
  /** children items */
  children?: Item[];
};

/** sort order options */
const sortOptions = [
  { id: "input", primary: "Input" },
  { id: "dist", primary: "Distance" },
  { id: "type", primary: "Type" },
] as const;

/** tree/hierarchy plot */
export default function Tree({ title, filename = [], data }: Props) {
  console.debug("tree render");

  const theme = useTheme();

  const { truncateWidth } = useTextSize();

  /** sort mode */
  const [sort, setSort] = useState<(typeof sortOptions)[number]["id"]>("dist");

  /** sort direction */
  const [flip, setFlip] = useState(false);

  /** collapse limit */
  const [collapse, setCollapse] = useState(999);

  type Node = Item & {
    /** key for comparing nodes */
    key?: string;
    /** distance from root (sum of ancestors dists) */
    rootDist?: number;
    /** distance from parent, collapsed if too large */
    collapsedDist?: number;
    /** collapsed distance from root */
    collapsedRootDist?: number;
    /** is node collapsed */
    isCollapsed?: boolean;
  };

  /** hierarchical data structure with convenient access methods */
  const tree = hierarchy<Node>({ children: data });

  /** horizontal = depth */
  /** vertical = breadth */

  /** set fallbacks */
  tree.descendants().forEach((node) => {
    node.data.key = [
      node.depth,
      node.data.label ?? "-",
      node.data.type ?? "-",
      node.data.dist ?? 0,
    ].join("|");
    node.data.dist ??= node.depth > 0 ? 1 : 0;
    node.data.collapsedDist = Math.min(node.data.dist!, collapse);
    node.data.isCollapsed = node.data.dist! > collapse;
  });

  /** calc distance from root */
  tree.descendants().forEach((node) => {
    node.data.rootDist = sum(node.ancestors().map((node) => node.data.dist!));
    node.data.collapsedRootDist = sum(
      node.ancestors().map((node) => node.data.collapsedDist!),
    );
  });

  /** list of node types */
  const nodeTypes = map(tree.descendants(), (node) => node.data.type ?? "");

  /** sort breadth by dist */
  /** https://github.com/d3/d3-hierarchy/blob/main/src/hierarchy/sort.js */
  tree.eachBefore((node) => {
    node.children?.sort((a, b) => {
      if (sort === "dist") return b.data.dist! - a.data.dist!;
      if (sort === "type")
        return (a.data.type ?? "").localeCompare(b.data.type ?? "");
      return 0;
    });
    if (flip) node.children?.reverse();
  });

  /** place nodes along depth */
  tree.descendants().forEach((node) => (node.x = node.data.collapsedRootDist!));

  /** normalize depth */
  const minX = min(map(tree.descendants(), "x")) ?? 0;
  const maxX = max(map(tree.descendants(), "x")) ?? 0;
  tree
    .descendants()
    .forEach((node) => (node.x = (node.x! - minX) / (maxX - minX)));

  /** place leaves evenly spaced along breadth */
  tree.leaves().forEach((node, index) => (node.y = index));

  /** go up tree */
  orderBy(tree.descendants(), "depth", "desc").forEach((node) => {
    if (!node.y) {
      /** position node breadth in middle of children */
      const ys = map(node.children ?? [], "y");
      node.y = ((min(ys) ?? 0) + (max(ys) ?? 0)) / 2;
    }
  });

  /** snap breadth to grid */
  tree.descendants().forEach((node) => (node.y = round(node.y!)));

  /** max node breadth */
  const maxY = max(map(tree.descendants(), "y")) ?? 0;

  /** selected nodes */
  const [selected, setSelected] = useState<string[]>([]);
  const selectedA = tree.find((node) => node.data.key === selected[0]);
  const selectedB = tree.find((node) => node.data.key === selected[1]);

  /** path between selected nodes */
  const selectedPath =
    selectedA && selectedB
      ? selectedA.path(selectedB).map((node) => node.data.key!)
      : [];

  /** dist between selected nodes */
  const selectedDist = Math.abs(
    (selectedA?.data.rootDist ?? 0) - (selectedB?.data.rootDist ?? 0),
  );

  /** map of node types to colors */
  const colorMap = useColorMap(nodeTypes, "mode");

  /** map of node types to shapes */
  const shapeMap = getShapeMap(nodeTypes);

  /** clear selection */
  const deselect = () => setSelected([]);

  /** select node */
  const select = (node: HierarchyNode<Node>) =>
    setSelected(
      selected.includes(node.data.key!)
        ? selected.filter((key) => key !== node.data.key)
        : selected.slice(0, 1).concat([node.data.key!]),
    );

  return (
    <Chart
      title={title}
      filename={[...filename, "tree"]}
      onClick={deselect}
      containerProps={{ className: "w-full" }}
      controls={[
        <SelectSingle
          key="sort"
          label="Sort"
          options={sortOptions}
          value={sort}
          onChange={setSort}
        />,
        <CheckBox key="flip" label="Flip" value={flip} onChange={setFlip} />,
        <NumberBox
          key="collapse"
          label="Collapse"
          tooltip="Collapse horizontal lines longer than this. Only affects drawing."
          min={1}
          max={max(tree.descendants().map((node) => node.data.dist!))!}
          value={collapse}
          onChange={setCollapse}
        />,
      ]}
    >
      {({ width }) => {
        console.debug("tree chart render");

        /** width of tree view area */
        width = Math.max(width - 2 * labelWidth - rowHeight, labelWidth);

        return (
          <>
            <Legend
              x={-rowHeight}
              y={0}
              w={labelWidth}
              anchor={[1, 0]}
              entries={mapValues(colorMap, (color, type) => ({
                color,
                shape: shapeMap[type],
              }))}
            />

            <g>
              {tree.links().map(({ source, target }, index) => {
                /** is link selected */
                const isSelected =
                  selected.length > 1
                    ? selectedPath.includes(source.data.key!) &&
                      selectedPath.includes(target.data.key!)
                    : selected.length === 1
                      ? false
                      : null;

                /** start point */
                const sourceX = source.x! * width;
                const targetX = target.x! * width;
                /** end point */
                const sourceY = source.y! * rowHeight;
                const targetY = target.y! * rowHeight;

                /** collapse symbol position */
                const breakX = targetX - 1.5 * nodeSize;
                const breakSize = nodeSize / 6;

                /** path to draw */
                const points = !target.data.isCollapsed
                  ? [
                      ["M", sourceX, sourceY],
                      ["L", sourceX, targetY],
                      ["L", targetX, targetY],
                    ]
                  : [
                      ["M", sourceX, sourceY],
                      ["L", sourceX, targetY],
                      ["L", breakX - 1.5 * breakSize, targetY],
                      ["L", breakX - 0.5 * breakSize, targetY - breakSize * 2],
                      ["L", breakX + 0.5 * breakSize, targetY + breakSize * 2],
                      ["L", breakX + 1.5 * breakSize, targetY],
                      ["L", targetX, targetY],
                    ];

                return (
                  <path
                    key={index}
                    d={points.map((line) => line.join(" ")).join(" ")}
                    fill="none"
                    stroke={
                      isSelected
                        ? theme["--color-accent"]
                        : theme["--color-black"]
                    }
                    strokeWidth={isSelected ? 2 * lineWidth : lineWidth}
                    opacity={isSelected === false ? 0.25 : 1}
                  />
                );
              })}
            </g>

            <g>
              {orderBy(tree.descendants(), ["x", "y"]).map((node, index) => {
                /** is node selected */
                const isSelected = selected.length
                  ? selected.includes(node.data.key!) ||
                    selectedPath.includes(node.data.key!)
                  : null;

                return (
                  <Fragment key={index}>
                    {!node.children && (
                      <>
                        {/* leaf node label */}
                        <line
                          x1={(node.x ?? 0) * width}
                          x2={width}
                          y1={(node.y ?? 0) * rowHeight}
                          y2={(node.y ?? 0) * rowHeight}
                          stroke={theme["--color-black"]}
                          strokeWidth={lineWidth}
                          strokeDasharray={dash}
                        />
                        <text
                          x={width + rowHeight}
                          y={(node.y ?? 0) * rowHeight}
                          fill={theme["--color-black"]}
                        >
                          {truncateWidth(node.data.label ?? "-", labelWidth)}
                        </text>
                      </>
                    )}

                    {/* node shape */}
                    <Tooltip
                      content={
                        <>
                          <dl>
                            <dt>Name</dt>
                            <dd>{node.data.label}</dd>
                            <dt>Type</dt>
                            <dd>{node.data.type}</dd>
                            {node.ancestors().length > 1 && (
                              <>
                                <dt>Dist</dt>
                                <dd>{node.data.dist?.toFixed(3)}</dd>
                                <dt>From root</dt>
                                <dd>{node.data.rootDist?.toFixed(3)}</dd>
                              </>
                            )}
                          </dl>
                          <hr />
                          Click to select. Select two to see path between them.
                        </>
                      }
                    >
                      <polygon
                        className="cursor-help"
                        points={shapeToString(
                          shapeMap[node.data.type ?? ""],
                          node.x! * width,
                          node.y! * rowHeight,
                          nodeSize / 2,
                        )}
                        fill={
                          isSelected === false
                            ? theme["--color-light-gray"]
                            : colorMap[node.data.type ?? ""]
                        }
                        stroke={theme["--color-black"]}
                        strokeWidth={lineWidth}
                        tabIndex={0}
                        role="graphics-symbol"
                        onClick={(event) => {
                          /** prevent deselect from container onClick */
                          event.stopPropagation();
                          select(node);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            select(node);
                          }
                          if (event.key === "Escape") deselect();
                        }}
                      />
                    </Tooltip>
                  </Fragment>
                );
              })}
            </g>

            {/* selected */}
            {selectedPath.length > 1 && (
              <g transform={`translate(0, ${(maxY + 2) * rowHeight})`}>
                <g fill={theme["--color-gray"]}>
                  <text x={0} y={0 * rowHeight}>
                    From
                  </text>
                  <text x={0} y={1 * rowHeight}>
                    To
                  </text>
                  <text x={0} y={2 * rowHeight}>
                    Dist.
                  </text>
                </g>
                <g fill={theme["--color-black"]}>
                  <text x={labelWidth / 2} y={0 * rowHeight}>
                    {truncateWidth(
                      selectedA?.data.label ?? "",
                      width - labelWidth / 2,
                    )}
                  </text>
                  <text x={labelWidth / 2} y={1 * rowHeight}>
                    {truncateWidth(
                      selectedB?.data.label ?? "",
                      width - labelWidth / 2,
                    )}
                  </text>
                  <text x={labelWidth / 2} y={2 * rowHeight}>
                    {selectedDist.toFixed(2)}
                  </text>
                </g>
              </g>
            )}
          </>
        );
      }}
    </Chart>
  );
}
