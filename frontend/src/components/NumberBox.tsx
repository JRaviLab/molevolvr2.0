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
import { isFirefox } from "@/util/browser";
import { preserveScroll } from "@/util/dom";

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
      className={clsx("flex gap-4", {
        "items-center": layout === "horizontal",
        "flex-col items-start": layout === "vertical",
      })}
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
          <Label className="flex items-center gap-1">
            {label}
            {tooltip && <Help tooltip={tooltip} />}
          </Label>

          <Group className="text-accent hover:text-deep flex border-b-2 border-current">
            <Button slot="decrement">
              <FaMinus />
            </Button>
            {/* Poppins unfortunately doesn't support tabular nums */}
            <Input
              className="field-sizing-content grow px-2 py-1 text-center font-mono"
              form={form}
              onBlurCapture={(event) => {
                /** https://github.com/adobe/react-spectrum/discussions/6261 */
                if (!event.currentTarget.value.trim())
                  state.setInputValue(String(min));
              }}
              style={{
                maxWidth: isFirefox
                  ? state.inputValue.length + 1 + "em"
                  : undefined,
              }}
            />
            <Button slot="increment">
              <FaPlus />
            </Button>
          </Group>
        </>
      )}
    </NumberField>
  );
};

export default NumberBox;
