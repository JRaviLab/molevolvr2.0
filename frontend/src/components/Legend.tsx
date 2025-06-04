import { max, startCase } from "lodash";
import Tooltip from "@/components/Tooltip";
import { getTextWidth, rootFontSize, truncateWidth } from "@/util/dom";

type Entry = {
  color?: string;
  shape?: number[];
  stroke?: boolean;
};

type Props = {
  /** key entries */
  entries: Record<string, Entry>;
  /** x position */
  x: number;
  /** y position */
  y: number;
  /** available width */
  w: number;
};

/** entry symbol size */
const symbolSize = 20;
/** gap between entries */
const gapSize = 10;
/** entry size limits */
const maxEntryWidth = 100;

/** general purpose legend with colored symbols and labels */
const Legend = ({ entries, x: rootX, y: rootY, w: rootW }: Props) => {
  /** length of longest entry */
  const longestEntry =
    (max(Object.keys(entries).map((label) => getTextWidth(label))) ?? 0) +
    symbolSize +
    gapSize;

  /** column width limit */
  const maxColW = Math.min(longestEntry, maxEntryWidth);

  /** fit as many columns in available width as possible */
  const cols = Math.floor((rootW + gapSize) / (gapSize + maxColW));

  /** actual column width */
  const w = (gapSize - cols * gapSize + rootW) / cols;

  /** resulting actual root width */
  rootW = cols * w + (cols - 1) * gapSize;

  /** if content is smaller than available width */
  if (longestEntry < w)
    /** shift over to fill empty space */
    rootX += w - longestEntry;

  return Object.entries(entries).map(
    ([label, { color, shape, stroke }], index) => {
      /** wrap single line to grid of rows/cols */
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = rootX + symbolSize / 2 + col * (w + gapSize);
      const y = rootY + symbolSize / 2 + row * (symbolSize + gapSize);

      /** scale shape points */
      shape = shape?.map((p) => p * symbolSize);

      /** prettify label */
      label = startCase(label) || "-";

      return (
        <g key={index} transform={`translate(${x}, ${y})`}>
          {shape ? (
            stroke ? (
              <>
                <polyline
                  stroke={color}
                  strokeWidth={0.4}
                  strokeLinecap="round"
                  points={shape.join(" ")}
                />
              </>
            ) : (
              <polygon fill={color} points={shape.join(" ")} />
            )
          ) : (
            <circle fill={color} r={symbolSize / 2} />
          )}
          <Tooltip content={label}>
            <text
              x={symbolSize}
              style={{ fontSize: rootFontSize }}
              dominantBaseline="central"
              tabIndex={0}
            >
              {truncateWidth(label, w)}
            </text>
          </Tooltip>
        </g>
      );
    },
  );
};

export default Legend;
