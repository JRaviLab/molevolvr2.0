import { Fragment, useMemo, useState } from "react";
import { curveStepBefore, hierarchy, line } from "d3";
import type { HierarchyNode } from "d3";
import { map, mapValues, max, min, orderBy, sum, uniqueId } from "lodash";
import Chart from "@/components/Chart";
import Legend from "@/components/Legend";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import type { Filename } from "@/util/download";
import { useTextSize, useTheme } from "@/util/hooks";
import { round } from "@/util/math";
import classes from "./Tree.module.css";

/** grid spacing */
const size = 30;
/** circle size */
const nodeSize = 6;
/** line thickness */
const lineWidth = 1;
/** width of legend and labels */
const sideWidth = 150;

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

/** link line generator */
const link = line().curve(curveStepBefore);

/** tree/hierarchy plot */
const Tree = ({ title, filename = [], data }: Props) => {
  /** reactive CSS vars */
  const theme = useTheme();

  const { truncateWidth } = useTextSize();

  type Node = Item & { id?: string; rootDist?: number };

  const tree = useMemo(() => {
    /** hierarchical data structure with convenient access methods */
    const tree = hierarchy<Node>({ children: data });

    /** set fallbacks */
    tree
      .descendants()
      .forEach((node) => (node.data.dist ??= node.depth > 0 ? 1 : 0));

    /** calculate distance from root */
    tree.descendants().forEach((node) => {
      node.data.id = uniqueId();
      node.data.rootDist ??= sum(
        node.ancestors().map((node) => node.data.dist ?? 0),
      );
    });

    /** sort breadth by dist */
    tree.sort((a, b) => (b.data.rootDist ?? 0) - (a.data.rootDist ?? 0));

    /** position depths */
    tree
      .descendants()
      .forEach((node) => (node.y ??= (node.data.rootDist ?? 0) * size));

    /** make leaves evenly spaced breadth-wise */
    tree.leaves().forEach((node, index) => (node.x = index * size));

    /** go up tree */
    orderBy(tree.descendants(), "depth", "desc").forEach((node) => {
      if (!node.x) {
        /** position node in middle of children */
        const xs = map(node.children ?? [], "x");
        node.x = ((min(xs) ?? 0) + (max(xs) ?? 0)) / 2;
      }
    });

    /** snap to grid */
    tree.descendants().forEach((node) => {
      node.x = round(node.x ?? 0, size);
    });

    return tree;
  }, [data]);

  /** selected nodes */
  const [selected, setSelected] = useState<HierarchyNode<Node>[]>([]);
  const selectedA = selected[0];
  const selectedB = selected[1];

  /** path between selected nodes */
  const selectedPath = selectedA && selectedB ? selectedA.path(selectedB) : [];

  /** dist between selected nodes */
  const selectedDist = Math.abs(
    (selectedA?.data.rootDist ?? 0) - (selectedB?.data.rootDist ?? 0),
  );

  /** max node depth */
  const maxY = max(map(tree.descendants(), "y")) ?? 0;

  /** max node breadth */
  const maxX = max(map(tree.descendants(), "x")) ?? 0;

  /** dist between selected nodes */
  const selectedDist = Math.abs(
    (selectedA?.data.rootDist ?? 0) - (selectedB?.data.rootDist ?? 0),
  );

  /** map of node types to colors */
  const colorMap = useColorMap(
    map(tree.descendants(), (node) => node.data.type ?? ""),
    "mode",
  );

  /** clear selection */
  const deselect = () => setSelected([]);

  /** select node */
  const select = (node: HierarchyNode<Node>) =>
    setSelected(
      selected.includes(node)
        ? selected.filter((n) => n !== node)
        : selected.slice(0, 1).concat([node]),
    );

  return (
    <Chart title={title} filename={[...filename, "tree"]} onClick={deselect}>
      <Legend
        x={-size}
        y={maxX / 2}
        w={sideWidth}
        anchor={[1, 0.5]}
        entries={mapValues(colorMap, (color) => ({ color }))}
      />

      <g>
        {tree.links().map(({ source, target }, index) => {
          /** is link selected */
          const isSelected =
            selected.length > 1
              ? selectedPath.includes(source) && selectedPath.includes(target)
              : selected.length === 1
                ? false
                : null;

          return (
            <path
              key={index}
              className={classes.line}
              fill="none"
              stroke={isSelected ? theme["--accent"] : theme["--black"]}
              strokeWidth={isSelected ? 2 * lineWidth : lineWidth}
              opacity={isSelected === false ? 0.25 : 1}
              d={
                link([
                  [source.y ?? 0, source.x ?? 0],
                  [target.y ?? 0, target.x ?? 0],
                ]) ?? ""
              }
            />
          );
        })}
      </g>

      <g>
        {orderBy(tree.descendants(), ["x", "y"]).map((node, index) => {
          /** is node selected */
          const isSelected = selected.length
            ? selected.includes(node) || selectedPath.includes(node)
            : null;

          return (
            <Fragment key={index}>
              {!node.children && (
                <>
                  <line
                    x1={node.y}
                    x2={maxY}
                    y1={node.x ?? 0}
                    y2={node.x ?? 0}
                    stroke={theme["--black"]}
                    strokeWidth={lineWidth}
                    strokeDasharray={[lineWidth, 2 * lineWidth].join(" ")}
                  />
                  <text
                    x={maxY}
                    y={node.x ?? 0}
                    fill={theme["--black"]}
                    transform={`translate(${2 * nodeSize}, 0)`}
                    dominantBaseline="central"
                  >
                    {truncateWidth(node.data.label ?? "-", sideWidth)}
                  </text>
                </>
              )}

              <Tooltip
                content={
                  <>
                    <div className="mini-table">
                      <span>Name</span>
                      <span>{node.data.label}</span>
                      <span>Type</span>
                      <span>{node.data.type}</span>
                      {node.ancestors().length > 1 && (
                        <>
                          <span>Dist</span>
                          <span>{node.data.dist?.toFixed(3)}</span>
                          <span>From root</span>
                          <span>{node.data.rootDist?.toFixed(3)}</span>
                        </>
                      )}
                    </div>
                    <hr />
                    Click to select. Select two to see path between them.
                  </>
                }
              >
                <circle
                  className={classes.node}
                  cx={node.y ?? 0}
                  cy={node.x ?? 0}
                  r={nodeSize}
                  fill={
                    isSelected === false
                      ? theme["--light-gray"]
                      : colorMap[node.data.type ?? ""]
                  }
                  stroke={theme["--black"]}
                  strokeWidth={lineWidth}
                  tabIndex={0}
                  role="button"
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
        <g transform={`translate(0, ${maxX + 2 * size})`}>
          <g fill={theme["--gray"]}>
            <text x={-2 * size} y={0 * size}>
              From
            </text>
            <text x={-2 * size} y={1 * size}>
              To
            </text>
            <text x={-2 * size} y={2 * size}>
              Dist.
            </text>
          </g>
          <g fill={theme["--black"]}>
            <text x={0} y={0 * size}>
              {truncateWidth(selectedA?.data.label ?? "", maxY + sideWidth)}
            </text>
            <text x={0} y={1 * size}>
              {truncateWidth(selectedB?.data.label ?? "", maxY + sideWidth)}
            </text>
            <text x={0} y={2 * size}>
              {selectedDist.toFixed(2)}
            </text>
          </g>
        </g>
      )}
    </Chart>
  );
};

export default Tree;
