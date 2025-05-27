import { Fragment, useMemo, useRef, useState } from "react";
import {
  FaDownload,
  FaFilePdf,
  FaRegImage,
  FaTableCellsLarge,
} from "react-icons/fa6";
import { TbPrompt } from "react-icons/tb";
import clsx from "clsx";
import { pairs } from "d3";
import {
  clamp,
  countBy,
  mapKeys,
  mapValues,
  max,
  orderBy,
  range,
  startCase,
} from "lodash";
import { useLocalStorage } from "@reactuses/core";
import Collapse from "@/assets/collapse.svg?react";
import Expand from "@/assets/expand.svg?react";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Legend from "@/components/Legend";
import NumberBox from "@/components/NumberBox";
import Popover from "@/components/Popover";
import Tooltip from "@/components/Tooltip";
import { useColorMap, type Hue } from "@/util/color";
import { printElement } from "@/util/dom";
import {
  downloadJpg,
  downloadPng,
  downloadTsv,
  downloadTxt,
} from "@/util/download";
import { useTheme } from "@/util/hooks";
import { round } from "@/util/math";
import { sleep } from "@/util/misc";
import classes from "./MSA.module.css";

/** track of single sequence */
type Track = {
  label?: string;
  info?: string;
  sequence: string;
};

export type Combined = Record<string, number>;

export type Props = {
  /** tracks of sequences */
  tracks: Track[];
  /** func to map character to arbitrary type/category */
  getType?: (char: string, combined: Combined) => string;
  /** map of arbitrary type to color */
  colors?: Record<string, Hue>;
};

const minWrap = 10;
const maxWrap = 1000;

/** options, in svg units (relative): */

const cellWidth = 5;
const cellHeight = 10;
const combinedHeight = 20;
const fontSize = 7;
const strokeWidth = 0.25;

/** ROUGHLY tune wrap to match window size */
/** dependent on page css */
/** 1000 px -> 50 chars, 500px -> 10 chars */
const autoWrap = (expanded: boolean) =>
  clamp(
    round(0.08 * window.innerWidth - 30, 5),
    minWrap,
    expanded ? maxWrap : 60,
  );

