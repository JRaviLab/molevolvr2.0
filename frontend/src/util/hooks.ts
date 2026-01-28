import type { Filename } from "@/util/download";
import { useCallback, useState } from "react";
import { useEventListener } from "@reactuses/core";
import { useAtomValue } from "jotai";
import { isEqual } from "lodash";
import { darkModeAtom } from "@/components/DarkMode";
import { getStyles, getTheme, getWidth, truncateWidth } from "@/util/dom";
import { getFilename } from "@/util/download";
import { sleep } from "@/util/misc";

/** trigger update when anything that could affect theme or styles changes */
const useCssChange = (update: () => void) => {
  /** update theme variables when dark mode changes */
  if (useChanged(useAtomValue(darkModeAtom))) update();
  /** when document done loading */
  useEventListener("load", update, window);
  /** when fonts done loading */
  useEventListener("loadingdone", update, document.fonts);
};

/** reactive theme variables */
export const useTheme = () => {
  const [theme, setTheme] = useState(getTheme);
  useCssChange(useCallback(() => setTheme(getTheme()), []));
  return theme;
};

/** reactive styles */
export const useStyles = () => {
  const [styles, setStyles] = useState(getStyles);
  useCssChange(useCallback(() => setStyles(getStyles()), []));
  return styles;
};

/** reactive text size and funcs */
export const useTextSize = () => {
  const styles = useStyles();

  const fontSize = parseFloat(styles.fontSize) || 16;
  const fontFamily = styles.fontFamily || "sans-serif";

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

/** check if value changed from previous render */
export const useChanged = <Value>(value: Value) => {
  const [prev, setPrev] = useState<Value>();
  const changed = !isEqual(prev, value);
  if (changed) setPrev(value);
  return changed;
};

/** app entrypoint element */
const appElement = document.getElementById("app")!;

/** print state and action hook */
export const usePrint = (filename: Filename) => {
  /** printing state */
  const [printing, setPrinting] = useState(false);

  const print = useCallback(async () => {
    /** save scroll */
    const scrollY = window.scrollY;
    /** save title */
    const title = document.title;
    /** set title to suggest pdf filename */
    document.title = getFilename(filename);
    /** turn on printing mode */
    setPrinting(true);
    /** hide rest of app */
    appElement.style.display = "none";
    /** wait for re-render and paint */
    await sleep(100);
    /** open print dialog */
    window.print();
    /** turn off printing mode */
    setPrinting(false);
    /** restore title */
    document.title = title;
    /** re-show rest of app */
    appElement.style.display = "";
    /** wait for re-render and paint */
    await sleep(100);
    /** restore scroll */
    window.scrollTo(0, scrollY);
  }, [filename]);

  return { printing, print };
};
