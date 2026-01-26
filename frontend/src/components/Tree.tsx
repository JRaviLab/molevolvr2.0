import { Fragment, useMemo, useState } from "react";
import { curveStepBefore, hierarchy, line } from "d3";
import type { HierarchyNode } from "d3";
import { map, mapValues, max, min, orderBy, sum } from "lodash";
import Chart from "@/components/Chart";
import Legend from "@/components/Legend";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import type { Filename } from "@/util/download";
import { useTextSize, useTheme } from "@/util/hooks";
import { round } from "@/util/math";

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
  const theme = useTheme();

  const { truncateWidth } = useTextSize();

  type Node = Item & {
    /** normalized distance from parent */
    normDist?: number;
    /** distance from root (sum of ancestors dists) */
    rootDist?: number;
    /** normalized distance from root (sum of ancestors normalized dists) */
    normRootDist?: number;
  };

  const tree = useMemo(() => {
    /** hierarchical data structure with convenient access methods */
    const tree = hierarchy<Node>({ children: data });

    /** set fallbacks */
    tree.descendants().forEach((node) => {
      node.data.dist ??= node.depth > 0 ? 1 : 0;
    });

    /** normalize distances */
    const dists = tree.descendants().map((node) => node.data.dist!);
    const minDist = min(dists)!;
    const maxDist = max(dists)!;
    tree.descendants().forEach((node) => {
      node.data.normDist = (node.data.dist! + minDist) / (maxDist - minDist);
    });

    /** calc distance from root */
    tree.descendants().forEach((node) => {
      node.data.rootDist = sum(node.ancestors().map((node) => node.data.dist!));
      node.data.normRootDist = sum(
        node.ancestors().map((node) => node.data.normDist!),
      );
    });

    /** sort breadth by dist */
    tree.sort((a, b) => b.data.rootDist! - a.data.rootDist!);

    /** calc depths */
    tree.descendants().forEach((node) => {
      node.y = node.data.normRootDist! * size;
    });

    /** make leaves evenly spaced breadth-wise */
    tree.leaves().forEach((node, index) => {
      node.x = index * size;
    });

    /** go up tree */
    orderBy(tree.descendants(), "depth", "desc").forEach((node) => {
      if (!node.x) {
        /** position node breadth in middle of children */
        const xs = map(node.children ?? [], "x");
        node.x = ((min(xs) ?? 0) + (max(xs) ?? 0)) / 2;
      }
    });

    /** snap breadth to grid */
    tree.descendants().forEach((node) => {
      node.x = round(node.x!, size);
    });

    return tree;
  }, [data]);

  /** selected nodes */
  const [selected, setSelected] = useState<HierarchyNode<Node>[]>([]);
  const selectedA = selected[0];
  const selectedB = selected[1];

  /** path between selected nodes */
  const selectedPath = selectedA && selectedB ? selectedA.path(selectedB) : [];

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
              fill="none"
              stroke={
                isSelected ? theme["--color-accent"] : theme["--color-black"]
              }
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
                  {/* leaf node label */}
                  <line
                    x1={node.y}
                    x2={maxY}
                    y1={node.x ?? 0}
                    y2={node.x ?? 0}
                    stroke={theme["--color-black"]}
                    strokeWidth={lineWidth}
                    strokeDasharray={[lineWidth, 2 * lineWidth].join(" ")}
                  />
                  <text
                    x={maxY + 0.5 * size}
                    y={node.x ?? 0}
                    fill={theme["--color-black"]}
                  >
                    {truncateWidth(node.data.label ?? "-", sideWidth)}
                  </text>
                </>
              )}

              {/* node circle */}
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
                <circle
                  className="cursor-help"
                  cx={node.y ?? 0}
                  cy={node.x ?? 0}
                  r={nodeSize}
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
        <g transform={`translate(0, ${maxX + 2 * size})`}>
          <g fill={theme["--color-gray"]}>
            <text x={0} y={0 * size}>
              From
            </text>
            <text x={0} y={1 * size}>
              To
            </text>
            <text x={0} y={2 * size}>
              Dist.
            </text>
          </g>
          <g fill={theme["--color-black"]}>
            <text x={2 * size} y={0 * size}>
              {truncateWidth(
                selectedA?.data.label ?? "",
                maxY + sideWidth - 2 * size,
              )}
            </text>
            <text x={2 * size} y={1 * size}>
              {truncateWidth(
                selectedB?.data.label ?? "",
                maxY + sideWidth - 2 * size,
              )}
            </text>
            <text x={2 * size} y={2 * size}>
              {selectedDist.toFixed(2)}
            </text>
          </g>
        </g>
      )}
    </Chart>
  );
};

export default Tree;
