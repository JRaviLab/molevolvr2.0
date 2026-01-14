import type { ComponentProps } from "react";
import clsx from "clsx";
import Mark from "@/components/Mark";

/** static box of certain type with icon and text contents */
const Alert = ({
  className,
  children,
  ...props
}: ComponentProps<typeof Mark>) => {
  return (
    <Mark
      className={clsx("max-w-full rounded bg-current/10 p-4", className)}
      {...props}
    >
      <p className="text-black">{children}</p>
    </Mark>
  );
};

export default Alert;
