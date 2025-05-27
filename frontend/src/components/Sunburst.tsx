import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import {
  FaBezierCurve,
  FaDownload,
  FaFilePdf,
  FaRegImage,
} from "react-icons/fa6";
import clsx from "clsx";
import { arc, hierarchy, type HierarchyNode } from "d3";
import { inRange, mapValues, sumBy, truncate } from "lodash";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Legend from "@/components/Legend";
import Popover from "@/components/Popover";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import { fitViewBox, printElement } from "@/util/dom";
import { downloadJpg, downloadPng, downloadSvg } from "@/util/download";
import { rootFontSize, useSvgTransform, useTheme } from "@/util/hooks";
import { formatNumber } from "@/util/string";
import classes from "./Sunburst.module.css";

export type Item = {
  /** human-readable label */
  label?: string;
  /** arbitrary type/category */
  type?: string;
  /** arbitrary value, normalized to determine segment % */
  value: number;
  /** children items */
  children?: Item[];
};

type Derived = {
  label: string;
  type: string;
  value: number;
  children: Derived[];
  /** color mapped from type */
  color: string;
  /** percent of full circle that item takes up, from 0 to 1 */
  percent: number;
  /** start angle of item, from 0 to 1 percent */
  angle: number;
  /** is item part of selected breadcrumbs */
  selected: boolean | null;
  /** is item last of selected breadcrumbs */
  lastSelected: boolean | null;
  /** temporary value to track children's angles */
  childAngle: number;
};

type Node = HierarchyNode<Derived>;

type Props = {
  /** chart data */
  data: Item[];
};

/** thickness of rings, in svg units */
const ringSize = 20;
/** gap between rings, in svg units */
const gapSize = 1;
/** depth/level of first ring from center */
const startDepth = 1;

