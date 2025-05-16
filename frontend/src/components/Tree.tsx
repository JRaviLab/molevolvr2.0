import { Fragment, useEffect, useMemo, useRef } from "react";
import { curveStepBefore, hierarchy, cluster as layout, line } from "d3";
import { map, max, min, orderBy, truncate } from "lodash";
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
const size = 100;

/** link line generator */
const link = line().curve(curveStepBefore);

const Tree = ({ data }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const tree = useMemo(() => {
    /** hierarchical data structure with convenient access methods */
    const tree = hierarchy<Item>({ children: data });

    /** use default layout */
    layout<Item>()
      .nodeSize([size, size])
      .separation(() => 1)(tree);

    /** delete all positions except leaves */
    tree.each((node) => {
      if (node.children?.length) delete node.x;
    });

    /** force all leaves to be evenly spaced */
    orderBy(tree.leaves(), "x").forEach(
      (node, index) => (node.x = index * size),
    );

    /** go up tree */
    orderBy(tree.descendants(), "depth", "desc").forEach((node) => {
      if (!node.x) {
        /** position node in middle of children */
        const _min = min(map(node.children ?? [], "x")) ?? 0;
        const _max = max(map(node.children ?? [], "x")) ?? 0;
        node.x = round((_min + _max) / 2, size);
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

      {tree.descendants().map((node, index) => (
        <Fragment key={index}>
          <circle
            cx={node.y ?? 0}
            cy={node.x ?? 0}
            r={fontSize / 5}
            fill={theme["--black"]}
          />
          {!node.children?.length && (
            <text
              x={(node.y ?? 0) + fontSize / 2}
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
