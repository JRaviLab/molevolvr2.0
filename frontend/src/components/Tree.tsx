import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  FaBezierCurve,
  FaDownload,
  FaFilePdf,
  FaRegImage,
} from "react-icons/fa6";
import clsx from "clsx";
import { curveStepBefore, hierarchy, line, type HierarchyNode } from "d3";
import {
  map,
  mapValues,
  max,
  min,
  orderBy,
  sum,
  truncate,
  uniqueId,
} from "lodash";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Legend from "@/components/Legend";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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

  /** line thickness, based on font size */
  const strokeWidth = fontSize / 15;

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
    <Flex direction="column" gap="lg" full>
      {/* keyboard listener not necessary here because we have one below */}
      {/* eslint-disable-next-line */}
      <div
        ref={containerRef}
        className={clsx("card", classes.container)}
        onClick={deselect}
      >
        <Legend entries={mapValues(colorMap, (color) => ({ color }))} />

        {/* chart */}
        <svg
          ref={svgRef}
          className={classes.chart}
          style={{
            /** size based on tree depth */
            height: 2 * rootFontSize() * tree.leaves().length,
          }}
        >
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
                strokeWidth={isSelected ? strokeWidth * 2 : strokeWidth}
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
                      Click to select
                    </>
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
                    opacity={isSelected === false ? 0.25 : 1}
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
        </svg>

        {/* selected */}
        {selectedPath.length > 1 && (
          <div className={clsx("mini-table", classes.selected)}>
            <span>From</span>
            <span>{selectedA?.data.label}</span>
            <span>To</span>
            <span>{selectedB?.data.label}</span>
            <span>Dist.</span>
            <span>{sum(map(selectedPath, "data.dist") ?? 0).toFixed(2)}</span>
            <span>Nodes</span>
            <span>{selectedPath.length}</span>
          </div>
        )}
      </div>

      {/* controls */}
      <Flex>
        <Popover
          content={
            <Flex direction="column" hAlign="stretch" gap="xs">
              <Button
                icon={<FaRegImage />}
                text="PNG"
                onClick={() =>
                  containerRef.current &&
                  downloadPng(containerRef.current, "tree")
                }
                tooltip="High-resolution image"
              />
              <Button
                icon={<FaRegImage />}
                text="JPEG"
                onClick={() =>
                  containerRef.current &&
                  downloadJpg(containerRef.current, "tree")
                }
                tooltip="Compressed image"
              />
              <Button
                icon={<FaBezierCurve />}
                text="SVG"
                onClick={() =>
                  svgRef.current && downloadSvg(svgRef.current, "tree")
                }
                tooltip="Vector image (no legends)"
              />
              <Button
                icon={<FaFilePdf />}
                text="PDF"
                onClick={() =>
                  containerRef.current && printElement(containerRef.current)
                }
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
