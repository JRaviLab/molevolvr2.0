import type { HierarchyNode } from "d3";
import type { Filename } from "@/util/download";
import { Fragment, useMemo, useState } from "react";
import { curveStepBefore, hierarchy, line } from "d3";
import { map, mapValues, max, min, orderBy, sum } from "lodash";
import Chart from "@/components/Chart";
import CheckBox from "@/components/CheckBox";
import Legend from "@/components/Legend";
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

/** sort order options */
const sortOptions = [
  {
    id: "input",
    primary: "Input",
  },
  {
    id: "dist",
    primary: "Distance",
  },
  {
    id: "type",
    primary: "Type",
  },
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

  type Node = Item & {
    /** distance from root (sum of ancestors dists) */
    rootDist?: number;
  };

  /** hierarchical data structure with convenient access methods */
  const tree = useMemo(() => {
    const tree = hierarchy<Node>({ children: data });

    /** horizontal = depth */
    /** vertical = breadth */

    /** set fallbacks */
    tree.descendants().forEach((node) => {
      node.data.dist ??= node.depth > 0 ? 1 : 0;
    });

    /** calc distance from root */
    tree.descendants().forEach((node) => {
      node.data.rootDist = sum(node.ancestors().map((node) => node.data.dist!));
    });

    /** sort breadth by dist */
    /** https://github.com/d3/d3-hierarchy/blob/main/src/hierarchy/sort.js */
    tree.eachAfter((node) => {
      node.children?.sort((a, b) => {
        if (sort === "dist") return b.data.dist! - a.data.dist!;
        if (sort === "type")
          return (a.data.type ?? "").localeCompare(b.data.type ?? "");
        return 0;
      });
      if (flip) node.children?.reverse();
    });

    /** place nodes along depth */
    tree.descendants().forEach((node) => {
      node.x = node.data.rootDist!;
    });

    /** normalize depth */
    const minX = min(map(tree.descendants(), "x")) ?? 0;
    const maxX = max(map(tree.descendants(), "x")) ?? 0;
    tree.descendants().forEach((node) => {
      node.x = (node.x! - minX) / (maxX - minX);
    });

    /** place leaves evenly spaced along breadth */
    tree.leaves().forEach((node, index) => {
      node.y = index;
    });

    /** go up tree */
    orderBy(tree.descendants(), "depth", "desc").forEach((node) => {
      if (!node.y) {
        /** position node breadth in middle of children */
        const ys = map(node.children ?? [], "y");
        node.y = ((min(ys) ?? 0) + (max(ys) ?? 0)) / 2;
      }
    });

    /** snap breadth to grid */
    tree.descendants().forEach((node) => {
      node.y = round(node.y!);
    });

    return tree;
  }, [data, sort, flip]);

  /** max node breadth */
  const maxY = max(map(tree.descendants(), "y")) ?? 0;

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

  /** list of node types */
  const nodeTypes = map(tree.descendants(), (node) => node.data.type ?? "");

  /** map of node types to colors */
  const colorMap = useColorMap(nodeTypes, "mode");

  /** map of node types to shapes */
  const shapeMap = getShapeMap(nodeTypes);

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
                    ? selectedPath.includes(source) &&
                      selectedPath.includes(target)
                    : selected.length === 1
                      ? false
                      : null;

                return (
                  <path
                    key={index}
                    fill="none"
                    stroke={
                      isSelected
                        ? theme["--color-accent"]
                        : theme["--color-black"]
                    }
                    strokeWidth={isSelected ? 2 * lineWidth : lineWidth}
                    opacity={isSelected === false ? 0.25 : 1}
                    d={
                      link([
                        [(source.x ?? 0) * width, (source.y ?? 0) * rowHeight],
                        [(target.x ?? 0) * width, (target.y ?? 0) * rowHeight],
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
                          x1={(node.x ?? 0) * width}
                          x2={width}
                          y1={(node.y ?? 0) * rowHeight}
                          y2={(node.y ?? 0) * rowHeight}
                          stroke={theme["--color-black"]}
                          strokeWidth={lineWidth}
                          strokeDasharray={[lineWidth, 2 * lineWidth].join(" ")}
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
