import { Fragment, useId, useMemo, useState, type ReactElement } from "react";
import { arc, hierarchy, type HierarchyNode } from "d3";
import { inRange, mapValues, sumBy } from "lodash";
import Chart from "@/components/Chart";
import Legend from "@/components/Legend";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import { rootFontSize, truncateWidth } from "@/util/dom";
import type { Filename } from "@/util/download";
import { useTheme, useTruncateWidth } from "@/util/hooks";
import { tau } from "@/util/math";
import { formatNumber } from "@/util/string";
import classes from "./Sunburst.module.css";

/** thickness of rings */
const ringSize = 30;
/** gap between rings */
const gapSize = 3;
/** depth/level of first ring from center */
const startDepth = 1;
/** width of side panels */
const panelWidth = 150;

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

/** sunburst plot */
const Sunburst = ({ title, filename = [], data }: Props) => {
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

  /** max ring radius */
  const maxR = (startDepth + tree.height) * ringSize;

  const truncateWidth = useTruncateWidth();

  return (
    <Chart
      title={title}
      filename={[...filename, "sunburst"]}
      onClick={deselect}
    >
      <Legend
        entries={mapValues(colorMap, (color) => ({ color }))}
        x={-maxR - ringSize}
        y={0}
        w={panelWidth}
        anchor={[1, 0.5]}
      />

      <g>
        {nodes.map((node, index) => (
          <Fragment key={index}>
            {node.parent && (
              <Segment
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
      </g>

      {/* selected breadcrumbs */}
      <g>
        {selected.map((node, index) => {
          const h = 1.5 * rootFontSize;
          const x = maxR + ringSize;
          const y = maxR - (index + 1) * (h + gapSize);

          return (
            <Fragment key={index}>
              <rect
                fill={node.data.color}
                x={x}
                y={y - h / 2}
                width={panelWidth}
                height={h}
              />
              <NodeTooltip {...node.data}>
                <text
                  x={x + gapSize}
                  y={y}
                  dominantBaseline="central"
                  tabIndex={0}
                  role="button"
                >
                  {truncateWidth(
                    node.data.label || "-",
                    panelWidth - 2 * gapSize,
                  )}
                </text>
              </NodeTooltip>
            </Fragment>
          );
        })}
      </g>
    </Chart>
  );
};

export default Sunburst;

type SegmentProps = {
  node: Node;
  select: () => void;
  deselect: () => void;
};

/** single arc segment */
const Segment = ({ node, select, deselect }: SegmentProps) => {
  /** unique segment id */
  const id = useId();

  /** extract props */
  const { depth, data } = node;
  const { label, color, percent, angle, selected } = data;
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
        .startAngle(angle * tau)
        .endAngle(end * tau)
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
        .startAngle((flip ? end : angle) * tau)
        .endAngle((flip ? angle : end) * tau)
        .padRadius(3 * gapSize)
        .padAngle(1)(null) ?? "";

    /** extract just first half of path, center-line of segment */
    stroke = stroke.slice(0, stroke.indexOf("L"));

    return stroke;
  }, [radius, angle, end]);

  /** length of arc centerline */
  const arcLength = radius * Math.abs(end - angle) * tau - 2 * gapSize;

  return (
    <g className={classes.segment} opacity={selected === false ? 0.25 : 1}>
      {/* shape */}
      <NodeTooltip {...data}>
        <path
          className={classes.shape}
          fill={color}
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
          {truncateWidth(label || "-", arcLength)}
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
        <div>{label}</div>
        <div>Value</div>
        <div>{formatNumber(value)}</div>
        <div>Percent</div>
        <div>{formatPercent(percent)}</div>
        <div>Type</div>
        <div>{type}</div>
      </div>
    }
  >
    {children}
  </Tooltip>
);

/** format 0-1 as % */
const formatPercent = (percent = 0) => `${(100 * percent).toFixed(0)}%`;
