import type { ComponentProps, ReactElement, ReactNode } from "react";
import { useId, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import type { LabelProps } from "@/components/Label";
import Label, { forwardLabelProps } from "@/components/Label";
import classes from "./TextBox.module.css";

type Base = {
  /** hint icon to show on side */
  icon?: ReactElement;
  /** text state */
  value?: string;
  /** on text state change */
  onChange?: (value: string) => void;
};

type Single = {
  /** single line */
  multi?: false;
};

type Multi = {
  /** multi-line */
  multi: true;
};

type Input = Omit<ComponentProps<"input">, "value" | "onChange">;

type Textarea = Omit<ComponentProps<"textarea">, "value" | "onChange">;

type Props = Base & LabelProps & ((Single & Input) | (Multi & Textarea));

/** single or multi-line text input box */
const TextBox = ({ multi, icon, value, onChange, ...props }: Props) => {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  /** track whether input is blank */
  const [blank, setBlank] = useState(!value?.trim());

  /** unique id for component instance */
  const id = useId();

  /** side element */
  let sideElement: ReactNode = "";

  if (!blank || value)
    sideElement = (
      <button
        type="button"
        className={classes.side}
        onClick={() => {
          if (ref.current) ref.current.value = "";
          onChange?.("");
          setBlank(true);
        }}
        aria-label="Clear text"
      >
        <FaXmark />
      </button>
    );
  else if (icon) sideElement = <div className={classes.side}>{icon}</div>;

  /** input field */
  const input = multi ? (
    <textarea
      ref={ref}
      id={id}
      className={classes.textarea}
      value={value}
      onChange={(event) => {
        onChange?.(event.target.value);
        setBlank(!event.target.value);
      }}
      {...(props as Textarea)}
    />
  ) : (
    <input
      ref={ref}
      id={id}
      className={classes.input}
      value={value}
      data-side={sideElement ? "" : undefined}
      onChange={(event) => {
        onChange?.(event.target.value);
        setBlank(!event.target.value);
      }}
      {...(props as Input)}
    />
  );

  return (
    <Label width="100%" {...forwardLabelProps(props, id)}>
      <div className={classes.container}>
        {input}

        {/* side element */}
        {sideElement}
      </div>
    </Label>
  );
};

export default TextBox;
