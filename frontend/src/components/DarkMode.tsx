import type { ComponentProps } from "react";
import { getDefaultStore, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Moon, Sun } from "lucide-react";
import Tooltip from "@/components/Tooltip";

/** dark mode state */
export const darkModeAtom = atomWithStorage("darkMode", false);

/** update root element data attribute that switches css color vars */
const update = () => {
  if (getDefaultStore().get(darkModeAtom))
    document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
};
update();

/** when dark mode state changes */
getDefaultStore().sub(darkModeAtom, update);
/** using useEffect in toggle component causes FOUC b/c have to wait for render */

type Props = ComponentProps<"button">;

/** dark mode toggle */
export const DarkMode = ({ className }: Props) => {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);

  return (
    <Tooltip content={`Switch to ${darkMode ? "light" : "dark"} mode`}>
      <button
        className={className}
        onClick={() => setDarkMode(!darkMode)}
        role="switch"
        aria-checked={darkMode}
      >
        {darkMode ? <Sun /> : <Moon />}
      </button>
    </Tooltip>
  );
};
