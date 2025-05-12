import { useEffect, useRef, useState } from "react";
import {
  FaBezierCurve,
  FaDownload,
  FaFilePdf,
  FaRegImage,
} from "react-icons/fa6";
import { extent, scaleBand, scaleLinear } from "d3";
import { range, truncate } from "lodash";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import Flex from "@/components/Flex";
import { Gradient, gradientFunc, gradientOptions } from "@/components/gradient";
import Popover from "@/components/Popover";
import SelectSingle from "@/components/SelectSingle";
import Tooltip from "@/components/Tooltip";
import { fitViewBox, printElement } from "@/util/dom";
import { downloadJpg, downloadPng, downloadSvg } from "@/util/download";
import { rootFontSize, useSvgTransform, useTheme } from "@/util/hooks";
import classes from "./Heatmap.module.css";

type Props = {
  /** x-axis data */
  x: {
    /** axis label */
    label?: string;
    /** column labels */
    labels: (string | undefined)[];
  };
  /** y-axis data */
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

/** options, in svg units (relative): */
const cellWidth = 50;
const cellHeight = 50;
const legendHeight = 300;

const labelTruncate = 10;

const Heatmap = ({ x, y, data, legend, min, max }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);

  /** selected gradient */
  const [gradient, setGradient] = useState(gradientOptions(false)[0]!.id);

  /** flip gradient */
  const [flip, setFlip] = useState(false);

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
  {
    const range = extent(data.flat().map((value) => value ?? 0));
    min ??= range[0] ?? 0;
    max ??= range[1] ?? 1;
  }

  /** value to % */
  const valueScale = scaleLinear([min, max], [0, 1]);
  /** % to color */
  const colorScale = (value: number) => gradientFunc(gradient, flip, value);

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

  return (
    <Flex direction="column" gap="lg" full>
      <svg ref={svgRef} className={classes.chart} style={{ fontSize }}>
        {/* cells */}
        {data.map((row, rowIndex) =>
          row.map((col, colIndex) => (
            <Tooltip
              key={[colIndex, rowIndex].join("-")}
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
                className={classes.cell}
                x={xScale(colIndex) ?? 0}
                y={yScale(rowIndex) ?? 0}
                width={xScale.bandwidth() ?? 0}
                height={yScale.bandwidth() ?? 0}
                fill={col ? colorScale(valueScale(col)) : theme["--light-gray"]}
                tabIndex={0}
                role="button"
              />
            </Tooltip>
          )),
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

          {/* gradient rect */}
          <Gradient
            id={gradient}
            flip={flip}
            direction="vertical"
            x={-fontSize * 0.5}
            y={0}
            width={fontSize}
            height={legendHeight}
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
          options={gradientOptions(flip)}
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
        <Popover
          content={
            <Flex direction="column" hAlign="stretch" gap="xs">
              <Button
                icon={<FaRegImage />}
                text="PNG"
                onClick={() =>
                  svgRef.current && downloadPng(svgRef.current, "sunburst")
                }
                tooltip="High-resolution image"
              />
              <Button
                icon={<FaRegImage />}
                text="JPEG"
                onClick={() =>
                  svgRef.current && downloadJpg(svgRef.current, "sunburst")
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
                onClick={() => svgRef.current && printElement(svgRef.current)}
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

export default Heatmap;
