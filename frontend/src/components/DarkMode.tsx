import { useEffect } from "react";
import { FaRegMoon, FaRegSun } from "react-icons/fa6";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import Tooltip from "@/components/Tooltip";

/** dark mode state */
export const darkModeAtom = atomWithStorage("darkMode", false);

/** dark mode toggle */
export const DarkMode = () => {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);

  /** update root element data attribute that switches css color vars */
  useEffect(() => {
    document.documentElement.setAttribute("data-dark", String(darkMode));
  });

  return (
    <Tooltip content={`Switch to ${darkMode ? "light" : "dark"} mode`}>
      <button
        type="button"
        role="switch"
        aria-checked={darkMode}
        style={{ color: "currentColor" }}
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? <FaRegSun /> : <FaRegMoon />}
      </button>
    </Tooltip>
  );
};
