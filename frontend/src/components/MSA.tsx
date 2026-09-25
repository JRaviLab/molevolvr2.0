import type { Hue } from "@/util/color";
import type { Filename } from "@/util/download";
import { Fragment, useState } from "react";
import { pairs } from "d3";
import { countBy, mapKeys, mapValues, max, orderBy, range } from "lodash";
import Chart from "@/components/Chart";
import CheckBox from "@/components/CheckBox";
import Legend from "@/components/Legend";
import TextBox from "@/components/TextBox";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import { useTextSize, useTheme } from "@/util/hooks";

/** label size */
const labelWidth = 200;
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
  colors?: Record<string, Hue>;
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
export default function MSA({
  title,
  filename = [],
  tracks,
  getType = (char) => char,
  colors: manualColors = {},
}: Props) {
  console.debug("msa render");

  /** characters to highlight */
  const [highlight, setHighlight] = useState("");

  /** highlight props */
  const getHighlight = (char: string) => ({
    opacity:
      highlight.trim() && !highlight.toLowerCase().includes(char.toLowerCase())
        ? 0.1
        : 1,
  });

  /** whether to wrap sequence to separate "panels" */
  const [wrap, setWrap] = useState(true);

  const theme = useTheme();

  const { fontSize, truncateWidth } = useTextSize();

  /** maximum sequence length */
  const length = max(tracks.map((track) => track.sequence.length)) ?? 0;

  /** assign types */
  const { combinedWithTypes, tracksWithTypes, types } = getDerived(
    tracks,
    length,
    getType,
  );

  /** map of type to color */
  const colors = useColorMap(types, "mode", manualColors);

  return (
    <Chart
      title={title}
      filename={[...filename, "msa"]}
      className="w-full"
      controls={[
        <TextBox
          key="highlight"
          placeholder="Highlight characters"
          value={highlight}
          onChange={setHighlight}
        />,
        <CheckBox
          key="wrap"
          label="Wrap"
          tooltip="Wrap sequence to stacked panels"
          value={wrap}
          onChange={setWrap}
        />,
      ]}
    >
      {({ width }) => {
        console.debug("msa chart render");

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
                  {/* labels column */}
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
                            {truncateWidth(track.label || "-", labelWidth)}
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
                    {panelCombined.map((column, columnIndex) => {
                      let accumulatedPercent = 0;
                      return Object.entries(column).map(
                        ([char, { percent, type }], charIndex) => {
                          const x = columnIndex * charWidth;
                          const y = accumulatedPercent * rowHeight;
                          const width = charWidth;
                          const height = percent * rowHeight;

                          const element = (
                            <g key={charIndex} {...getHighlight(char)}>
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
                                  `scale(1, ${(percent * rowHeight) / fontSize})`,
                                ].join(" ")}
                              >
                                {char && char.trim() ? char : "-"}
                              </text>
                            </g>
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
                          {sequence.map(({ char, type }, charIndex) => (
                            <rect
                              key={trackIndex + "-" + charIndex}
                              x={charIndex * charWidth}
                              y={trackIndex * rowHeight}
                              width={charWidth}
                              height={rowHeight}
                              fill={colors[type] ?? colors[""]}
                              {...getHighlight(char)}
                            />
                          ))}
                          {/* characters */}
                          <text key={trackIndex}>
                            {sequence.map(({ char }, charIndex) => (
                              <tspan
                                key={charIndex}
                                x={(charIndex + 0.5) * charWidth}
                                y={(trackIndex + 0.5) * rowHeight}
                                {...getHighlight(char)}
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
              entries={mapValues(colors, (color) => ({ color }))}
            />
          </>
        );
      }}
    </Chart>
  );
}

/** get input data + derived data, e.g. assigning types */
const getDerived = (
  tracks: Props["tracks"],
  length: number,
  getType: NonNullable<Props["getType"]>,
) => {
  /** get top row where each column is combo of chars below it */
  const combined = range(0, length).map((index) => {
    /** get chars in column */
    const column = tracks.map((track) => track.sequence[index]);
    /** get percentage breakdown of each unique character in column */
    let percents = mapValues(countBy(column), (value) => value / column.length);
    /** catch undefined values */
    percents = mapKeys(percents, (_, key) => (key === "undefined" ? "" : key));
    /** put larger percents first */
    return Object.fromEntries(orderBy(Object.entries(percents), "[1]"));
  });

  /** keep track of unique types */
  const types = new Set<string>();

  const addType: typeof getType = (char, column) => {
    /** get type from provided func */
    const type = getType(char, column);
    /** add type */
    types.add(type);
    return type;
  };

  /** derive type for each combined row column, just once */
  const combinedWithTypes = combined.map((column) =>
    mapValues(column, (percent, char) => ({
      percent,
      type: addType(char, column),
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
