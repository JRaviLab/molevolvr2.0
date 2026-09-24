import type { Point } from "@/util/shape";
import { clamp, mapKeys, max, startCase } from "lodash";
import Tooltip from "@/components/Tooltip";
import { useTextSize, useTheme } from "@/util/hooks";
import { shapeToString } from "@/util/shape";

/** entry symbol size */
const rowHeight = 20;
/** gap between entries */
const gapSize = 10;
/** entry size limit */
const maxEntryWidth = 150;
/** line thickness */
const strokeWidth = 1;

type Props = {
  /** key entries */
  entries: Record<string, Entry>;
  /** origin x position */
  x?: number;
  /** origin y position */
  y?: number;
  /** available width */
  w?: number;
  /** % of width/height to align origin with, e.g. [0.5, 0.5] to center align */
  anchor?: [number, number];
};

type Entry = {
  /** fill color */
  color?: string;
  /** shape points, from [-1, -1] to [1, 1] */
  shape?: Point[];
  /** whether to stroke shape outline instead of fill */
  stroke?: boolean;
};

/** general purpose legend with colored symbols and labels */
export default function Legend({
  entries,
  x: rootX = 0,
  y: rootY = 0,
  w: rootW = maxEntryWidth,
  anchor = [0, 0],
}: Props) {
  const theme = useTheme();

  const { fontSize, getWidth, truncateWidth } = useTextSize();

  /** limit width */
  rootW = clamp(rootW, 10, 10000);

  /** prettify label */
  entries = mapKeys(entries, (v, label) => startCase(label) || "-");

  /** longest label width */
  const widestLabel =
    max(Object.keys(entries).map((label) => getWidth(label))) ?? 0;

  /** label offset */
  const labelX = rowHeight + gapSize;

  /** max entry width */
  const widestEntry = widestLabel + labelX;

  /** column width limit */
  const maxColumnWidth = Math.min(widestEntry, maxEntryWidth);

  /** fit as many columns in available width as possible */
  let columns = Math.floor((rootW + gapSize) / (gapSize + maxColumnWidth));
  if (columns < 1) columns = 1;
  /** number of rows */
  const rows = Math.ceil(Object.keys(entries).length / columns);

  /** actual column width */
  const columnWidth = Math.min(
    (gapSize - columns * gapSize + rootW) / columns,
    maxColumnWidth,
  );

  /** resulting root width */
  rootW = columns * columnWidth + (columns - 1) * gapSize;

  /** resulting root height */
  const rootH = rows * rowHeight + (rows - 1) * gapSize;

  /** if resulting width less than available, shift appropriately to fill space */
  // if (columnWidth < rootW) rootX += anchor[0] * (rootW - columnWidth);

  /** shift by anchor point */
  rootX -= anchor[0] * rootW;
  rootY -= anchor[1] * rootH;

  return (
    <svg
      x={rootX}
      y={rootY}
      width={rootW}
      height={rootH}
      viewBox={[0, 0, rootW, rootH].join(" ")}
      className="overflow-visible"
      style={{ fontSize }}
      dominantBaseline="central"
    >
      {Object.entries(entries).map(
        ([label, { color, shape, stroke }], index) => (
          <Cell
            key={index}
            index={index}
            label={label}
            labelX={labelX}
            columns={columns}
            columnWidth={columnWidth}
            color={color}
            shape={shape}
            stroke={stroke}
            theme={theme}
            truncateWidth={truncateWidth}
          />
        ),
      )}
    </svg>
  );
}

type CellProps = {
  index: number;
  label: string;
  labelX: number;
  columns: number;
  columnWidth: number;
  theme: ReturnType<typeof useTheme>;
  truncateWidth: ReturnType<typeof useTextSize>["truncateWidth"];
} & Entry;

/** split into sub-components for slight performance optimization */

function Cell({
  index,
  label,
  labelX,
  columns,
  columnWidth,
  color,
  shape,
  stroke,
  theme,
  truncateWidth,
}: CellProps) {
  /** wrap to grid of rows/columns */
  const row = Math.floor(index / columns);
  const column = index % columns;
  const x = column * (columnWidth + gapSize);
  const y = row * (rowHeight + gapSize);

  /** scale shape points */
  shape = shape?.map(({ x, y }) => ({
    x: rowHeight / 2 + x * (rowHeight / 2),
    y: rowHeight / 2 + y * (rowHeight / 2),
  }));

  return (
    <g key={index} transform={`translate(${x}, ${y})`}>
      <g
        fill={color}
        stroke={theme["--color-black"]}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {shape ? (
          stroke ? (
            <>
              <polygon
                fill="none"
                strokeWidth={5 * strokeWidth}
                points={shapeToString(shape)}
              />
              <polygon
                fill="none"
                stroke={color}
                strokeWidth={3 * strokeWidth}
                points={shapeToString(shape)}
              />
            </>
          ) : (
            <polygon points={shapeToString(shape)} />
          )
        ) : (
          <circle cx={rowHeight / 2} cy={rowHeight / 2} r={rowHeight / 2} />
        )}
      </g>
      <Tooltip content={label}>
        <text
          x={labelX}
          y={rowHeight / 2}
          fill={theme["--color-black"]}
          tabIndex={0}
        >
          {truncateWidth(label, columnWidth - labelX)}
        </text>
      </Tooltip>
    </g>
  );
}
