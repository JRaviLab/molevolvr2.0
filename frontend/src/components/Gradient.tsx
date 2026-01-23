import { useId } from "react";
import type { ComponentProps } from "react";
import * as d3 from "d3";
import { range } from "lodash";
import type { Option } from "@/components/SelectSingle";

type Props = {
  id: Id;
  reverse?: boolean;
  direction?: "horizontal" | "vertical";
} & ComponentProps<"svg">;

/** gradient */
export const Gradient = ({
  id,
  reverse = false,
  direction = "horizontal",
  ...props
}: Props) => {
  const gradientId = useId();

  return (
    <svg viewBox="0 0 10 10" preserveAspectRatio="none" {...props}>
      <defs>
        <linearGradient
          id={gradientId}
          gradientTransform={direction === "vertical" ? "rotate(90)" : ""}
        >
          {range(0, 1, 0.1)
            .concat([1])
            .map((percent, index) => (
              <stop
                key={index}
                offset={`${100 * percent}%`}
                stopColor={gradientFunc(id, reverse, percent)}
              />
            ))}
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={10} height={10} fill={`url(#${gradientId})`} />
    </svg>
  );
};

/** a few pretty color gradient options */
/** from https://d3js.org/d3-scale-chromatic */
const gradients = [
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

export const gradientFunc = (id: Id, reverse: boolean, value: number) =>
  d3[id](reverse ? 1 - value : value);

/** list of gradient options for select */
export const gradientOptions = (reverse: boolean) =>
  gradients.map((id) => ({
    id,
    primary: id.replace("interpolate", ""),
    icon: <Gradient id={id} reverse={reverse} width="3em" height="1em" />,
  })) satisfies Option[];
