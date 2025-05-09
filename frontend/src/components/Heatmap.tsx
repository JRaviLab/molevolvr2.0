import { useEffect, useId, useRef, useState } from "react";
import { extent, scaleBand, scaleLinear } from "d3";
import * as d3 from "d3";
import { range, truncate } from "lodash";
import CheckBox from "@/components/CheckBox";
import Flex from "@/components/Flex";
import { gradientOptions } from "@/components/gradient";
import SelectSingle from "@/components/SelectSingle";
import Tooltip from "@/components/Tooltip";
import { fitViewBox } from "@/util/dom";
import { rootFontSize, useSvgTransform, useTheme } from "@/util/hooks";
import classes from "./Heatmap.module.css";

type Props = {
  x: {
    label?: string;
    labels: (string | undefined)[];
  };
  y: {
    label?: string;
    labels: (string | undefined)[];
  };
  data: (number | undefined)[][];
  legend?: string;
};

/** options, in svg units (relative): */
const cellWidth = 50;
const cellHeight = 50;
const legendHeight = 300;

const labelTruncate = 10;

const Heatmap = ({ x, y, data, legend }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);

  /** selected/highlighted cell */
  const [selected, setSelected] = useState<[number, number]>();

  /** selected gradient */
  const [gradient, setGradient] = useState(gradientOptions[0]!.id);

  /** flip gradient */
  const [flip, setFlip] = useState(false);

  /** deselect cell */
  const deselect = () => setSelected(undefined);

  /** reactive CSS vars */
  const theme = useTheme();

  /** font size, in svg units */
  const fontSize = useSvgTransform(svgRef, 1, rootFontSize()).h;

  /** col # to svg x coord */
  const xScale = scaleBand(range(0, x.labels.length), [
    0,
    x.labels.length * cellWidth,
  ]);
  /** row # to svg y coord */
  const yScale = scaleBand(range(0, y.labels.length), [
    0,
    y.labels.length * cellHeight,
  ]);

  /** value range */
  const [min = 0, max = 1] = extent(data.flat().map((value) => value ?? 0));

  /** value to % */
  const valueScale = scaleLinear([min, max], [0, 1]);
  /** % to color */
  const colorScale = (value: number) => d3[gradient](flip ? 1 - value : value);

  /** fit view box */
  useEffect(() => {
    if (!svgRef.current) return;
    fitViewBox(svgRef.current, 0.01);
  });

  /** main chart area svg units */
  const width = (xScale(x.labels.length - 1) ?? 0) + xScale.bandwidth();
  const height = (yScale(y.labels.length - 1) ?? 0) + yScale.bandwidth();

  /** legend info */
  const legendScale = valueScale.ticks(4).map((tick, index, array) => ({
    label: index === 0 ? min : index === array.length - 1 ? max : tick,
    percent: index / (array.length - 1),
    color: colorScale(valueScale(tick)),
  }));

  /** color gradient id */
  const gradientId = useId();

  return (
    <Flex direction="column" gap="lg" full>
      <svg ref={svgRef} className={classes.chart} style={{ fontSize }}>
        {/* cells */}
        {data.map((row, rowIndex) =>
          row.map((col, colIndex) => {
            const cell: [number, number] = [colIndex, rowIndex];
            const select = () => setSelected(cell);
            const thisSelected =
              selected?.[0] === colIndex || selected?.[1] === rowIndex;

            return (
              <Tooltip
                key={cell.join("-")}
                content={
                  <div className="mini-table">
                    <span>Value</span>
                    <span>{col}</span>
                    <span>{x.label ?? "-"}</span>
                    <span>{x.labels[colIndex]}</span>
                    <span>{y.label ?? "-"}</span>
                    <span>{y.labels[colIndex]}</span>
                  </div>
                }
              >
                <rect
                  x={xScale(colIndex) ?? 0}
                  y={yScale(rowIndex) ?? 0}
                  width={xScale.bandwidth() ?? 0}
                  height={yScale.bandwidth() ?? 0}
                  fill={
                    col ? colorScale(valueScale(col)) : theme["--light-gray"]
                  }
                  opacity={
                    thisSelected === true || selected === undefined ? 1 : 0.25
                  }
                  tabIndex={0}
                  onFocus={select}
                  onBlur={deselect}
                  onMouseEnter={select}
                  onMouseLeave={deselect}
                />
              </Tooltip>
            );
          }),
        )}

        {/* axis lines */}
        <g
          stroke={theme["--black"]}
          strokeWidth={fontSize / 10}
          strokeLinecap="square"
        >
          <line x1={0} y1={0} x2={width} y2={0} />
          <line x1={0} y1={0} x2={0} y2={height} />
        </g>

        {/* x axis tick labels */}
        <g fill={theme["--black"]} dominantBaseline="central">
          {x.labels.map((label, index) => (
            <Tooltip content={label} key={index}>
              <text
                transform={[
                  `translate(0, ${-fontSize / 2})`,
                  `translate(${(xScale(index) ?? 0) + xScale.bandwidth() / 2}, 0)`,
                  `rotate(-45)`,
                ].join("")}
                tabIndex={0}
              >
                {truncate(label ?? "-", { length: labelTruncate })}
              </text>
            </Tooltip>
          ))}
        </g>

        {/* y axis tick labels */}
        <g fill={theme["--black"]} textAnchor="end" dominantBaseline="central">
          {y.labels.map((label, index) => (
            <Tooltip content={label} key={index}>
              <text
                transform={[
                  `translate(${-fontSize / 2}, 0)`,
                  `translate(0, ${(yScale(index) ?? 0) + yScale.bandwidth() / 2})`,
                  `rotate(-45)`,
                ].join(" ")}
                tabIndex={0}
              >
                {truncate(label ?? "-", { length: labelTruncate })}
              </text>
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
            transform={[`translate(${width / 2}, ${height + fontSize})`].join(
              " ",
            )}
          >
            {x.label ?? "-"}
          </text>

          <text
            transform={[
              `translate(${width + fontSize}, ${height / 2})`,
              `rotate(-90)`,
            ].join(" ")}
          >
            {y.label ?? "-"}
          </text>
        </g>

        {/* legend */}
        <g
          fill={theme["--black"]}
          transform={`translate(${width + fontSize * 4}, ${height * 0.5 - legendHeight / 2})`}
        >
          {/* main label */}
          <text
            x={0}
            y={-fontSize * 2}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontWeight: "500" }}
          >
            {legend ?? "-"}
          </text>

          {/* gradient def */}
          <defs>
            <linearGradient id={gradientId} gradientTransform="rotate(90)">
              {legendScale.map(({ percent, color }, index) => (
                <stop
                  key={index}
                  offset={`${100 * percent}%`}
                  stopColor={color}
                />
              ))}
            </linearGradient>
          </defs>

          {/* gradient rect */}
          <rect
            x={-fontSize * 0.5}
            y={0}
            width={fontSize}
            height={legendHeight}
            fill={`url(#${gradientId})`}
          />

          {/* labels */}
          {legendScale.map(({ label, percent }, index) => (
            <text
              key={index}
              x={fontSize}
              y={percent * legendHeight}
              dominantBaseline="central"
            >
              {label}
            </text>
          ))}
        </g>
      </svg>

      {/* controls */}
      <Flex>
        <SelectSingle
          label="Gradient"
          options={gradientOptions}
          layout="horizontal"
          value={gradient}
          onChange={setGradient}
        />

        <CheckBox
          label="Flip"
          tooltip="Flip gradient direction"
          value={flip}
          onChange={setFlip}
        />
      </Flex>
    </Flex>
  );
};

export default Heatmap;
