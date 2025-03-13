import { useState } from "react";
import { color, interpolateHsl } from "d3";
import { useAtomValue } from "jotai";
import { useDeepCompareEffect } from "@reactuses/core";
import { darkModeAtom } from "@/components/DarkMode";
import { getEntries } from "@/util/types";
import colors from "./colors.json";

/**
 * https://tailwindcss.com/docs/customizing-colors
 * https://github.com/tailwindlabs/tailwindcss.com/blob/5a77fe695f8558de7e59b08881ee9f2405a81736/src/components/color.tsx
 */

/** stagger hues to provide more contrast/distinction between successive colors */
export const hues = [
  "neutral",
  "teal",
  "purple",
  "orange",
  "blue",
  "rose",
  "green",
  "amber",
  "sky",
  "violet",
  "pink",
  "lime",
  "cyan",
  "fuchsia",
  "red",
  "emerald",
  "indigo",
] as const;

type HueOrGray = (typeof hues)[number];
export type Hue = Exclude<HueOrGray, "neutral">;

type Shade = "light" | "dark";

/** get color from hue and shade */
const getColor = (hue: HueOrGray, shade: Shade) => {
  if (shade === "dark") return blend(colors[hue]["900"], "#808080", 0.65);
  else return blend(colors[hue]["100"], "#808080", 0.25);
};

/** blend two colors together in hsl space */
const blend = (a: string, b: string, t = 0.5) =>
  color(interpolateHsl(a, b)(t))?.formatHex() ?? a;

/** map enumerated values to colors */
export const getColorMap = <Value extends string>(
  values: Value[],
  shade: Shade = "light",
  /** allow some/all color mappings to be manually defined */
  manual: Partial<Record<Value, Hue>> = {},
) => {
  /** get first (neutral) hue and remaining (colorful) hues */
  const [neutral, ...colorful] = hues;

  /** track current hue */
  let hueIndex = 0;

  /** start color map to be returned */
  const map = {
    /** make blank value a neutral color */
    "": getColor(neutral, shade),
  } as Record<Value | "", string>;

  /** add manual colors to map */
  for (const [value, hue] of getEntries(manual)) {
    /** if already defined, skip */
    if (map[value]) continue;
    /** add color to map */
    map[value] = getColor(hue, shade);
    /** so any following mapping continues from current place */
    hueIndex = colorful.indexOf(hue);
  }

  /** auto-map rest of values */
  for (const value of values) {
    /** if blank value, skip */
    if (!value.trim()) continue;
    /** if already defined, skip */
    if (map[value]) continue;
    /** add color to map */
    const hue = colorful[hueIndex]!;
    map[value] = getColor(hue, shade);
    /** move to next color in line */
    hueIndex++;
    /** loop back to start of list if needed */
    hueIndex %= colorful.length;
  }

  return map;
};

type ReactiveShade = Shade | "mode" | "invert";

/** reactive color map */
export const useColorMap = <Value extends string>(
  values: Value[],
  shade: ReactiveShade = "mode",
  /** allow some/all color mappings to be manually defined */
  manual: Partial<Record<Value, Hue>> = {},
) => {
  /** dark mode state */
  const darkMode = useAtomValue(darkModeAtom);

  /** should use dark or light */
  if (shade === "mode") shade = darkMode ? "dark" : "light";
  else if (shade === "invert") shade = darkMode ? "light" : "dark";

  /** map state */
  const [map, setMap] = useState(() => getColorMap(values, shade, manual));

  /** update map */
  useDeepCompareEffect(() => {
    setMap(getColorMap(values, shade, manual));
  }, [values, shade]);

  return map;
};