/** multiple sequence alignment plot */
const MSA = ({
  tracks,
  getType = (char) => char,
  colors: manualColors = {},
}: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);

  /** full width */
  let [expanded, setExpanded] = useLocalStorage("msa-expanded", false);
  expanded ??= false;

  /** maximum sequence length */
  const length = useMemo(
    () => max(tracks.map((track) => track.sequence.length)) ?? 0,
    [tracks],
  );

  /** wrap sequence to new row if more than this num of chars */
  const [wrap, setWrap] = useState(length);

  /** assign types */
  const { combinedWithTypes, tracksWithTypes, types } = useMemo(
    () => getDerived(tracks, length, getType),
    [tracks, length, getType],
  );

  /** map of type to color */
  const colors = useColorMap(types, "mode", manualColors);

  /** split sequence into chunks */
  const chunks: [number, number][] = pairs(
    range(0, length, wrap).concat([length]),
  );

  return (
    <Flex direction="column" full>
      <Flex
        ref={ref}
        direction="column"
        hAlign="left"
        className={clsx("card", classes.root, expanded && classes.expanded)}
      >
        {/* chunks */}
        {chunks.map(([start, end], index) => (
          <MSAChunk
            key={index}
            tracks={tracksWithTypes.map((track) => ({
              ...track,
              sequence: track.sequence.slice(start, end),
            }))}
            colors={colors}
            combined={combinedWithTypes.slice(start, end)}
            start={start}
            end={end}
          />
        ))}

        {/* legend */}
        <Legend entries={mapValues(colors, (color) => ({ color }))} />
      </Flex>

      {/* controls */}
      <Flex gap="lg" gapRatio={0.5}>
        <NumberBox
          label="Wrap"
          layout="horizontal"
          value={wrap}
          onChange={setWrap}
          min={10}
          max={round(length, 10, "ceil")}
          step={5}
          tooltip="Wrap to new rows if sequence longer than this many characters"
        />

        <Flex gap="xs">
          <Popover
            content={
              <Flex direction="column" hAlign="stretch" gap="xs">
                <Button
                  icon={<FaRegImage />}
                  text="PNG"
                  onClick={async () => {
                    if (!ref.current) return;
                    const oldWrap = wrap;
                    setWrap(autoWrap(expanded));
                    await sleep(10);
                    downloadPng(ref.current, "msa");
                    await sleep(10);
                    setWrap(oldWrap);
                  }}
                  tooltip="High-resolution image"
                />
                <Button
                  icon={<FaRegImage />}
                  text="JPEG"
                  onClick={async () => {
                    if (!ref.current) return;
                    const oldWrap = wrap;
                    setWrap(autoWrap(expanded));
                    await sleep(10);
                    downloadJpg(ref.current, "msa");
                    await sleep(10);
                    setWrap(oldWrap);
                  }}
                  tooltip="Compressed image"
                />
                <Button
                  icon={<FaTableCellsLarge />}
                  text="TSV"
                  onClick={() =>
                    downloadTsv(
                      tracks.map((track) =>
                        mapKeys(track, (value, key) => startCase(key)),
                      ),
                      "msa",
                    )
                  }
                  tooltip="Raw sequence data, tab-separated"
                />
                <Button
                  icon={<TbPrompt />}
                  text="FASTA"
                  onClick={() =>
                    downloadTxt(
                      tracks
                        .map((track) => `> ${track.label}\n${track.sequence}`)
                        .join("\n\n"),
                      "msa",
                    )
                  }
                  tooltip="Raw sequence data, FASTA format"
                />
                <Button
                  icon={<FaFilePdf />}
                  text="PDF"
                  onClick={async () => {
                    if (!ref.current) return;
                    const oldWrap = wrap;
                    await printElement(ref.current, () => setWrap(40));
                    setWrap(oldWrap);
                  }}
                  tooltip="Print as pdf"
                />
              </Flex>
            }
          >
            <Button
              icon={<FaDownload />}
              design="hollow"
              tooltip="Download visualization"
            />
          </Popover>

          <Button
            icon={expanded ? <Collapse /> : <Expand />}
            tooltip={expanded ? "Collapse width" : "Expand width"}
            design="hollow"
            onClick={() => setExpanded(!expanded)}
          />
        </Flex>
      </Flex>
    </Flex>
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

type ChunkProps = {
  combined: ReturnType<typeof getDerived>["combinedWithTypes"];
  tracks: ReturnType<typeof getDerived>["tracksWithTypes"];
  colors: Record<string, string>;
  start: number;
  end: number;
};

const MSAChunk = ({ combined, tracks, colors, start, end }: ChunkProps) => {
  /** reactive CSS vars */
  const theme = useTheme();

  /** chunk sequence length */
  const length = end - start;

  return (
    <div className={classes.msa}>
      <div className={clsx("secondary", classes["combined-label"])}>
        Combined
      </div>
      <div className={clsx("secondary", classes["tick-label"])}>Position</div>

      <div className={classes.labels}>
        {tracks.map((track, index) => (
          <Tooltip key={index} content={track.label}>
            <div className="truncate" tabIndex={0} role="button">
              {track.label ?? "-"}
            </div>
          </Tooltip>
        ))}
      </div>

      <div
        className={classes.scroll}
        tabIndex={0}
        role="button"
        aria-label="Sequence data"
      >
        {/* combined row */}
        <svg
          viewBox={[0, 0, length * cellWidth, combinedHeight].join(" ")}
          height={`${combinedHeight / cellHeight}lh`}
        >
          <g
            fill={theme["--black"]}
            textAnchor="middle"
            style={{ fontFamily: theme["--mono"], fontSize }}
            className="axe-ignore"
          >
            {combined.map((col, colIndex) => {
              let accumulatedPercent = 0;
              return Object.entries(col).map(
                ([char, { percent, type }], charIndex) => {
                  const x = colIndex * cellWidth;
                  const y = accumulatedPercent * combinedHeight;
                  const width = cellWidth;
                  const height = percent * combinedHeight;

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
                          `scale(1, ${(percent * combinedHeight) / fontSize})`,
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
        </svg>

        {/* tick row */}
        <svg
          viewBox={[0, 0, length * cellWidth, cellHeight].join(" ")}
          height="1lh"
        >
          <g
            fill={theme["--black"]}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontSize: fontSize * 0.75 }}
            className="axe-ignore"
          >
            {range(0, length)
              .filter((index) => index % 5 === 0)
              .map((index) => {
                const x = (index + 0.5) * cellWidth;
                const y = cellHeight * 0.5;
                return (
                  <Fragment key={index}>
                    <text
                      x={x}
                      y={y}
                      // for safari
                      dominantBaseline="central"
                    >
                      {index + start}
                    </text>
                    <line
                      x1={x}
                      x2={x}
                      y1={0.75 * cellHeight}
                      y2={cellHeight}
                      stroke={theme["--black"]}
                      strokeWidth={strokeWidth}
                    />
                  </Fragment>
                );
              })}
          </g>
        </svg>

        {/* sequence rows */}
        <svg
          viewBox={[0, 0, length * cellWidth, tracks.length * cellHeight].join(
            " ",
          )}
          height={`${tracks.length}lh`}
        >
          {/* cells */}
          <g
            fill={theme["--black"]}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontFamily: theme["--mono"], fontSize }}
            className="axe-ignore"
          >
            {tracks.map(({ sequence }, trackIndex) => {
              return (
                <Fragment key={trackIndex}>
                  {/* cells */}
                  {sequence.map(({ type }, charIndex) => (
                    <rect
                      key={trackIndex + "-" + charIndex}
                      x={charIndex * cellWidth}
                      y={trackIndex * cellHeight}
                      width={cellWidth}
                      height={cellHeight}
                      fill={colors[type] ?? colors[""]}
                    />
                  ))}
                  {/* characters */}
                  <text key={trackIndex} className={classes.sequence}>
                    {sequence.map(({ char }, charIndex) => (
                      <tspan
                        key={charIndex}
                        x={(charIndex + 0.5) * cellWidth}
                        y={(trackIndex + 0.5) * cellHeight}
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
        </svg>
      </div>
    </div>
  );
};
