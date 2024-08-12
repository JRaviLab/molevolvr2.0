import type { ComponentProps, ReactElement, ReactNode } from "react";
import { useId, useRef, useState } from "react";
import { FaRegCopy, FaXmark } from "react-icons/fa6";
import clsx from "clsx";
import Asterisk from "@/components/Asterisk";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import { toast } from "@/components/Toasts";
import Tooltip from "@/components/Tooltip";
import classes from "./TextBox.module.css";

type Base = {
  /** layout of label and control */
  layout?: "vertical" | "horizontal";
  /** label content */
  label?: ReactNode;
  /** tooltip on help icon */
  tooltip?: ReactNode;
  /** hint icon to show on side */
  icon?: ReactElement;
  /** text state */
  value?: string;
  /** on text state change */
  onChange?: (value: string) => void;
  /** className */
  className?: string;
};

type Single = {
  /** single line */
  multi?: false;
} & Pick<
  ComponentProps<"input">,
  "placeholder" | "type" | "autoComplete" | "name" | "required"
>;

type Multi = {
  /** multi-line */
  multi: true;
} & Pick<
  ComponentProps<"textarea">,
  "placeholder" | "autoComplete" | "name" | "required"
>;

type Props = Base & (Single | Multi);

/** single or multi-line text input box */
const TextBox = ({
  layout = "vertical",
  label,
  tooltip,
  multi,
  icon,
  value,
  onChange,
  className,
  ...props
}: Props) => {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  /** local text state */
  const [text, setText] = useState(value ?? "");

  /** unique id for component instance */
  const id = useId();

  /** side element */
  let sideElement: ReactNode = "";
  if (text || value)
    sideElement = (
      <div className={classes.side}>
        <button
          type="button"
          onClick={async () => {
            await window.navigator.clipboard.writeText(text);
            toast("Copied text", "success");
          }}
          aria-label="Copy text"
        >
          <FaRegCopy />
        </button>
        <button
          type="button"
          onClick={() => {
            if (ref.current) ref.current.value = "";
            onChange?.("");
            setText("");
          }}
          aria-label="Clear text"
        >
          <FaXmark />
        </button>
      </div>
    );
  else if (icon) sideElement = <div className={classes.side}>{icon}</div>;

  /** link to parent form component */
  const form = useForm();

  /** input field */
  const input = multi ? (
    <textarea
      ref={ref}
      id={id}
      className={clsx(classes.textarea, sideElement && classes["input-side"])}
      value={value}
      onChange={(event) => {
        onChange?.(event.target.value);
        setText(event.target.value);
      }}
      form={form}
      {...props}
    />
  ) : (
    <input
      ref={ref}
      id={id}
      className={clsx(classes.input, sideElement && classes["input-side"])}
      value={value}
      onChange={(event) => {
        onChange?.(event.target.value);
        setText(event.target.value);
      }}
      form={form}
      {...props}
    />
  );

  return (
    <div className={clsx(classes.container, classes[layout], className)}>
      {(label || props.required) && (
        <label className={classes.label} htmlFor={id}>
          {label}
          {tooltip && <Help tooltip={tooltip} />}
          {props.required && <Asterisk />}
        </label>
      )}

      {/* if no label but need tooltip, put it around input */}
      <Tooltip content={!label && tooltip ? tooltip : undefined}>
        <div className={classes.wrapper}>
          {input}

          {/* side element */}
          {sideElement}
        </div>
      </Tooltip>
    </div>
  );
};

export default TextBox;
