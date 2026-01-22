import { useState } from "react";
import { extent, scaleBand, scaleLinear, transpose } from "d3";
import { range } from "lodash";
import Chart from "@/components/Chart";
import CheckBox from "@/components/CheckBox";
import { Gradient, gradientFunc, gradientOptions } from "@/components/Gradient";
import SelectSingle from "@/components/SelectSingle";
import Tooltip from "@/components/Tooltip";
import type { Filename } from "@/util/download";
import { useTextSize, useTheme } from "@/util/hooks";

/** width/height of cells */
const cellSize = 30;

type Props = {
  /** title text */
  title?: string;
  /** download filename */
  filename?: Filename;
  /** x-axis */
  x: {
    /** axis label */
    label?: string;
    /** column labels */
    labels: (string | undefined)[];
  };
  /** y-axis */
  y: {
    /** axis label */
    label?: string;
    /** row labels */
    labels: (string | undefined)[];
  };
  /** cell values */
  data: (number | undefined)[][];
  /** legend label */
  legend?: string;
  /** manual min value */
  min?: number;
  /** manual max value */
  max?: number;
};

/** heatmap plot */
const Heatmap = ({
  title,
  filename = [],
  x,
  y,
  data,
  legend,
  min,
  max,
}: Props) => {
  /** selected gradient */
  const [gradient, setGradient] = useState(gradientOptions(false)[0]!.id);

  /** reverse gradient */
  const [reverse, setReverse] = useState(false);

  /** swap rows/cols */
  const [swap, setSwap] = useState(false);

  if (swap) {
    [x, y] = [y, x];
    data = transpose(data);
  }

  /** reactive CSS vars */
  const theme = useTheme();

  const { truncateWidth } = useTextSize();

  const legendHeight = Math.min(
    cellSize * Math.max(0, data.length - 2),
    5 * cellSize,
  );

  /** num of rows/cols */
  const cols = x.labels.length;
  const rows = y.labels.length;

  /** col # to x coord */
  const xScale = scaleBand(range(0, cols), [0, cols * cellSize]).padding(0);
  /** row # to y coord */
  const yScale = scaleBand(range(0, rows), [0, rows * cellSize]).padding(0);

  /** value range */
  {
    const range = extent(data.flat().map((value) => value ?? 0));
    min ??= range[0] ?? 0;
    max ??= range[1] ?? 1;
  }

  /** value to % */
  const valueScale = scaleLinear([min, max], [0, 1]);
  /** % to color */
  const colorScale = (value: number) => gradientFunc(gradient, reverse, value);

  /** main chart area */
  const width = (xScale(cols - 1) ?? 0) + xScale.bandwidth();
  const height = (yScale(rows - 1) ?? 0) + yScale.bandwidth();

  /** legend info */
  const legendScale = valueScale.ticks(4).map((tick, index, array) => ({
    label: index === 0 ? min : index === array.length - 1 ? max : tick,
    percent: index / (array.length - 1),
    color: colorScale(valueScale(tick)),
  }));

  return (
    <Chart
      title={title}
      filename={[...filename, "heatmap"]}
      controls={[
        <>
          <SelectSingle
            label="Gradient"
            options={gradientOptions(reverse)}
            layout="horizontal"
            value={gradient}
            onChange={setGradient}
          />

          <CheckBox
            label="Reverse"
            tooltip="Reverse gradient direction"
            value={reverse}
            onChange={setReverse}
          />

          <CheckBox
            label="Swap"
            tooltip="Swap rows & cols (transpose)"
            value={swap}
            onChange={setSwap}
          />
        </>,
      ]}
    >
      {/* cells */}
      <g className="group">
        {data.map((row, rowIndex) =>
          row.map((col, colIndex) => (
            <Tooltip
              key={[colIndex, rowIndex].join("-")}
              content={
                <dl>
                  <dt>Value</dt>
                  <dd>{col}</dd>
                  <dt>{x.label}</dt>
                  <dd>{x.labels[colIndex]}</dd>
                  <dt>{y.label}</dt>
                  <dd>{y.labels[colIndex]}</dd>
                </dl>
              }
            >
              <rect
                className="
                  stroke-transparent stroke-5 outline-none
                  hover:stroke-black
                  focus-visible:stroke-black
                  [.group:has(&:focus)_&:not(:focus)]:opacity-25
                "
                x={xScale(colIndex) ?? 0}
                y={yScale(rowIndex) ?? 0}
                width={xScale.bandwidth() ?? 0}
                height={yScale.bandwidth() ?? 0}
                fill={
                  col
                    ? colorScale(valueScale(col))
                    : theme["--color-light-gray"]
                }
                tabIndex={0}
                role="graphics-symbol"
              />
            </Tooltip>
          )),
        )}
      </g>

      {/* x axis tick labels */}
      <g fill={theme["--color-black"]}>
        {x.labels.map((label, index) => (
          <Tooltip content={label} key={index}>
            <text
              transform={[
                `translate(0, ${-0.5 * cellSize})`,
                `translate(${(xScale(index) ?? 0) + 0.5 * xScale.bandwidth()}, 0)`,
                `rotate(-45)`,
              ].join("")}
              tabIndex={0}
            >
              {truncateWidth(label ?? "-", 4 * cellSize)}
            </text>
          </Tooltip>
        ))}
      </g>

      {/* y axis tick labels */}
      <g fill={theme["--color-black"]} textAnchor="end">
        {y.labels.map((label, index) => (
          <Tooltip content={label} key={index}>
            <text
              transform={[
                `translate(${-0.5 * cellSize}, 0)`,
                `translate(0, ${(yScale(index) ?? 0) + 0.5 * yScale.bandwidth()})`,
                `rotate(-45)`,
              ].join(" ")}
              tabIndex={0}
            >
              {truncateWidth(label ?? "-", 4 * cellSize)}
            </text>
          </Tooltip>
        ))}
      </g>

      {/* main axis labels */}
      <g
        fill={theme["--color-black"]}
        textAnchor="middle"
        style={{ fontWeight: theme["--color-medium"] }}
      >
        <text
          transform={[
            `translate(${0.5 * width}, ${height})`,
            `translate(0, ${0.75 * cellSize})`,
          ].join(" ")}
        >
          {x.label ?? "-"}
        </text>

        <text
          transform={[
            `translate(${width}, ${0.5 * height})`,
            `translate(${0.75 * cellSize}, 0)`,
            `rotate(-90)`,
          ].join(" ")}
        >
          {y.label ?? "-"}
        </text>
      </g>

      {/* legend */}
      <g
        fill={theme["--color-black"]}
        transform={`translate(${width + 3 * cellSize}, ${0.5 * height - 0.5 * legendHeight})`}
      >
        {/* main label */}
        <text
          x={0}
          y={-cellSize}
          textAnchor="middle"
          style={{ fontWeight: theme["--color-medium"] }}
        >
          {legend ?? "-"}
        </text>

        {/* gradient rect */}
        <Gradient
          id={gradient}
          reverse={reverse}
          direction="vertical"
          x={-0.25 * cellSize}
          y={0}
          width={0.5 * cellSize}
          height={legendHeight}
        />

        {/* labels */}
        <g>
          {legendScale.map(({ label, percent }, index) => (
            <text key={index} x={0.5 * cellSize} y={percent * legendHeight}>
              {label}
            </text>
          ))}
        </g>
      </g>
    </Chart>
  );
};

export default Heatmap;
