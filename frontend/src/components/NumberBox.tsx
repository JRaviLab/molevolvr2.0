import type { ReactNode } from "react";
import { useRef } from "react";
import {
  Button,
  Group,
  Input,
  Label,
  NumberField,
} from "react-aria-components";
import { Minus, Plus } from "lucide-react";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import { isFirefox } from "@/util/browser";
import { preserveScroll } from "@/util/dom";

type Props = {
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
  value: number;
  /** on number state change */
  onChange: (value: number) => void;
};

/** number input box. use for numeric values that need precise adjustment. */
const NumberBox = ({
  label,
  tooltip,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  /** link to parent form component */
  const form = useForm();

  return (
    <NumberField
      ref={ref}
      className="contents"
      minValue={min}
      maxValue={max}
      step={step}
      value={value}
      onChange={(value) => {
        preserveScroll(ref.current);
        onChange(value);
      }}
      formatOptions={{ maximumFractionDigits: 10 }}
    >
      {({ state }) => (
        <>
          <Label className="flex items-center gap-1">
            {label}
            {tooltip && <Help tooltip={tooltip} />}
          </Label>

          <Group
            className="
              flex justify-between border-b border-current text-accent
              hover:text-deep
            "
          >
            <Button slot="decrement">
              <Minus />
            </Button>
            {/* Poppins unfortunately doesn't support tabular nums */}
            <Input
              className="field-sizing-content px-2 py-1 text-center font-mono"
              form={form}
              onBlurCapture={(event) => {
                /** https://github.com/adobe/react-spectrum/discussions/6261 */
                if (!event.currentTarget.value.trim())
                  state.setInputValue(String(min));
              }}
              style={{
                maxWidth:
                  /** firefox doesn't support field sizing */
                  isFirefox ? state.inputValue.length + 1 + "em" : undefined,
              }}
            />
            <Button slot="increment">
              <Plus />
            </Button>
          </Group>
        </>
      )}
    </NumberField>
  );
};

export default NumberBox;
