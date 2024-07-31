import type {
  ComponentProps,
  ForwardedRef,
  ReactElement,
  ReactNode,
} from "react";
import { forwardRef } from "react";
import classNames from "classnames";
import { useForm } from "@/components/Form";
import Link from "@/components/Link";
import Tooltip from "@/components/Tooltip";
import classes from "./Button.module.css";

type Base = {
  /** icon to show next to text */
  icon?: ReactElement;
  /** whether to flip text/icon sides */
  flip?: boolean;
  /** look */
  design?: "normal" | "hollow" | "critical";
  /** class */
  className?: string;
};

type Description =
  /** require text and/or tooltip for accessibility */
  { text: string; tooltip?: ReactNode } | { text?: string; tooltip: ReactNode };

type _Link = Pick<ComponentProps<typeof Link>, "to">;

type _Button = Pick<
  ComponentProps<"button">,
  | "type"
  | "onClick"
  | "onDrag"
  | "onDragEnter"
  | "onDragLeave"
  | "onDragOver"
  | "onDrop"
>;

type Props = Base & Description & (_Link | _Button);

/**
 * looks like a button and either goes somewhere (<a>) or does something
 * (<button>)
 */
const Button = forwardRef(
  (
    {
      text,
      icon,
      flip = false,
      design = "normal",
      className,
      tooltip,
      ...props
    }: Props,
    ref,
  ) => {
    /** contents of main element */
    const children = flip ? (
      <>
        {icon}
        {text}
      </>
    ) : (
      <>
        {icon}
        {text}
      </>
    );

    /** class name string */
    const _class = classNames(className, classes.button, classes[design], {
      [classes.square!]: !text && !!icon,
    });

    /** link to parent form component */
    const form = useForm();

    /** if "to", render as link */
    if ("to" in props)
      return (
        <Link
          ref={ref as ForwardedRef<HTMLAnchorElement>}
          className={_class}
          tooltip={tooltip}
          noIcon
          {...props}
        >
          {children}
        </Link>
      );
    /** otherwise, render as button */ else
      return (
        <Tooltip content={tooltip}>
          <button
            ref={ref as ForwardedRef<HTMLButtonElement>}
            className={_class}
            type="button"
            form={form}
            {...props}
          >
            {children}
          </button>
        </Tooltip>
      );
  },
);

export default Button;
