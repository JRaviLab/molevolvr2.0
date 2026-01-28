import type { ReactNode } from "react";
import { CircleHelp } from "lucide-react";
import Tooltip from "@/components/Tooltip";
import { sleep } from "@/util/misc";

type Props = {
  /** tooltip content */
  tooltip: ReactNode;
  /** content next to icon */
  children?: ReactNode;
};

/**
 * ? button to hover/click for help tooltip. for use in other components, not
 * directly.
 */
const Help = ({ tooltip, children }: Props) => (
  <Tooltip content={tooltip}>
    <button
      className="cursor-help text-dark-gray"
      onClick={async (event) => {
        const target = event.currentTarget;
        /** force open tooltip */
        await sleep();
        target.blur();
        target.focus();
      }}
    >
      {children}
      <CircleHelp />
    </button>
  </Tooltip>
);

export default Help;