const Sunburst = ({ data }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  /** font size, in svg units */
  const fontSize = useSvgTransform(svgRef.current, 1, rootFontSize()).h;

  /** fit view box */
  useEffect(() => {
    fitViewBox(svgRef.current, 0.01);
  });

  /** "breadcrumb trail" of selected nodes */
  const [selected, setSelected] = useState<Node[]>([]);

  /** are any nodes selected */
  const anySelected = !!selected.length;

  /** hierarchical data structure with convenient access methods */
  const tree = useMemo(() => {
    const tree = hierarchy<Derived>({ children: data } as Derived);

    /** set fallbacks */
    for (const { data } of tree) {
      data.label ??= "";
      data.type ??= "";
      data.value ??= 0;
      data.color ??= "";
      data.percent ??= 1;
      data.angle ??= 0;
      data.childAngle ??= 0;
    }

    /** go down tree recursively */
    tree.eachBefore(({ data, parent }) => {
      if (!parent) return;
      /** get total of siblings' values */
      const total = sumBy(parent?.children, (d) => d.data.value);
      /** get this node's value as percent of total */
      const percent = data.value / total || 0;
      /** get percent of relative to parent, i.e. percent of full circle */
      data.percent = parent.data.percent * percent;
      /** set angle from parent's current child angle */
      data.angle = parent.data.childAngle;
      data.childAngle = parent.data.childAngle;
      /** increment parent's child angle */
      parent.data.childAngle += data.percent;
    });

    return tree;
  }, [data]);

  /** get all nodes' types */
  const types = useMemo(() => {
    const types: string[] = [];
    tree.each((node) => types.push(node.data.type));
    return types;
  }, [tree]);

  /** map of node type to color */
  const colorMap = useColorMap(types, "mode");

  /** convert node tree to list and derive some more props */
  const nodes = useMemo(
    () =>
      [...tree].map((node) => {
        /** assign color from type */
        node.data.color = colorMap[node.data.type]!;

        /** selected state */
        node.data.selected = anySelected ? selected.includes(node) : null;
        node.data.lastSelected = anySelected ? selected.at(-1) === node : null;

        return node;
      }),
    [tree, colorMap, selected, anySelected],
  );

  /** clear selection */
  const deselect = () => setSelected([]);

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

        {/* chart container */}
        <svg
          ref={svgRef}
          className={classes.chart}
          style={{
            fontSize,
            /** size based on number of rings */
            height: 2 * 2 * rootFontSize() * (tree.height + startDepth),
          }}
        >
          {nodes.map((node, index) => (
            <Fragment key={index}>
              {node.parent && (
                <Segment
                  fontSize={fontSize}
                  select={() =>
                    node.data.lastSelected
                      ? deselect()
                      : setSelected(node.ancestors().slice(0, -1).reverse())
                  }
                  deselect={deselect}
                  node={node}
                />
              )}
            </Fragment>
          ))}
        </svg>

        {/* selected breadcrumbs */}
        {anySelected && (
          <Flex
            className={classes.breadcrumbs}
            gap="sm"
            gapRatio={1}
            direction="column"
            hAlign="right"
            vAlign="top"
          >
            {selected.map((node, index) => (
              <NodeTooltip key={index} {...node.data}>
                <div
                  className={classes.breadcrumb}
                  style={{ background: node.data.color }}
                  tabIndex={0}
                  role="button"
                >
                  {node.data.label || "-"}
                </div>
              </NodeTooltip>
            ))}
          </Flex>
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
                  downloadPng(containerRef.current, "sunburst")
                }
                tooltip="High-resolution image"
              />
              <Button
                icon={<FaRegImage />}
                text="JPEG"
                onClick={() =>
                  containerRef.current &&
                  downloadJpg(containerRef.current, "sunburst")
                }
                tooltip="Compressed image"
              />
              <Button
                icon={<FaBezierCurve />}
                text="SVG"
                onClick={() =>
                  svgRef.current && downloadSvg(svgRef.current, "sunburst")
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

export default Sunburst;

type SegmentProps = {
  fontSize: number;
  node: Node;
  select: () => void;
  deselect: () => void;
};

/** single arc segment */
const Segment = ({ fontSize, node, select, deselect }: SegmentProps) => {
  /** unique segment id */
  const id = useId();

  /** extract props */
  const { depth, data } = node;
  const { label, color, percent, angle, selected, lastSelected } = data;
  const end = angle + percent;

  /** reactive CSS vars */
  const theme = useTheme();

  /** segment arc radius */
  const radius = (depth + startDepth - 0.5) * ringSize;

  /** get enclosed shape to fill */
  const fill = useMemo(
    () =>
      arc<null>()
        .innerRadius(radius - ringSize / 2 + gapSize / 2)
        .outerRadius(radius + ringSize / 2 - gapSize / 2)
        .startAngle(angle * 2 * Math.PI)
        .endAngle(end * 2 * Math.PI)
        .padRadius(gapSize)
        .padAngle(1)(null) ?? "",
    [radius, angle, end],
  );

  /** get stroke path */
  const stroke = useMemo(() => {
    /** if angle midpoint in lower half of circle, flip text so not upside down */
    const flip = inRange((angle + end) / 2, 0.25, 0.75);

    let stroke =
      arc<null>()
        /** center line of segment */
        .innerRadius(radius)
        /**
         * centerline, minus some thickness to ensure there is L command. d3
         * does A command(s) for larger radius first, and we will only keep
         * that, so thickness can be arbitrary.
         */
        .outerRadius(radius - 999)
        .startAngle((flip ? end : angle) * 2 * Math.PI)
        .endAngle((flip ? angle : end) * 2 * Math.PI)
        .padRadius(gapSize)
        .padAngle(1)(null) ?? "";

    /** extract just first half of path, center-line of segment */
    stroke = stroke.slice(0, stroke.indexOf("L"));

    return stroke;
  }, [radius, angle, end]);

  /** get max text chars based on arc length */
  const maxChars = (radius * 2 * Math.PI * percent) / (fontSize / 1.75);

  return (
    <g className={classes.segment} opacity={selected === false ? 0.25 : 1}>
      {/* shape */}
      <NodeTooltip {...data}>
        <path
          className={classes.shape}
          fill={color}
          stroke={theme["--black"]}
          strokeWidth={gapSize}
          strokeOpacity={lastSelected === true ? 1 : 0}
          d={fill}
          tabIndex={0}
          role="button"
          onClick={(event) => {
            /** prevent deselect from container onClick */
            event.stopPropagation();
            select();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              select();
            }
            if (event.key === "Escape") deselect();
          }}
        />
      </NodeTooltip>

      {/* text path */}
      <path id={id} fill="none" d={stroke} />
      {/* text */}
      <text
        className={classes.label}
        textAnchor="middle"
        dy="0.55ex"
        fill={theme["--black"]}
      >
        <textPath href={`#${id}`} startOffset="50%">
          {truncate(label || "-", { length: maxChars })}
        </textPath>
      </text>
    </g>
  );
};

/** tooltip for data node */
const NodeTooltip = ({
  label,
  value,
  percent,
  type,
  children,
}: Omit<Derived, "children"> & { children: ReactElement }) => (
  <Tooltip
    content={
      <div className="mini-table">
        <div>Name</div>
        <div>{label || "-"}</div>
        <div>Value</div>
        <div>{formatNumber(value)}</div>
        <div>Percent</div>
        <div>{formatPercent(percent)}</div>
        <div>Type</div>
        <div>{type || "-"}</div>
      </div>
    }
  >
    {children}
  </Tooltip>
);

/** format 0-1 as % */
const formatPercent = (percent = 0) => `${(percent * 100).toFixed(0)}%`;
