import type { ReactNode } from "react";
import * as RAC from "react-aria-components";
import { FaMinus, FaPlus } from "react-icons/fa6";
import classNames from "classnames";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import classes from "./NumberBox.module.css";

type Props = {
  /** layout of label and control */
  layout?: "vertical" | "horizontal";
  /** label content */
  label: ReactNode;
  /** tooltip on help icon */
  tooltip?: ReactNode;
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
  /** field name in form data */
  name?: string;
};

/** number input box. use for numeric values that need precise adjustment. */
const NumberBox = ({
  layout = "vertical",
  label,
  tooltip,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  name,
}: Props) => {
  /** link to parent form component */
  const form = useForm();

  return (
    <RAC.NumberField
      className={classNames(classes.container, classes[layout])}
      minValue={min}
      maxValue={max}
      step={step}
      defaultValue={value ?? min}
      value={value}
      onChange={onChange}
      name={name}
    >
      {({ state }) => (
        <>
          <RAC.Label className={classes.label}>
            {label}
            {tooltip && <Help tooltip={tooltip} />}
          </RAC.Label>

          <RAC.Group className={classes.group}>
            <RAC.Button slot="decrement" className={classes.button}>
              <FaMinus />
            </RAC.Button>
            <RAC.Input
              className={classes.input}
              form={form}
              style={{
                width: state.inputValue.length + 0.1 + "ex",
              }}
              onBlurCapture={(event) => {
                /** https://github.com/adobe/react-spectrum/discussions/6261 */
                if (!event.currentTarget.value.trim())
                  state.setInputValue(String(min));
              }}
            />
            <RAC.Button slot="increment" className={classes.button}>
              <FaPlus />
            </RAC.Button>
          </RAC.Group>
        </>
      )}
    </RAC.NumberField>
  );
};

export default NumberBox;
