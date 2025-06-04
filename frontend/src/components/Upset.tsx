import { Fragment, useContext } from "react";
import {
  axisLeft,
  axisTop,
  max,
  pairs,
  scaleBand,
  scaleLinear,
  select,
  transpose,
} from "d3";
import { clamp, map, orderBy } from "lodash";
import Chart, { ChartContext } from "@/components/Chart";
import Tooltip from "@/components/Tooltip";
import { getTextWidth, truncateWidth } from "@/util/dom";
import type { Filename } from "@/util/download";
import { useTheme } from "@/util/hooks";
import classes from "./Upset.module.css";

type Props = {
  /** chart title text */
  title?: string;
  /** download filename */
  filename?: Filename;

  /** x-axis */
  x: {
    /** column data */
    data: {
      value: number;
    }[];
  };
  /** y-axis */
  y: {
    /** row data */
    data: {
      label?: string;
      value: number;
    }[];
  };
  /** cell values */
  data: (boolean | undefined)[][];
};

/** size of cells in main plot area */
const cellSize = 30;
/** circle size */
const nodeSize = 6;
/** line thickness */
const strokeWidth = 2;
/** length of bar charts on side */
const barLength = 100;
/** target number of bar chart ticks */
const ticks = 3;
/** max label width */
const minLabelWidth = 100;
const maxLabelWidth = 3000;

