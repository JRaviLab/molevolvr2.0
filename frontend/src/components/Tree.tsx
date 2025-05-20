import { Fragment, useEffect, useMemo, useRef } from "react";
import {
  FaBezierCurve,
  FaDownload,
  FaFilePdf,
  FaRegImage,
} from "react-icons/fa6";
import { curveStepBefore, hierarchy, line } from "d3";
import { map, max, min, orderBy, sum, truncate } from "lodash";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Popover from "@/components/Popover";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import { fitViewBox, printElement } from "@/util/dom";
import { downloadJpg, downloadPng, downloadSvg } from "@/util/download";
import { rootFontSize, useSvgTransform, useTheme } from "@/util/hooks";
import { round } from "@/util/math";
import classes from "./Tree.module.css";

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
    const tree = hierarchy<Item & { rootDist?: number }>({
      children: data,
    });

    /** make leaves evenly spaced breadth-wise */
    tree.leaves().forEach((node, index) => (node.x = index * size));

    /** calculate distance from root */
    tree
      .descendants()
      .forEach(
        (node) =>
          (node.data.rootDist ??=
            sum(node.ancestors().map((node) => node.data.dist ?? 1)) ?? 0),
      );

    /** position depths */
    tree
      .descendants()
      .forEach((node) => (node.y ??= node.data.rootDist! * size));

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

  /** max node depth */
  const maxY = max(map(tree.descendants(), "y")) ?? 0;

  /** reactive CSS vars */
  const theme = useTheme();

  /** font size, in svg units */
  const fontSize = useSvgTransform(svgRef.current, 1, rootFontSize()).h;

  /** fit view box */
  useEffect(() => {
    fitViewBox(svgRef.current, 0.01);
  });

  /** map of node types to colors */
  const colorMap = useColorMap(
    map(tree.descendants(), (node) => node.data.type ?? ""),
    "mode",
  );

  const strokeWidth = fontSize / 15;

  return (
    <Flex direction="column" gap="lg" full>
      {/* chart */}
      <svg
        ref={svgRef}
        className={classes.chart}
        style={{ height: 1.5 * rootFontSize() * tree.leaves().length + "px" }}
      >
        {tree.links().map(({ source, target }, index) => (
          <path
            key={index}
            className={classes.line}
            fill="none"
            stroke={theme["--black"]}
            strokeWidth={strokeWidth}
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
            {!node.children && (
              <>
                <line
                  x1={node.y}
                  x2={maxY + fontSize * 0.75}
                  y1={node.x ?? 0}
                  y2={node.x ?? 0}
                  stroke={theme["--black"]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={[strokeWidth, strokeWidth * 2].join(" ")}
                />
                <text
                  x={maxY + fontSize}
                  y={node.x ?? 0}
                  fill={theme["--black"]}
                  dominantBaseline="central"
                  style={{ fontSize }}
                >
                  {truncate(node.data.label ?? "-", { length: 20 })}
                </text>
              </>
            )}

            <Tooltip
              content={
                <div className="mini-table">
                  <span>Name</span>
                  <span>{node.data.label}</span>
                  <span>Type</span>
                  <span>{node.data.type}</span>
                  <span>Dist</span>
                  <span>{node.data.dist?.toFixed(3)}</span>
                  <span>From root</span>
                  <span>{node.data.rootDist?.toFixed(3)}</span>
                </div>
              }
            >
              <circle
                className={classes.node}
                cx={node.y ?? 0}
                cy={node.x ?? 0}
                r={fontSize / 3}
                fill={colorMap[node.data.type ?? ""]}
                tabIndex={0}
                role="button"
              />
            </Tooltip>
          </Fragment>
        ))}
      </svg>

      {/* controls */}
      <Flex>
        <Popover
          content={
            <Flex direction="column" hAlign="stretch" gap="xs">
              <Button
                icon={<FaRegImage />}
                text="PNG"
                onClick={() =>
                  svgRef.current && downloadPng(svgRef.current, "tree")
                }
                tooltip="High-resolution image"
              />
              <Button
                icon={<FaRegImage />}
                text="JPEG"
                onClick={() =>
                  svgRef.current && downloadJpg(svgRef.current, "tree")
                }
                tooltip="Compressed image"
              />
              <Button
                icon={<FaBezierCurve />}
                text="SVG"
                onClick={() =>
                  svgRef.current && downloadSvg(svgRef.current, "tree")
                }
                tooltip="Vector image"
              />
              <Button
                icon={<FaFilePdf />}
                text="PDF"
                onClick={() => svgRef.current && printElement(svgRef.current)}
                tooltip="Print as pdf"
              />
            </Flex>
          }
        >
          <Button
            icon={<FaDownload />}
            design="hollow"
            tooltip="Download chart"
          />
        </Popover>
      </Flex>
    </Flex>
  );
};

export default Tree;
