import type { ReactNode } from "react";
import { useState } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { clsx } from "clsx";
import Tooltip from "@/components/Tooltip";

type Props = {
  /** content to show in expand/collapse button */
  title: ReactNode;
  /** tooltip content */
  tooltip?: ReactNode;
  /** class on button */
  className?: string;
  /** panel content */
  children: ReactNode;
};

/** button with expandable/collapsible content beneath */
const Collapsible = ({ title, tooltip, className, children }: Props) => {
  /** open state */
  const [open, setOpen] = useState(false);

  return (
    <details
      className="contents"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      {/* trigger */}
      <Tooltip content={tooltip}>
        <summary
          className={clsx(
            `
              flex items-center gap-2 rounded-md border border-dashed
              border-current p-2 text-accent
              hover:text-deep
            `,
            className,
          )}
        >
          {title}
          {open ? <LuChevronUp /> : <LuChevronDown />}
        </summary>
      </Tooltip>

      {/* content */}
      {children}
    </details>
  );
};

export default Collapsible;
