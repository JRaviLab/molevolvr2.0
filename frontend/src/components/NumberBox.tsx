import type { ReactNode } from "react";
import { useRef } from "react";
import {
  Button,
  Group,
  Input,
  Label,
  NumberField,
} from "react-aria-components";
import { clsx } from "clsx";
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
  /** class on root */
  className?: string;
};

/** number input box. use for numeric values that need precise adjustment. */
export default function NumberBox({
  label,
  tooltip,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  /** link to parent form component */
  const form = useForm();

  return (
    <NumberField
      ref={ref}
      className={clsx("flex gap-2", className)}
      minValue={min}
      maxValue={max}
      step={step}
      commitBehavior="validate"
      value={value}
      onChange={(value) => {
        preserveScroll(ref.current);
        onChange(value);
      }}
      formatOptions={{ maximumFractionDigits: 10 }}
    >
      {({ state }) => (
        <>
          <Label className="flex items-center gap-2">
            {label}
            {tooltip && <Help tooltip={tooltip} />}
          </Label>

          <Group className="flex min-h-10 grow resize items-center justify-between rounded-md border border-gray bg-white transition hover:border-accent">
            <Button slot="decrement" className="size-6 hover:text-accent">
              <Minus />
            </Button>
            <Input
              className="field-sizing-content min-h-10 p-2 text-center tabular-nums"
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

            <Button slot="increment" className="size-6 hover:text-accent">
              <Plus />
            </Button>
          </Group>
        </>
      )}
    </NumberField>
  );
}
