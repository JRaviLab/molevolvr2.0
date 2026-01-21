import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  /** class on badge */
  className?: string;
  /** few chars of text or small icon */
  children: ReactNode;
};

/**
 * small circle with a few chars of text. for use in other components, not
 * directly.
 */
const Badge = ({ className, children }: Props) => (
  <span
    className={clsx(
      "bg-pale text-deep grid size-[1.5em] place-items-center rounded-full text-[1rem] font-bold",
      className,
    )}
    aria-hidden="true"
  >
    {children}
  </span>
);

export default Badge;
