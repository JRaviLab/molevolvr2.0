import { Fragment, useEffect, useMemo, useRef } from "react";
import { curveStepBefore, hierarchy, line } from "d3";
import { map, max, min, orderBy, truncate } from "lodash";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import { fitViewBox } from "@/util/dom";
import { rootFontSize, useSvgTransform, useTheme } from "@/util/hooks";
import { round } from "@/util/math";
import classes from "./Tree.module.css";

export type Item = {
  /** human-readable label */
  label?: string;
  /** arbitrary type/category */
  type?: string;
  /** children items */
  children?: Item[];
};

type Props = {
  /** chart data */
  data: Item[];
};

/** grid spacing in svg units */
const size = 50;

/** link line generator */
const link = line().curve(curveStepBefore);

const Tree = ({ data }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const tree = useMemo(() => {
    /** hierarchical data structure with convenient access methods */
    const tree = hierarchy<Item & { depth?: number }>({ children: data });

    /** make leaves evenly spaced breadth-wise */
    tree.leaves().forEach((node, index) => (node.x = index * size));

    /** position leaf depths */
    tree.leaves().forEach((node) => (node.data.depth = tree.height));

    /** push nodes down */
    tree.leaves().forEach((leaf) =>
      leaf.ancestors().forEach((node) => {
        if (node.children?.length)
          node.data.depth = (min(map(node.children, "data.depth")) ?? 0) - 1;
      }),
    );

    /** position depths */
    tree
      .descendants()
      .forEach((node) => (node.y ??= ((node.data.depth ?? 0) * size) / 1.5));

    /** go up tree */
    orderBy(tree.descendants(), "depth", "desc").forEach((node) => {
      if (!node.x) {
        /** position node in middle of children */
        const xs = map(node.children ?? [], "x");
        node.x = ((min(xs) ?? 0) + (max(xs) ?? 0)) / 2;
        /** snap to grid */
        node.x = round(node.x, size);
      }
    });
    return tree;
  }, [data]);

  /** fit view box */
  useEffect(() => {
    fitViewBox(svgRef.current, 0.01);
  });

  /** reactive CSS vars */
  const theme = useTheme();

  /** font size, in svg units */
  const fontSize = useSvgTransform(svgRef, 1, rootFontSize()).h;

  /** map of node types to colors */
  const colorMap = useColorMap(
    map(tree.descendants(), (node) => node.data.type ?? ""),
    "mode",
  );

  return (
    <svg ref={svgRef} className={classes.chart}>
      {tree.links().map(({ source, target }, index) => (
        <path
          key={index}
          className={classes.line}
          fill="none"
          stroke={theme["--black"]}
          strokeWidth={fontSize / 10}
          d={
            link([
              [source.y ?? 0, source.x ?? 0],
              [target.y ?? 0, target.x ?? 0],
            ]) ?? ""
          }
        />
      ))}

      {orderBy(tree.descendants(), ["x", "y"]).map((node, index) => (
        <Fragment key={index}>
          <Tooltip
            content={
              <div className="mini-table">
                <span>Name</span>
                <span>{node.data.label}</span>
                <span>Type</span>
                <span>{node.data.type}</span>
              </div>
            }
          >
            <circle
              className={classes.node}
              cx={node.y ?? 0}
              cy={node.x ?? 0}
              r={fontSize / 2}
              fill={colorMap[node.data.type ?? ""]}
              stroke={theme["--black"]}
              strokeWidth={fontSize / 10}
              tabIndex={0}
              role="button"
            />
          </Tooltip>

          {!node.children?.length && (
            <text
              x={(node.y ?? 0) + fontSize}
              y={node.x ?? 0}
              fill={theme["--black"]}
              dominantBaseline="central"
              style={{ fontSize }}
            >
              {truncate(node.data.label ?? "-", { length: 20 })}
            </text>
          )}
        </Fragment>
      ))}
    </svg>
  );
};

export default Tree;
