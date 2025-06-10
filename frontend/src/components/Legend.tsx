import { mapKeys, max, startCase } from "lodash";
import Tooltip from "@/components/Tooltip";
import { getTextWidth, rootFontSize } from "@/util/dom";
import { useTheme, useTruncateWidth } from "@/util/hooks";
import classes from "./Legend.module.css";

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
  color?: string;
  shape?: number[];
  stroke?: boolean;
};

/** general purpose legend with colored symbols and labels */
const Legend = ({
  entries,
  x: rootX = 0,
  y: rootY = 0,
  w: rootW = maxEntryWidth,
  anchor = [0, 0],
}: Props) => {
  /** prettify label */
  entries = mapKeys(entries, (v, label) => startCase(label) || "-");

  /** longest label width */
  const widestLabel =
    max(Object.keys(entries).map((label) => getTextWidth(label))) ?? 0;

  /** label offset */
  const labelX = rowHeight + gapSize;

  /** max entry width */
  const widestEntry = widestLabel + labelX;

  /** col width limit */
  const maxColWidth = Math.min(widestEntry, maxEntryWidth);

  /** fit as many columns in available width as possible */
  let cols = Math.floor((rootW + gapSize) / (gapSize + maxColWidth));
  if (cols < 1) cols = 1;
  /** number of rows */
  const rows = Math.ceil(Object.keys(entries).length / cols);

  /** actual column width */
  const colWidth = Math.min(
    (gapSize - cols * gapSize + rootW) / cols,
    maxColWidth,
  );

  /** resulting root width */
  rootW = cols * colWidth + (cols - 1) * gapSize;

  /** resulting root height */
  const rootH = rows * rowHeight + (rows - 1) * gapSize;

  /** if resulting width less than available, shift appropriately to fill space */
  if (colWidth < rootW) rootX += anchor[0] * (rootW - colWidth);

  /** shift by anchor point */
  rootX -= anchor[0] * rootW;
  rootY -= anchor[1] * rootH;

  const truncateWidth = useTruncateWidth();

  const theme = useTheme();

  return (
    <>
      <svg
        x={rootX}
        y={rootY}
        width={rootW}
        height={rootH}
        viewBox={[0, 0, rootW, rootH].join(" ")}
        className={classes.legend}
        style={{ fontSize: rootFontSize }}
      >
        {Object.entries(entries).map(
          ([label, { color, shape, stroke }], index) => {
            /** wrap single line to grid of rows/cols */
            const row = Math.floor(index / cols);
            const col = index % cols;
            const x = col * (colWidth + gapSize);
            const y = row * (rowHeight + gapSize);

            /** scale shape points */
            shape = shape?.map((p) => rowHeight / 2 + p * (rowHeight / 2));

            return (
              <g key={index} transform={`translate(${x}, ${y})`}>
                <g
                  fill={color}
                  stroke={theme["--black"]}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {shape ? (
                    stroke ? (
                      <>
                        <polyline
                          strokeWidth={5 * strokeWidth}
                          points={shape.join(" ")}
                        />
                        <polyline
                          stroke={color}
                          strokeWidth={3 * strokeWidth}
                          points={shape.join(" ")}
                        />
                      </>
                    ) : (
                      <polygon points={shape.join(" ")} />
                    )
                  ) : (
                    <circle
                      cx={rowHeight / 2}
                      cy={rowHeight / 2}
                      r={rowHeight / 2}
                    />
                  )}
                </g>
                <Tooltip content={label}>
                  <text
                    x={labelX}
                    y={rowHeight / 2}
                    fill={theme["--black"]}
                    dominantBaseline="central"
                    tabIndex={0}
                  >
                    {truncateWidth(label, colWidth - labelX)}
                  </text>
                </Tooltip>
              </g>
            );
          },
        )}
      </svg>
    </>
  );
};

export default Legend;
