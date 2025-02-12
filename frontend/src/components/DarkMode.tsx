import { FaRegMoon, FaRegSun } from "react-icons/fa6";
import { getDefaultStore, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import Tooltip from "@/components/Tooltip";

/** dark mode state */
export const darkModeAtom = atomWithStorage("darkMode", false);

/** update root element data attribute that switches css color vars */
const update = () => {
  const darkMode = getDefaultStore().get(darkModeAtom);
  document.documentElement.setAttribute("data-dark", String(darkMode));
};
update();

/** when dark mode state changes */
getDefaultStore().sub(darkModeAtom, update);
/** using useEffect in toggle component causes FOUC b/c have to wait for render */

/** dark mode toggle */
export const DarkMode = () => {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);

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
