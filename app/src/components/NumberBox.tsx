import { useId } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import * as numberInput from "@zag-js/number-input";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useForm } from "@/components/Form";
import type { LabelProps } from "@/components/Label";
import Label, { forwardLabelProps } from "@/components/Label";
import classes from "./NumberBox.module.css";

type Base = {
  /** min value */
  min?: number;
  /** max value */
  max?: number;
  /** inc/dec interval */
  step?: number;
  /** number state */
  value?: number;
  /** on number state change */
  onChange?: (value: number) => void;
  /** field name */
  name?: string;
};

type Props = Base & LabelProps;

/** number input box. use for numeric values that need precise adjustment. */
const NumberBox = ({
  min,
  max,
  step,
  value,
  onChange,
  name,
  ...props
}: Props) => {
  /** set up zag */
  const [state, send] = useMachine(
    numberInput.machine({
      /** unique id for component instance */
      id: useId(),
      /** link field and form */
      name,
      form: useForm(),
      /** settings */
      allowMouseWheel: true,
      /** regular number box props */
      min: min ?? 0,
      max: max ?? 100,
      step: step ?? 1,
      /** initialize value state */
      value: String(value || 0),
      /** when value changes */
      onValueChange: (details) => onChange?.(details.valueAsNumber),
    }),
  );

  /** interact with zag */
  const api = numberInput.connect(state, send, normalizeProps);

  return (
    <Label {...api.labelProps} {...forwardLabelProps(props, api.inputProps.id)}>
      <div className={classes.container}>
        {/* ↑ */}
        <button {...api.incrementTriggerProps} className={classes.inc}>
          <FaAngleUp />
        </button>

        {/* input */}
        <input {...api.inputProps} className={classes.input} />

        {/* ↓ */}
        <button {...api.decrementTriggerProps} className={classes.dec}>
          <FaAngleDown />
        </button>
      </div>
    </Label>
  );
};

export default NumberBox;
