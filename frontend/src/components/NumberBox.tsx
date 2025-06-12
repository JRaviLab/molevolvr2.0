import { useRef } from "react";
import type { ReactNode } from "react";
import {
  Button,
  Group,
  Input,
  Label,
  NumberField,
} from "react-aria-components";
import { FaMinus, FaPlus } from "react-icons/fa6";
import clsx from "clsx";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import { preserveScroll } from "@/util/dom";
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
  /** initial state */
  defaultValue?: number;
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
  defaultValue,
  value,
  onChange,
  name,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  /** link to parent form component */
  const form = useForm();

  return (
    <NumberField
      ref={ref}
      className={clsx(classes.container, classes[layout])}
      minValue={min}
      maxValue={max}
      step={step}
      defaultValue={defaultValue ?? min}
      value={value}
      onChange={(value) => {
        if (ref.current) preserveScroll(ref.current);
        onChange?.(value);
      }}
      name={name}
      formatOptions={{ maximumFractionDigits: 10 }}
    >
      {({ state }) => (
        <>
          <Label className={classes.label}>
            {label}
            {tooltip && <Help tooltip={tooltip} />}
          </Label>

          <Group className={classes.group}>
            <Button slot="decrement" className={classes.button}>
              <FaMinus />
            </Button>
            <Input
              className={classes.input}
              form={form}
              onBlurCapture={(event) => {
                /** https://github.com/adobe/react-spectrum/discussions/6261 */
                if (!event.currentTarget.value.trim())
                  state.setInputValue(String(min));
              }}
              style={{ minWidth: 10 * (value?.toString()?.length ?? 5) + "px" }}
            />
            <Button slot="increment" className={classes.button}>
              <FaPlus />
            </Button>
          </Group>
        </>
      )}
    </NumberField>
  );
};

export default NumberBox;
