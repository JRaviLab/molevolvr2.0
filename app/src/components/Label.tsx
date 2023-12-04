import type {
  ComponentProps,
  CSSProperties,
  ReactElement,
  ReactNode,
} from "react";
import { cloneElement, Fragment } from "react";
import { FaAsterisk } from "react-icons/fa6";
import { pick } from "lodash";
import Help from "@/components/Help";
import Tooltip from "@/components/Tooltip";
import classes from "./Label.module.css";

type Props = {
  /** label content */
  label?: ReactNode;
  /** whether to put label above, to left, or have no wrapping element at all */
  layout?: "horizontal" | "vertical" | "none";
  /** tooltip content */
  tooltip?: ReactNode;
  /** required field */
  required?: boolean;
  /**
   * width of containing layout element if layout = vertical or of associated
   * input element if layout horizontal
   */
  width?: CSSProperties["width"];
  /** input/control to be associated with label */
  children: ReactElement;
} & Pick<ComponentProps<"label">, "htmlFor">;

const labelProps = ["label", "layout", "tooltip", "required", "width"] as const;

export type LabelProps = Pick<Props, (typeof labelProps)[number]>;

/** forward specific props to label component */
export const forwardLabelProps = (
  props: Record<PropertyKey, unknown>,
  htmlFor: string | undefined,
) => ({ ...pick<LabelProps>(props, labelProps), htmlFor });

/**
 * adds layout, label, help, etc. to input component. for use in other
 * components, not directly.
 */
const Label = ({
  label,
  layout = "vertical",
  tooltip,
  required,
  width = 150,
  children,
  ...props
}: Props) => {
  /** if no label but need to show tooltip, put tooltip around children instead */
  if (!label && tooltip)
    children = <Tooltip content={tooltip}>{children}</Tooltip>;

  /** no container if layout none */
  const Container = layout === "none" ? Fragment : "div";
  const containerProps: { className?: string; style?: CSSProperties } =
    layout === "none" ? {} : { className: classes[layout] };

  /** apply width to appropriate element */
  if (layout === "vertical") containerProps.style = { width };
  if (layout === "horizontal")
    children = cloneElement(children, {
      style: { ...children.props.style, width },
    });

  return (
    <Container {...containerProps}>
      {label && (
        <label {...props} className={classes.label}>
          {/* label */}
          {label}

          {/* required icon */}
          {required && <FaAsterisk className={classes.required} />}

          {/* help icon */}
          {tooltip && <Help tooltip={tooltip} className={classes.help} />}
        </label>
      )}

      {children}
    </Container>
  );
};

export default Label;
