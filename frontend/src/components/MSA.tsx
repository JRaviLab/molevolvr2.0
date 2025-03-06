import { Fragment, useMemo } from "react";
import clsx from "clsx";
import { countBy, mapKeys, mapValues, max, orderBy, range, uniq } from "lodash";
import { useColorMap } from "@/util/color";
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

const MSA = ({ tracks, types: _types }: Props) => {
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

  /** map of type to color */
  const colors = useColorMap(Object.values(types), "mode");

  /** reactive CSS vars */
  const theme = useTheme();

  /** header row */
  const header = range(0, length + 10).map((index) => {
    /** get chars in column */
    const col = tracks.map((track) => track.sequence[index]);
    /** get percentage breakdown of each unique character in col */
    let percents = mapValues(countBy(col), (value) => value / col.length);
    /** catch undefined values */
    percents = mapKeys(percents, (_, key) => (key === "undefined" ? "" : key));
    /** put larger percents first */
    return orderBy(Object.entries(percents), "[1]");
  });

  return (
    <div className={classes.msa}>
      <div className={clsx("secondary", classes["header-label"])}>Combined</div>
      <div className={clsx("secondary", classes["tick-label"])}>#</div>

      <div className={classes.labels}>
        {tracks.map((track, index) => (
          <div key={index} className={classes.label}>
            {track.label ?? "-"}
          </div>
        ))}
      </div>

      <div className={classes.scroll}>
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
          >
            {range(1, length)
              .filter((index) => index % 5 === 0 || index === length - 1)
              .map((index) => {
                const x = (index + 0.5) * cellWidth;
                const y = cellHeight * 0.5;
                return (
                  <Fragment key={index}>
                    <text x={x} y={y}>
                      {index}
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

export default MSA;
