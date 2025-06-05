import { useCallback, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { useEventListener } from "@reactuses/core";
import { darkModeAtom } from "@/components/DarkMode";
import { getTheme, truncateWidth } from "@/util/dom";

/** get theme css variables */
export const useTheme = () => {
  /** set of theme variable keys and values */
  const [theme, setTheme] = useState<Record<`--${string}`, string>>({});

  /** dark mode state */
  const darkMode = useAtomValue(darkModeAtom);

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

/** trigger component rerender by event listener */
export const useEventRerender = (
  target: Parameters<typeof useEventListener>[2],
  event: Parameters<typeof useEventListener>[0],
) => {
  const [count, setCount] = useState(0);
  useEventListener(event, () => setCount(count + 1), target);
  return count;
};

/** re-calc truncateWidth on font load */
export const useTruncateWidth = () => {
  const count = useEventRerender(window.document.fonts, "loadingdone");
  return useCallback(truncateWidth, [count]);
};
