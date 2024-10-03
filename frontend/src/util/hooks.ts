import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { darkModeAtom } from "@/components/DarkMode";

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
  const [getDarkMode] = useAtom(darkModeAtom);

  /** update theme variables when anything that could affect them changes */
  useEffect(() => {
    setTheme(getTheme());
  }, [getDarkMode]);

  return theme;
};