/** upset plot */
const Upset = ({ title, filename = [], x, y, data }: Props) => {
  /** reactive CSS vars */
  const theme = useTheme();

  /** num of rows/cols */
  const cols = x.data.length;
  const rows = y.data.length;

  /** col #s, ordered by value */
  const xOrder = sortedIndices(map(x.data, "value"));
  /** row #s, ordered by value */
  const yOrder = sortedIndices(map(y.data, "value"));

  /** sort cols */
  x.data = xOrder.map((index) => x.data[index] ?? { value: 0 });
  data = data.map((row) => xOrder.map((index) => row[index] ?? false));
  /** sort rows */
  y.data = yOrder.map((index) => y.data[index] ?? { value: 0 });
  data = yOrder.map((index) => data[index] ?? []);

  /** col # to x coord */
  const xScale = scaleBand(xOrder, [0, cols * cellSize]).padding(0.5);
  /** row # to y coord */
  const yScale = scaleBand(yOrder, [0, rows * cellSize]).padding(0.5);

  /** links to draw between marked cells */
  const links = transpose(data)
    .map((col, colIndex) =>
      pairs(
        col
          .map((row, rowIndex) =>
            row ? ([colIndex, rowIndex] as const) : null,
          )
          .filter((cell) => cell !== null),
      ),
    )
    .flat();

  /** col bar scale */
  const xBarScale = scaleLinear()
    .domain([0, max(map(x.data, "value")) ?? 0])
    .range([0, -barLength])
    .nice(ticks);

  /** row bar scale */
  const yBarScale = scaleLinear()
    .domain([0, max(map(y.data, "value")) ?? 0])
    .range([0, -barLength])
    .nice(ticks);

  /** x bar chart ticks */
  const xTicks = xBarScale.nice(ticks).ticks(ticks);
  /** y bar chart ticks */
  const yTicks = yBarScale.nice(ticks).ticks(ticks);

  /** remove (overlapping) 0 ticks */
  xTicks.shift();
  yTicks.shift();

  /** x axis */
  const xAxis = axisLeft(xBarScale)
    .tickValues(xTicks)
    .tickSize(strokeWidth * 2)
    .tickPadding(strokeWidth * 1);
  /** y axis */
  const yAxis = axisTop(yBarScale)
    .tickValues(yTicks)
    .tickSize(strokeWidth * 2)
    .tickPadding(strokeWidth * 1);

  const Content = () => {
    const { width, fontSize } = useContext(ChartContext);

    /** calc label positioning */
    const right = xScale.range()[1];
    const longestLabel =
      max(y.data.map(({ label = "" }) => getTextWidth(label, fontSize))) ?? 0;
    let labelLength = clamp(width - right - barLength, 0, longestLabel);
    labelLength = clamp(labelLength, minLabelWidth, maxLabelWidth);
    const left = -labelLength - barLength;

    return (
      <>
        {/* title */}
        {title && (
          <text
            x={(right + left) / 2}
            y={-barLength - 2 * fontSize}
            textAnchor="middle"
            style={{ fontWeight: "bold" }}
          >
            {truncateWidth(title, fontSize, right - left)}
          </text>
        )}

        {/* main chart area */}
        <g>
          {/* cells */}
          <g>
            {data.map((row, rowIndex) =>
              row.map((col, colIndex) => (
                <circle
                  key={[colIndex, rowIndex].join("-")}
                  className={classes.cell}
                  cx={(xScale(colIndex) ?? 0) + xScale.bandwidth() / 2}
                  cy={(yScale(rowIndex) ?? 0) + yScale.bandwidth() / 2}
                  r={nodeSize}
                  fill={col ? theme["--accent"] : theme["--light-gray"]}
                  tabIndex={col ? 0 : undefined}
                  role={col ? "button" : undefined}
                />
              )),
            )}
          </g>

          {/* lines */}
          <g>
            {links.map(([[col1, row1], [col2, row2]], index) => (
              <line
                key={index}
                stroke={theme["--accent"]}
                strokeWidth={strokeWidth}
                x1={(xScale(col1) ?? 0) + xScale.bandwidth() / 2}
                y1={(yScale(row1) ?? 0) + yScale.bandwidth() / 2}
                x2={(xScale(col2) ?? 0) + xScale.bandwidth() / 2}
                y2={(yScale(row2) ?? 0) + yScale.bandwidth() / 2}
              />
            ))}
          </g>
        </g>

        {/* x bar chart */}
        <g>
          {/* axis */}
          <g
            ref={(el) => {
              if (el) {
                /** render axis */
                xAxis(select(el));
                /** remove interfering d3 axis styles */
                el.removeAttribute("font-size");
                el.removeAttribute("font-family");
              }
            }}
            strokeWidth={strokeWidth}
          />

          {/* bars */}
          <g>
            {x.data.map((col, colIndex) => (
              <Tooltip key={colIndex} content={col.value}>
                <rect
                  x={xScale(colIndex)}
                  y={xBarScale(col.value)}
                  width={xScale.bandwidth() ?? 0}
                  height={-xBarScale(col.value)}
                  fill={theme["--accent"]}
                  tabIndex={0}
                  role="button"
                />
              </Tooltip>
            ))}
          </g>
        </g>

        {/* y bar chart */}
        <g>
          {/* axis */}
          <g
            ref={(el) => {
              if (el) {
                /** render axis */
                yAxis(select(el));
                /** remove interfering d3 axis styles */
                el.removeAttribute("font-size");
                el.removeAttribute("font-family");
              }
            }}
            strokeWidth={strokeWidth}
          />

          {/* bars */}
          <g>
            {y.data.map((row, rowIndex) => (
              <Fragment key={rowIndex}>
                <Tooltip content={row.value}>
                  <rect
                    x={yBarScale(row.value)}
                    y={yScale(rowIndex)}
                    width={-yBarScale(row.value)}
                    height={yScale.bandwidth() ?? 0}
                    fill={theme["--accent"]}
                    tabIndex={0}
                    role="button"
                  />
                </Tooltip>
              </Fragment>
            ))}
          </g>

          {/* labels */}
          <g>
            {y.data.map((row, rowIndex) => (
              <Tooltip key={rowIndex} content={row.label}>
                <text
                  x={left}
                  y={(yScale(rowIndex) ?? 0) + yScale.bandwidth() / 2}
                  fill={theme["--black"]}
                  dominantBaseline="central"
                  tabIndex={0}
                >
                  {truncateWidth(row.label ?? "-", fontSize, labelLength)}
                </text>
              </Tooltip>
            ))}
          </g>
        </g>
      </>
    );
  };

  return (
    <Chart filename={[...filename, "upset"]}>
      <Content />
    </Chart>
  );
};

export default Upset;

/** sort array and return indices */
const sortedIndices = <Type,>(array: Type[]) =>
  map(
    orderBy(
      array.map((value, index) => ({ value, index })),
      "value",
      "desc",
    ),
    "index",
  );
