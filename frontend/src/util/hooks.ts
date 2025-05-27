import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useAtomValue } from "jotai";
import {
  useDebounceFn,
  useMutationObserver,
  useResizeObserver,
} from "@reactuses/core";
import { darkModeAtom } from "@/components/DarkMode";
import { getSvgTransform } from "@/util/dom";

/** get document root font size */
export const rootFontSize = () =>
  parseFloat(window.getComputedStyle(document.body).fontSize);

/** https://stackoverflow.com/a/78994961/2180570 */
export const getTheme = () => {
  const rootStyles = window.getComputedStyle(document.documentElement);
  return Object.fromEntries(
    Array.from(document.styleSheets)
      .flatMap((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules);
        } catch (error) {
          return [];
        }
      })
      .filter((cssRule) => cssRule instanceof CSSStyleRule)
      .flatMap((cssRule) => Array.from(cssRule.style))
      .filter((style) => style.startsWith("--"))
      .map((variable) => [variable, rootStyles.getPropertyValue(variable)]),
  );
};

/** get theme css variables */
export const useTheme = () => {
  /** set of theme variable keys and values */
  const [theme, setTheme] = useState<Record<`--${string}`, string>>({});

  /** dark mode state */
  const darkMode = useAtomValue(darkModeAtom);

  /** update theme variables when dark mode changes */
  useEffect(() => {
    setTheme(getTheme());
  }, [darkMode]);

  return theme;
};

/** get scale factor to convert document units to svg units */
export const useSvgTransform = (svg: SVGSVGElement | null) => {
  const [scale, setScale] = useState({ w: 1, h: 1 });

  const update = useCallback(() => {
    if (!svg) return;

    /**
     * higher iterations = faster convergence between this func and fitViewBox,
     * but longer dom blocking (freeze)
     */
    for (let iteration = 1; iteration > 0; iteration--) {
      /** render immediately, i.e. elements sized based on this func */
      flushSync(() => {
        /** https://www.w3.org/TR/css-transforms-1/#decomposing-a-2d-matrix */
        setScale(getSvgTransform(svg));
      });
    }
  }, [svg]);

  const { run } = useDebounceFn(update, 0);

  /**
   * check if view box value has actually changed
   * https://github.com/whatwg/dom/issues/520
   */
  const onViewBoxChange = useCallback<MutationCallback>(
    (mutations) => {
      if (
        mutations.some(
          ({ oldValue, attributeName, target }) =>
            attributeName === "viewBox" &&
            target instanceof HTMLElement &&
            oldValue !== target.getAttribute("viewBox"),
        )
      )
        run();
    },
    [run],
  );

  /** events that would affect transform */
  useResizeObserver(svg, run);
  useMutationObserver(onViewBoxChange, svg, {
    attributes: true,
    attributeFilter: ["viewBox"],
    attributeOldValue: true,
  });

  return scale;
};
