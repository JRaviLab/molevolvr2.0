import { Fragment, useContext, useMemo, useState } from "react";
import { pairs } from "d3";
import { countBy, mapKeys, mapValues, max, orderBy, range } from "lodash";
import Chart, { ChartContext } from "@/components/Chart";
import CheckBox from "@/components/CheckBox";
import Tooltip from "@/components/Tooltip";
import { useColorMap, type Hue } from "@/util/color";
import { rootFontSize } from "@/util/dom";
import type { Filename } from "@/util/download";
import { useTheme, useTruncateWidth } from "@/util/hooks";
import classes from "./MSA.module.css";

/** track of single sequence */
type Track = {
  label?: string;
  info?: string;
  sequence: string;
};

export type Combined = Record<string, number>;

export type Props = {
  /** title text */
  title?: string;
  /** download filename */
  filename?: Filename;
  /** tracks of sequences */
  tracks: Track[];
  /** func to map character to arbitrary type/category */
  getType?: (char: string, combined: Combined) => string;
  /** map of arbitrary type to color */
  colors?: Record<string, Hue>;
};

/** label size */
const labelWidth = 150;
/** seq char width */
const charWidth = 10;
/** row height */
const rowHeight = 20;

/** multiple sequence alignment plot */
const MSA = ({
  title,
  filename = [],
  tracks,
  getType = (char) => char,
  colors: manualColors = {},
}: Props) => {
  /** whether to wrap sequence to separate "panels" */
  const [wrap, setWrap] = useState(true);

  /** maximum sequence length */
  const length = useMemo(
    () => max(tracks.map((track) => track.sequence.length)) ?? 0,
    [tracks],
  );

  /** assign types */
  const { combinedWithTypes, tracksWithTypes, types } = useMemo(
    () => getDerived(tracks, length, getType),
    [tracks, length, getType],
  );

  /** map of type to color */
  const colors = useColorMap(types, "mode", manualColors);

  const theme = useTheme();

  const truncateWidth = useTruncateWidth();

  /** chart content */
  const Content = () => {
    /** info from chart wrapper */
    const { width } = useContext(ChartContext);

    /** max num of chars that can fit in width */
    const rowChars = wrap
      ? Math.max(Math.floor((width - labelWidth) / charWidth), 10)
      : length;

    /** split sequence into multiple panels */
    const panels: [number, number][] = pairs(
      range(0, length, rowChars).concat([length]),
    );

    return panels.map(([start, end], panelIndex) => {
      const panelCombined = combinedWithTypes.slice(start, end);
      const panelTracks = tracksWithTypes.map((track) => ({
        ...track,
        sequence: track.sequence.slice(start, end),
      }));

      return (
        <g
          key={panelIndex}
          transform={`translate(0, ${panelIndex * (4 + tracks.length) * rowHeight})`}
        >
          {/* labels col */}
          <g textAnchor="end" dominantBaseline="central">
            <g fill={theme["--gray"]}>
              <text
                x={-rowHeight}
                y={-1.5 * rowHeight}
                // for safari
                dominantBaseline="central"
              >
                Combined
              </text>
              <text
                x={-rowHeight}
                y={-0.5 * rowHeight}
                // for safari
                dominantBaseline="central"
              >
                Position
              </text>
            </g>
            <g fill={theme["--black"]}>
              {panelTracks.map((track, trackIndex) => (
                <Tooltip key={trackIndex} content={track.label}>
                  <text
                    x={-rowHeight}
                    y={(trackIndex + 0.5) * rowHeight}
                    tabIndex={0}
                    role="button"
                    // for safari
                    dominantBaseline="central"
                  >
                    {truncateWidth(track.label ?? "-", labelWidth)}
                  </text>
                </Tooltip>
              ))}
            </g>
          </g>

          {/* combined row */}
          <g
            fill={theme["--black"]}
            textAnchor="middle"
            transform={`translate(0, ${-2 * rowHeight})`}
            style={{ fontFamily: theme["--mono"], fontSize: rootFontSize }}
          >
            {panelCombined.map((col, colIndex) => {
              let accumulatedPercent = 0;
              return Object.entries(col).map(
                ([char, { percent, type }], charIndex) => {
                  const x = colIndex * charWidth;
                  const y = accumulatedPercent * rowHeight;
                  const width = charWidth;
                  const height = percent * rowHeight;

                  const element = (
                    <Fragment key={charIndex}>
                      {/* cell */}
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={colors[type] ?? colors[""]}
                      />
                      {/* char */}
                      <text
                        transform={[
                          `translate(${x + width / 2}, ${y + height / 2})`,
                          `scale(1, ${(percent * rowHeight) / 16})`,
                        ].join(" ")}
                        // for safari
                        dominantBaseline="central"
                      >
                        {char && char.trim() ? char : "-"}
                      </text>
                    </Fragment>
                  );
                  accumulatedPercent += percent;
                  return element;
                },
              );
            })}
          </g>

          {/* ticks row */}
          <g
            fill={theme["--black"]}
            textAnchor="middle"
            dominantBaseline="central"
            transform={`translate(0, ${-1 * rowHeight})`}
            style={{ fontSize: 0.75 * rootFontSize }}
          >
            {range(0, length)
              .filter((index) => index >= start && index <= end)
              .filter((index) => index % 5 === 0)
              .map((index) => {
                const x = (index - start + 0.5) * charWidth;
                const y = 0.5 * rowHeight;
                return (
                  <Fragment key={index}>
                    <text
                      x={x}
                      y={y}
                      // for safari
                      dominantBaseline="central"
                    >
                      {index}
                    </text>
                  </Fragment>
                );
              })}
          </g>

          <g
            fill={theme["--black"]}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontFamily: theme["--mono"], fontSize: rootFontSize }}
          >
            {panelTracks.map(({ sequence }, trackIndex) => {
              return (
                <Fragment key={trackIndex}>
                  {/* cells */}
                  {sequence.map(({ type }, charIndex) => (
                    <rect
                      key={trackIndex + "-" + charIndex}
                      x={charIndex * charWidth}
                      y={trackIndex * rowHeight}
                      width={charWidth}
                      height={rowHeight}
                      fill={colors[type] ?? colors[""]}
                    />
                  ))}
                  {/* characters */}
                  <text key={trackIndex} className={classes.sequence}>
                    {sequence.map(({ char }, charIndex) => (
                      <tspan
                        key={charIndex}
                        x={(charIndex + 0.5) * charWidth}
                        y={(trackIndex + 0.5) * rowHeight}
                        // for safari
                        dominantBaseline="central"
                      >
                        {char.trim() ? char : "-"}
                      </tspan>
                    ))}
                  </text>
                </Fragment>
              );
            })}
          </g>
        </g>
      );
    });
  };

  return (
    <Chart
      title={title}
      filename={[...filename, "msa"]}
      full
      controls={[
        <CheckBox
          label="Wrap"
          value={wrap}
          onChange={setWrap}
          tooltip="Wrap sequence to stacked panels"
        />,
      ]}
    >
      <Content />
    </Chart>
  );
};

