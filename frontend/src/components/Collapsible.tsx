import { useId, useState } from "react";
import type { ReactNode } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import clsx from "clsx";
import Tooltip from "@/components/Tooltip";

type Props = {
  /** content to show in expand/collapse button */
  title: ReactNode;
  /** tooltip content */
  tooltip?: ReactNode;
  /** panel content */
  children: ReactNode;
};

/** button with expandable/collapsible content beneath */
const Collapsible = ({ title, tooltip, children }: Props) => {
  /** unique id for component instance */
  const id = useId();

  /** open state */
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* trigger */}
      <Tooltip content={tooltip}>
        <button
          type="button"
          className="
            flex items-center gap-2 rounded-md border border-dashed
            border-light-gray p-2 text-accent
            hover:text-deep
          "
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={open ? id : undefined}
        >
          {title}
          {open ? <LuChevronUp /> : <LuChevronDown />}
        </button>
      </Tooltip>

      {/* content */}
      <div id={id} className={clsx("contents", !open && "hidden")}>
        {children}
      </div>
    </>
  );
};

export default Collapsible;
