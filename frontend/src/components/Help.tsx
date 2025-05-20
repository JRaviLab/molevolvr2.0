import type { ReactNode } from "react";
import { FaRegCircleQuestion } from "react-icons/fa6";
import Tooltip from "@/components/Tooltip";
import { sleep } from "@/util/misc";
import classes from "./Help.module.css";

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
      type="button"
      className={classes.help}
      onClick={async (event) => {
        const target = event.currentTarget;
        /** force open tooltip */
        await sleep();
        target.blur();
        target.focus();
      }}
    >
      {children}
      <FaRegCircleQuestion />
    </button>
  </Tooltip>
);

export default Help;
