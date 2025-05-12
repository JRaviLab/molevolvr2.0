import { useId } from "react";
import * as d3 from "d3";
import { range } from "lodash";
import type { Option } from "@/components/SelectSingle";

type Props = {
  id: Id;
  flip?: boolean;
};

/** gradient preview thumbnail */
export const GradientThumb = ({ id, flip = false }: Props) => {
  const filter = useId();

  return (
    <svg
      viewBox="0 0 10 10"
      width="3em"
      height="1em"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={filter}>
          {range(0, 1, 0.1)
            .concat([1])
            .map((percent, index) => (
              <stop
                key={index}
                offset={`${100 * percent}%`}
                stopColor={gradientFunc(id, flip, percent)}
              />
            ))}
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={10} height={10} fill={`url(#${filter})`} />
    </svg>
  );
};

/** a few pretty color gradient options */
/** from https://d3js.org/d3-scale-chromatic */
export const gradients = [
  "interpolateRdPu",
  "interpolatePuBuGn",
  "interpolatePuBu",
  "interpolateBuPu",
  "interpolateGnBu",
  "interpolateYlGnBu",
  "interpolateYlOrRd",
  "interpolatePuRd",
  "interpolateOrRd",

  "interpolateBlues",
  "interpolateGreens",
  "interpolateOranges",
  "interpolatePurples",
  "interpolateReds",
  "interpolateGreys",

  "interpolateCool",
  "interpolateViridis",
  "interpolatePlasma",
  "interpolateTurbo",
  "interpolateMagma",

  "interpolateSpectral",
  "interpolateRdYlGn",
  "interpolateRdYlBu",
  "interpolateRdBu",
  "interpolatePiYG",
  "interpolatePuOr",
  "interpolatePRGn",
] satisfies Extract<keyof typeof d3, `interpolate${string}`>[];

type Id = (typeof gradients)[number];

export const gradientFunc = (id: Id, flip: boolean, value: number) =>
  d3[id](flip ? 1 - value : value);

/** list of gradient options for select */
export const gradientOptions = (flip: boolean) =>
  gradients.map((id) => ({
    id,
    primary: id.replace("interpolate", ""),
    icon: <GradientThumb id={id} flip={flip} />,
  })) satisfies Option[];
