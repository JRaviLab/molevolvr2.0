import { useCallback, useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { isEqual } from "lodash";
import { useEventListener } from "@reactuses/core";
import { darkModeAtom } from "@/components/DarkMode";
import { getTheme, getWidth, truncateWidth, type Theme } from "@/util/dom";
import { getFilename, type Filename } from "@/util/download";
import { sleep } from "@/util/misc";

/** get theme CSS variables */
export const useTheme = () => {
  /** set of theme variable keys and values */
  const [theme, setTheme] = useState<Theme>({});

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
  /** computed styles */
  const [styles, setStyles] = useState<CSSStyleDeclaration>(
    window.getComputedStyle(document.documentElement),
  );

  /** update computed styles */
  const update = useCallback(() => {
    setStyles(window.getComputedStyle(document.documentElement));
  }, []);

  /** when document done loading */
  useEventListener("load", update, window);
  /** when fonts done loading */
  useEventListener("loadingdone", update, document.fonts);

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
export const useChanged = <Value>(value: Value, initial = true) => {
  const prev = useRef<Value | undefined>(undefined);
  const changed = !isEqual(value, prev.current);
  const result = initial ? changed : changed && prev.current !== undefined;
  prev.current = value;
  return result;
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
