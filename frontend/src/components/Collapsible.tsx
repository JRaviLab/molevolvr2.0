import { useId, useState } from "react";
import type { ReactNode } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import clsx from "clsx";
import Tooltip from "@/components/Tooltip";

type Props = {
  /** text to show in expand/collapse button */
  text: string;
  /** tooltip content */
  tooltip?: ReactNode;
  /** panel content */
  children: ReactNode;
};

/** button with expandable/collapsible content beneath */
const Collapsible = ({ text, tooltip, children }: Props) => {
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
          className="text-accent hover:text-deep grid w-full grid-cols-[1fr_max-content_1em_1fr] gap-2 rounded p-2 before:mr-2 before:h-0.5 before:bg-current/25 after:ml-2 after:h-0.5 after:bg-current/25 after:content-['']"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={open ? id : undefined}
        >
          {text}
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
