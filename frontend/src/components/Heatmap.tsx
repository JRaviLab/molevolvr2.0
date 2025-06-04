import { useRef, useState } from "react";
import clsx from "clsx";
import { extent, scaleBand, scaleLinear, transpose } from "d3";
import { range } from "lodash";
import CheckBox from "@/components/CheckBox";
import Download from "@/components/Download";
import Flex from "@/components/Flex";
import { Gradient, gradientFunc, gradientOptions } from "@/components/Gradient";
import SelectSingle from "@/components/SelectSingle";
import Svg, { Truncate } from "@/components/Svg";
import Tooltip from "@/components/Tooltip";
import { useTheme } from "@/util/hooks";
import classes from "./Heatmap.module.css";

type Props = {
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
const Heatmap = ({ x, y, data, legend, min, max }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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

  /** sizes of elements */
  const cellSize = 30;
  const legendHeight = Math.min(
    cellSize * Math.max(0, data.length - 2),
    cellSize * 5,
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
    <Flex direction="column" gap="lg">
      <div ref={containerRef} className={clsx("card", classes.container)}>
        <Svg ref={svgRef} className={classes.chart}>
          {/* cells */}
          {data.map((row, rowIndex) =>
            row.map((col, colIndex) => (
              <Tooltip
                key={[colIndex, rowIndex].join("-")}
                content={
                  <div className="mini-table">
                    <span>Value</span>
                    <span>{col}</span>
                    <span>{x.label}</span>
                    <span>{x.labels[colIndex]}</span>
                    <span>{y.label}</span>
                    <span>{y.labels[colIndex]}</span>
                  </div>
                }
              >
                <rect
                  className={classes.cell}
                  x={xScale(colIndex) ?? 0}
                  y={yScale(rowIndex) ?? 0}
                  width={xScale.bandwidth() ?? 0}
                  height={yScale.bandwidth() ?? 0}
                  fill={
                    col ? colorScale(valueScale(col)) : theme["--light-gray"]
                  }
                  tabIndex={0}
                  role="button"
                />
              </Tooltip>
            )),
          )}

          {/* x axis tick labels */}
          <g fill={theme["--black"]} dominantBaseline="central">
            {x.labels.map((label, index) => (
              <Tooltip content={label} key={index}>
                <Truncate
                  tag="text"
                  width={cellSize * 4}
                  transform={[
                    `translate(0, ${-cellSize * 0.5})`,
                    `translate(${(xScale(index) ?? 0) + xScale.bandwidth() * 0.5}, 0)`,
                    `rotate(-45)`,
                  ].join("")}
                  tabIndex={0}
                  // for safari
                  dominantBaseline="central"
                >
                  {label ?? "-"}
                </Truncate>
              </Tooltip>
            ))}
          </g>

          {/* y axis tick labels */}
          <g
            fill={theme["--black"]}
            textAnchor="end"
            dominantBaseline="central"
          >
            {y.labels.map((label, index) => (
              <Tooltip content={label} key={index}>
                <Truncate
                  tag="text"
                  width={cellSize * 4}
                  transform={[
                    `translate(${-cellSize * 0.5}, 0)`,
                    `translate(0, ${(yScale(index) ?? 0) + yScale.bandwidth() * 0.5})`,
                    `rotate(-45)`,
                  ].join(" ")}
                  tabIndex={0}
                  // for safari
                  dominantBaseline="central"
                >
                  {label ?? "-"}
                </Truncate>
              </Tooltip>
            ))}
          </g>

          {/* main axis labels */}
          <g
            fill={theme["--black"]}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontWeight: "500" }}
          >
            <text
              transform={[
                `translate(${width * 0.5}, ${height})`,
                `translate(0, ${cellSize * 0.75})`,
              ].join(" ")}
              // for safari
              dominantBaseline="central"
            >
              {x.label ?? "-"}
            </text>

            <text
              transform={[
                `translate(${width}, ${height * 0.5})`,
                `translate(${cellSize * 0.75}, 0)`,
                `rotate(-90)`,
              ].join(" ")}
            >
              {y.label ?? "-"}
            </text>
          </g>

          {/* legend */}
          <g
            fill={theme["--black"]}
            transform={`translate(${width + cellSize * 3}, ${height * 0.5 - legendHeight * 0.5})`}
          >
            {/* main label */}
            <text
              x={0}
              y={-cellSize}
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontWeight: "500" }}
            >
              {legend ?? "-"}
            </text>

            {/* gradient rect */}
            <Gradient
              id={gradient}
              reverse={reverse}
              direction="vertical"
              x={-cellSize * 0.25}
              y={0}
              width={cellSize * 0.5}
              height={legendHeight}
            />

            {/* labels */}
            {legendScale.map(({ label, percent }, index) => (
              <text
                key={index}
                x={cellSize * 0.5}
                y={percent * legendHeight}
                dominantBaseline="central"
              >
                {label}
              </text>
            ))}
          </g>
        </Svg>
      </div>

      {/* controls */}
      <Flex>
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

        <Download
          filename={["Heatmap"]}
          raster={containerRef}
          vector={svgRef}
        />
      </Flex>
    </Flex>
  );
};

export default Heatmap;
