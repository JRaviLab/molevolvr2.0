import type { ComponentProps, ReactElement, ReactNode, Ref } from "react";
import clsx from "clsx";
import { useForm } from "@/components/Form";
import Link from "@/components/Link";
import Tooltip from "@/components/Tooltip";

type Props = Base & Description & (_Link | _Button);

type Base = {
  /** icon to show next to text */
  icon?: ReactElement;
  /** whether to flip text/icon sides */
  flip?: boolean;
  /** look */
  design?: "normal" | "hollow" | "critical";
  /** sizing */
  size?: "compact" | "normal";
  /** class on button */
  className?: string;
};

type Description =
  /** require text and/or tooltip for accessibility */
  { text: string; tooltip?: ReactNode } | { text?: string; tooltip: ReactNode };

type _Link = { ref?: Ref<HTMLAnchorElement> } & Pick<
  ComponentProps<typeof Link>,
  "to" | "style"
>;

type _Button = { ref?: Ref<HTMLButtonElement> } & Pick<
  ComponentProps<"button">,
  | "type"
  | "style"
  | "onClick"
  | "onDrag"
  | "onDragEnter"
  | "onDragLeave"
  | "onDragOver"
  | "onDrop"
>;

/**
 * looks like a button and either goes somewhere (link) or does something
 * (button)
 */
const Button = ({
  ref,
  text,
  icon,
  flip = false,
  design = "normal",
  size = "normal",
  className,
  tooltip,
  ...props
}: Props) => {
  /** contents of main element */
  const children = flip ? (
    <>
      {icon}
      {text}
    </>
  ) : (
    <>
      {text}
      {icon}
    </>
  );

  /** class name string */
  const _class = clsx(
    "gap-2",
    size === "compact" ? "p-1" : "p-3",
    !!icon && !text ? "rounded-full" : "rounded-sm",
    design === "hollow" &&
      `
        text-accent
        hover:text-deep
      `,
    design === "normal" &&
      `
        bg-accent text-white outline-accent
        hover:bg-deep
      `,
    design === "critical" &&
      `
        bg-black text-white outline-black
        hover:bg-deep
      `,
    className,
  );

  /** link to parent form component */
  const form = useForm();

  /** if "to", render as link */
  if ("to" in props)
    return (
      <Link
        ref={ref as Ref<HTMLAnchorElement>}
        className={_class}
        tooltip={tooltip}
        showArrow={false}
        {...props}
      >
        {children}
      </Link>
    );
  /** otherwise, render as button */ else
    return (
      <Tooltip content={tooltip}>
        <button
          ref={ref as Ref<HTMLButtonElement>}
          className={_class}
          type="button"
          form={form}
          {...props}
        >
          {children}
        </button>
      </Tooltip>
    );
};

export default Button;
