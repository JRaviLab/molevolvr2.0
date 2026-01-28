import type { Hue } from "@/util/color";
import type { Filename } from "@/util/download";
import { Fragment, useMemo, useState } from "react";
import { pairs } from "d3";
import { countBy, mapKeys, mapValues, max, orderBy, range } from "lodash";
import Chart from "@/components/Chart";
import CheckBox from "@/components/CheckBox";
import Legend from "@/components/Legend";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import { useTextSize, useTheme } from "@/util/hooks";

/** label size */
const labelWidth = 150;
/** seq char width */
const charWidth = 12;
/** row height */
const rowHeight = 20;
/** min chars to show per row */
const minChars = 10;

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
  colorMap?: Record<string, Hue>;
};

/** track of single sequence */
type Track = {
  /** track name */
  label?: string;
  /** sequence chars */
  sequence: string;
};

export type Combined = Record<string, number>;

/** multiple sequence alignment plot */
const MSA = ({
  title,
  filename = [],
  tracks,
  getType = (char) => char,
  colorMap: manualColors = {},
}: Props) => {
  /** whether to wrap sequence to separate "panels" */
  const [wrap, setWrap] = useState(true);

  const theme = useTheme();

  const { fontSize, truncateWidth } = useTextSize();

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
  const colorMap = useColorMap(types, "mode", manualColors);

  return (
    <Chart
      title={title}
      filename={[...filename, "msa"]}
      controls={[
        <CheckBox
          label="Wrap"
          tooltip="Wrap sequence to stacked panels"
          value={wrap}
          onChange={setWrap}
        />,
      ]}
      containerProps={{ className: "w-full" }}
    >
      {({ width }) => {
        /** max num of chars that can fit in width */
        const rowChars = wrap
          ? Math.max(
              Math.floor((width - labelWidth - rowHeight) / charWidth) - 1,
              minChars,
            )
          : length;

        /** split sequence into multiple panels */
        const panels: [number, number][] = pairs(
          range(0, length, rowChars).concat([length]),
        );

        return (
          <>
            {panels.map(([start, end], panelIndex) => {
              /** data slice for this panel */
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
                  <g textAnchor="end" transform={`translate(${-rowHeight}, 0)`}>
                    <g fill={theme["--color-gray"]}>
                      <text x={0} y={-1.5 * rowHeight}>
                        Combined
                      </text>
                      <text x={0} y={-0.5 * rowHeight}>
                        Position
                      </text>
                    </g>
                    <g fill={theme["--color-black"]}>
                      {panelTracks.map((track, trackIndex) => (
                        <Tooltip key={trackIndex} content={track.label}>
                          <text
                            x={0}
                            y={(trackIndex + 0.5) * rowHeight}
                            tabIndex={0}
                          >
                            {truncateWidth(track.label ?? "-", labelWidth)}
                          </text>
                        </Tooltip>
                      ))}
                    </g>
                  </g>

                  {/* combined row */}
                  <g
                    fill={theme["--color-black"]}
                    textAnchor="middle"
                    transform={`translate(0, ${-2 * rowHeight})`}
                    style={{ fontFamily: theme["--color-mono"] }}
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
                                fill={colorMap[type] ?? colorMap[""]}
                              />
                              {/* char */}
                              <text
                                transform={[
                                  `translate(${x + width / 2}, ${y + height / 2})`,
                                  `scale(1, ${(percent * rowHeight) / fontSize})`,
                                ].join(" ")}
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
                    fill={theme["--color-black"]}
                    textAnchor="middle"
                    transform={`translate(0, ${-1 * rowHeight})`}
                    style={{ fontSize: 0.75 * fontSize }}
                  >
                    {range(0, length)
                      .filter((index) => index >= start && index < end)
                      .filter((index) => index % 5 === 0)
                      .map((index) => {
                        const x = (index - start + 0.5) * charWidth;
                        const y = 0.5 * rowHeight;
                        return (
                          <Fragment key={index}>
                            <text x={x} y={y}>
                              {index}
                            </text>
                          </Fragment>
                        );
                      })}
                  </g>

                  {/* tracks */}
                  <g
                    fill={theme["--color-black"]}
                    textAnchor="middle"
                    style={{ fontFamily: theme["--color-mono"] }}
                  >
                    {panelTracks.map(({ sequence }, trackIndex) => {
                      return (
                        <g key={trackIndex}>
                          {/* cells */}
                          {sequence.map(({ type }, charIndex) => (
                            <rect
                              key={trackIndex + "-" + charIndex}
                              x={charIndex * charWidth}
                              y={trackIndex * rowHeight}
                              width={charWidth}
                              height={rowHeight}
                              fill={colorMap[type] ?? colorMap[""]}
                            />
                          ))}
                          {/* characters */}
                          <text key={trackIndex}>
                            {sequence.map(({ char }, charIndex) => (
                              <tspan
                                key={charIndex}
                                x={(charIndex + 0.5) * charWidth}
                                y={(trackIndex + 0.5) * rowHeight}
                              >
                                {char.trim() ? char : "-"}
                              </tspan>
                            ))}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </g>
              );
            })}

            <Legend
              x={-labelWidth - rowHeight}
              y={
                panels.length * (4 + tracks.length) * rowHeight - 2 * rowHeight
              }
              w={wrap ? width : Infinity}
              entries={mapValues(colorMap, (color) => ({ color }))}
            />
          </>
        );
      }}
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