export default MSA;

/** get input data + derived data, e.g. assigning types */
const getDerived = (
  tracks: Props["tracks"],
  length: number,
  getType: NonNullable<Props["getType"]>,
) => {
  /** get top row where each col is combo of chars below it */
  const combined = range(0, length).map((index) => {
    /** get chars in column */
    const col = tracks.map((track) => track.sequence[index]);
    /** get percentage breakdown of each unique character in col */
    let percents = mapValues(countBy(col), (value) => value / col.length);
    /** catch undefined values */
    percents = mapKeys(percents, (_, key) => (key === "undefined" ? "" : key));
    /** put larger percents first */
    return Object.fromEntries(orderBy(Object.entries(percents), "[1]"));
  });

  /** keep track of unique types */
  const types = new Set<string>();

  const addType: typeof getType = (char, col) => {
    /** get type from provided func */
    const type = getType(char, col);
    /** add type */
    types.add(type);
    return type;
  };

  /** derive type for each combined row col, just once */
  const combinedWithTypes = combined.map((col) =>
    mapValues(col, (percent, char) => ({
      percent,
      type: addType(char, col),
    })),
  );

  /** derive type for each track sequence char, just once */
  const tracksWithTypes = tracks.map(({ sequence, ...track }) => ({
    ...track,
    sequence: sequence.split("").map((char, charIndex) => ({
      char,
      type: addType(char, combined[charIndex] ?? {}),
    })),
  }));

  return { combinedWithTypes, tracksWithTypes, types: Array.from(types) };
};
