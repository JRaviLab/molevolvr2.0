import { useCallback, useEffect, useState, type RefObject } from "react";
import { useAtomValue } from "jotai";
import {
  useDebounceFn,
  useMutationObserver,
  useResizeObserver,
} from "@reactuses/core";
import { darkModeAtom } from "@/components/DarkMode";

/** document root font size */
export const rootFontSize = parseFloat(
  window.getComputedStyle(document.body).fontSize,
);

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

/** convert width/height in document units to svg units */
export const useSvgTransform = (
  svg: RefObject<SVGSVGElement | null>,
  w: number,
  h: number,
) => {
  const [scale, setScale] = useState({ w: 1, h: 1 });

  const update = useCallback(() => {
    if (!svg.current) return;

    /** convert to svg coords */
    const matrix = (svg.current.getScreenCTM() || new SVGMatrix()).inverse();
    /** https://www.w3.org/TR/css-transforms-1/#decomposing-a-2d-matrix */
    setScale({
      w: Math.sqrt(matrix.a ** 2 + matrix.b ** 2),
      h: Math.sqrt(matrix.c ** 2 + matrix.d ** 2),
    });
  }, [svg]);

  const { run } = useDebounceFn(update, 100);

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

  return { w: w * scale.w, h: h * scale.h };
};
