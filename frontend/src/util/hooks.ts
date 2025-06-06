import { useCallback, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { useEventListener } from "@reactuses/core";
import { darkModeAtom } from "@/components/DarkMode";
import { getTheme, getWidth, truncateWidth } from "@/util/dom";

/** get theme CSS variables */
export const useTheme = () => {
  /** set of theme variable keys and values */
  const [theme, setTheme] = useState<Record<`--${string}`, string>>({});

  /** dark mode state */
  const darkMode = useAtomValue(darkModeAtom);

  /** update theme vars */
  const update = useCallback(() => setTheme(getTheme()), []);

  /** update theme variables when dark mode changes */
  useEffect(() => {
    update();
  }, [update, darkMode]);

  /** when document done loading */
  useEventListener("load", update, window);
  /** when fonts done loading */
  useEventListener("loadingdone", update, document.fonts);

  return theme;
};

/** reactive text size and funcs, re-calced on theme change (including font load) */
export const useTextSize = () => {
  const theme = useTheme();

  const fontSize = parseFloat(theme["--font-size"]!) || 16;
  const fontFamily = theme["--sans"]!;

  return {
    fontSize,
    getWidth: useCallback(
      (text: string) => getWidth(text, fontSize, fontFamily),
      [fontSize, fontFamily],
    ),
    truncateWidth: useCallback(
      (text: string, width: number) =>
        truncateWidth(text, width, fontSize, fontFamily),
      [fontSize, fontFamily],
    ),
  };
};
