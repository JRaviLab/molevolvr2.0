import type { ReactNode } from "react";
import { useId, useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import Tooltip from "@/components/Tooltip";
import classes from "./Collapsible.module.css";

type Props = {
  /** text to show in expand/collapse button */
  text: string;
  /** tooltip content */
  tooltip?: ReactNode;
  /** class on content panel */
  className?: string;
  /** panel content */
  children: ReactNode;
};

/** button with expandable/collapsible content beneath */
const Collapsible = ({ text, tooltip, className, children }: Props) => {
  /** unique id for component instance */
  const id = useId();

  /** track open state */
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* trigger */}
      <Tooltip content={tooltip}>
        <button
          type="button"
          className={classes.button}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={open ? id : undefined}
        >
          {text}
          {open ? <FaAngleUp /> : <FaAngleDown />}
        </button>
      </Tooltip>

      {/* content */}
      <div
        id={id}
        className={className}
        style={{ display: open ? "" : "none" }}
      >
        {children}
      </div>
    </>
  );
};

export default Collapsible;
