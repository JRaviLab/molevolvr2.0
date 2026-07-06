import type { ComponentProps, ReactNode, Ref } from "react";
import clsx from "clsx";
import { useForm } from "@/components/Form";
import Link from "@/components/Link";
import Tooltip from "@/components/Tooltip";
import { preserveScroll } from "@/util/dom";

type Props = Base & (_Button | _Anchor);

type Base = {
  /** look */
  design?: "hollow" | "plain" | "accent" | "critical";
  /** size */
  size?: "sm" | "md";
  /** tooltip */
  tooltip?: ReactNode;
};

type _Button = ComponentProps<"button">;
type _Anchor = ComponentProps<typeof Link>;

/**
 * looks like a button and either goes somewhere (link) or does something
 * (button)
 */
export default function Button({
  ref,
  design = "plain",
  size = "md",
  className,
  tooltip,
  ...props
}: Props) {
  /** class name string */
  className = clsx(
    "flex items-center justify-center gap-2 rounded-md no-underline",
    size === "sm" && "min-h-6 min-w-6 p-1",
    size === "md" && "min-h-10 min-w-10 p-2",
    design === "hollow" && "text-accent hover:bg-off-white hover:text-deep",
    design === "plain" && "bg-off-white text-black hover:text-accent",
    design === "accent" && "bg-accent text-white hover:bg-deep",
    design === "critical" && "bg-black text-white hover:bg-deep",
    className,
  );

  /** link to parent form component */
  const form = useForm();

  /** if "to", render as link */
  if ("to" in props)
    return (
      <Link
        ref={ref as Ref<HTMLAnchorElement>}
        className={className}
        tooltip={tooltip}
        showArrow={false}
        {...props}
      />
    );
  else {
    /** otherwise, render as button */
    const { type = "button", onClick, ...rest } = props;
    return (
      <Tooltip content={tooltip}>
        <button
          ref={ref as Ref<HTMLButtonElement>}
          className={className}
          form={form}
          type={type}
          onClick={(event) => {
            /** prevent click action when disabled */
            if (!rest["aria-disabled"]) onClick?.(event);
            preserveScroll(event.currentTarget);
          }}
          {...rest}
        />
      </Tooltip>
    );
  }
}
