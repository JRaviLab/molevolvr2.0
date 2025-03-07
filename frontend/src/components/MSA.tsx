import { Fragment, useMemo, useRef, useState } from "react";
import {
  FaDownload,
  FaFilePdf,
  FaRegImage,
  FaTableCellsLarge,
} from "react-icons/fa6";
import clsx from "clsx";
import { pairs } from "d3";
import {
  countBy,
  inRange,
  mapKeys,
  mapValues,
  max,
  orderBy,
  range,
  uniq,
} from "lodash";
import { useLocalStorage } from "@reactuses/core";
import Collapse from "@/assets/collapse.svg?react";
import Expand from "@/assets/expand.svg?react";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import NumberBox from "@/components/NumberBox";
import Popover from "@/components/Popover";
import { useColorMap } from "@/util/color";
import { printElement } from "@/util/dom";
import { downloadJpg, downloadPng, downloadTsv } from "@/util/download";
import { useTheme } from "@/util/hooks";
import classes from "./MSA.module.css";

/** track of sequence */
type Track = {
  label?: string;
  sequence: string;
};

type Props = {
  tracks: Track[];
  /** map of character to arbitrary type/category */
  types?: Record<string, string | undefined>;
};

/** options, in svg units (relative): */

const cellWidth = 5;
const cellHeight = 10;
const headerHeight = 20;
const fontSize = 7;
const strokeWidth = 0.25;

/** visualization for multiple aligned sequences */
const MSA = ({ tracks, types: _types }: Props) => {
  const root = useRef<HTMLDivElement | null>(null);

  /** full width */
  const [expanded, setExpanded] = useLocalStorage("msa-expanded", false);

  /** map of char to type */
  const types = useMemo(
    () =>
      _types
        ? /** use provided types */
          mapValues(_types, (value) => value ?? "")
        : /** or auto-generate types */
          Object.fromEntries(
            uniq(tracks.flatMap((track) => track.sequence.split(""))).map(
              (char) => [char, char],
            ),
          ),
    [_types, tracks],
  );

  /** maximum sequence length */
  const length = useMemo(
    () => max(tracks.map((track) => track.sequence.length)) ?? 0,
    [tracks],
  );

  /** wrap sequence to new row if more than this num of chars */
  const [wrap, setWrap] = useState(length);

  /** map of type to color */
  const colors = useColorMap(Object.values(types), "mode");

  /** header row */
  const header = range(0, length).map((index) => {
    /** get chars in column */
    const col = tracks.map((track) => track.sequence[index]);
    /** get percentage breakdown of each unique character in col */
    let percents = mapValues(countBy(col), (value) => value / col.length);
    /** catch undefined values */
    percents = mapKeys(percents, (_, key) => (key === "undefined" ? "" : key));
    /** put larger percents first */
    return orderBy(Object.entries(percents), "[1]");
  });

  /** split sequence into chunks */
  const chunks: [number, number][] = inRange(wrap, 10, 1000)
    ? pairs(range(0, length, wrap).concat([length]))
    : [[0, length]];

  return (
    <Flex direction="column" full>
      <Flex
        ref={root}
        direction="column"
        hAlign="left"
        className={clsx("card", classes.root, expanded && classes.expanded)}
      >
        {chunks.map(([start, end], index) => (
          <MSAChunk
            key={index}
            tracks={tracks.map((track) => ({
              ...track,
              sequence: track.sequence.slice(start, end),
            }))}
            types={types}
            colors={colors}
            header={header.slice(start, end)}
            start={start}
            end={end}
          />
        ))}
      </Flex>

      {/* controls */}
      <Flex gap="lg" gapRatio={0.5}>
        <NumberBox
          label="Wrap"
          layout="horizontal"
          value={wrap}
          onChange={setWrap}
          min={50}
          max={Math.ceil(length / 10) * 10}
          step={10}
          tooltip="Wrap to new rows if sequence longer than this many characters"
        />

        <Flex gap="xs">
          <Popover
            content={
              <Flex direction="column" hAlign="stretch" gap="xs">
                <Button
                  icon={<FaRegImage />}
                  text="PNG"
                  onClick={() =>
                    root.current && downloadPng(root.current, "msa")
                  }
                  tooltip="High-resolution image"
                />
                <Button
                  icon={<FaRegImage />}
                  text="JPEG"
                  onClick={() =>
                    root.current && downloadJpg(root.current, "msa")
                  }
                  tooltip="Compressed image"
                />
                <Button
                  icon={<FaTableCellsLarge />}
                  text="TSV"
                  onClick={() =>
                    downloadTsv(
                      tracks.map((track) => [
                        track.label ?? "-",
                        track.sequence,
                      ]),
                      "msa",
                    )
                  }
                  tooltip="Raw sequence data, tab-separated"
                />
                <Button
                  icon={<FaFilePdf />}
                  text="PDF"
                  onClick={() => {
                    if (!root.current) return;
                    const oldWrap = wrap;
                    printElement(
                      root.current,
                      () => setWrap(50),
                      () => setWrap(oldWrap),
                    );
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

type ChunkProps = {
  tracks: Track[];
  types: Record<string, string>;
  colors: Record<string, string>;
  header: [string, number][][];
  start: number;
  end: number;
};

const MSAChunk = ({
  tracks,
  types,
  colors,
  header,
  start,
  end,
}: ChunkProps) => {
  /** reactive CSS vars */
  const theme = useTheme();

  /** chunk sequence length */
  const length = end - start;

  return (
    <div className={classes.msa}>
      <div className={clsx("secondary", classes["header-label"])}>Combined</div>
      <div className={clsx("secondary", classes["tick-label"])}>Pos.</div>

      <div className={classes.labels}>
        {tracks.map((track, index) => (
          <div key={index} className="truncate">
            {track.label ?? "-"}
          </div>
        ))}
      </div>

      <div
        className={classes.scroll}
        tabIndex={0}
        role="button"
        aria-label="Sequence data"
      >
        {/* header row */}
        <svg
          viewBox={[0, 0, length * cellWidth, headerHeight].join(" ")}
          height={`${headerHeight / cellHeight}lh`}
        >
          <g
            fill={theme["--black"]}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontFamily: theme["--mono"], fontSize }}
            className="axe-ignore"
          >
            {header.map((col, colIndex) => {
              let accumulatedPercent = 0;
              return col.map(([char, percent], charIndex) => {
                const x = colIndex * cellWidth;
                const y = accumulatedPercent * headerHeight;
                const width = cellWidth;
                const height = percent * headerHeight;

                const element = (
                  <Fragment key={charIndex}>
                    {/* cell */}
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={colors[types[char || ""] ?? ""] ?? colors[""]}
                    />
                    {/* char */}
                    <text
                      transform={[
                        `translate(${x + width / 2}, ${y + height / 2})`,
                        `scale(1, ${(percent * headerHeight) / fontSize})`,
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
              });
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
            {tracks.map((track, trackIndex) => {
              const chars = track.sequence.split("");

              return (
                <Fragment key={trackIndex}>
                  {/* cells */}
                  {chars.map((char, charIndex) => (
                    <rect
                      key={trackIndex + "-" + charIndex}
                      x={charIndex * cellWidth}
                      y={trackIndex * cellHeight}
                      width={cellWidth}
                      height={cellHeight}
                      fill={colors[types[char] ?? ""] ?? colors[""]}
                    />
                  ))}
                  {/* characters */}
                  <text key={trackIndex} className={classes.sequence}>
                    {chars.map((char, charIndex) => (
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
