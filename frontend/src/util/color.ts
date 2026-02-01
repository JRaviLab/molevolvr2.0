import { useState } from "react";
import { useDeepCompareEffect } from "@reactuses/core";
import { lch } from "d3";
import { useAtomValue } from "jotai";
import { darkModeAtom } from "@/components/DarkMode";
import { getEntries } from "@/util/types";
import colors from "./colors.json";

/**
 * https://tailwindcss.com/docs/customizing-colors
 * https://github.com/tailwindlabs/tailwindcss.com/blob/main/src/components/color.tsx
 */

/** neutral hue */
const neutral = "slate";

/** stagger hues to provide more contrast/distinction between successive colors */
export const hues = [
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
  "yellow",
] as const;

export type Hue = (typeof hues)[number];

type Shade = "light" | "dark";

/** get neutral color from shade */
const getNeutral = (shade: Shade) => {
  if (shade === "dark") return colors[neutral]["800"];
  else return colors[neutral]["200"];
};

/** get (colorful) color from hue and shade */
const getColor = (hue: Hue, shade: Shade) => {
  if (shade === "dark") return desaturate(colors[hue]["800"]);
  else return desaturate(colors[hue]["200"]);
};

/** pleasantly desaturate color */
const desaturate = (color: string) => {
  const _color = lch(color);
  _color.c = 20;
  return _color.formatHex();
};

/** map enumerated values to colors */
const getColorMap = <Value extends string>(
  values: Value[],
  shade: Shade = "light",
  /** allow some/all color mappings to be manually defined */
  manual: Partial<Record<Value, Hue>> = {},
) => {
  /** track current hue */
  let hueIndex = 0;

  /** start color map to be returned */
  const map = {
    /** make blank value neutral color */
    "": getNeutral(shade),
  } as Record<Value | "", string>;

  /** add manual colors to map */
  for (const [value, hue] of getEntries(manual)) {
    /** if already defined, skip */
    if (map[value]) continue;
    /** add color to map */
    map[value] = getColor(hue, shade);
    /** so any following mapping continues from current place */
    hueIndex = hues.indexOf(hue);
  }

  /** auto-map rest of values */
  for (const value of values) {
    /** if blank value, skip */
    if (!value.trim()) continue;
    /** if already defined, skip */
    if (map[value]) continue;
    /** add color to map */
    const hue = hues[hueIndex]!;
    map[value] = getColor(hue, shade);
    /** move to next color in line */
    hueIndex++;
    /** loop back to start of list if needed */
    hueIndex %= hues.length;
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
