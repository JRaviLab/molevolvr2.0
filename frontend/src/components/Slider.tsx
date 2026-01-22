import type { ReactNode } from "react";
import {
  Label,
  Slider as RACSlider,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";
import clsx from "clsx";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import { formatNumber } from "@/util/string";

type Props = Base & (Single | Multi);

type Base = {
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
};

type Single = {
  /** single value */
  multi?: false;
  /** number state */
  value: number;
  /** on number state change */
  onChange: (value: number) => void;
};

type Multi = {
  /** multiple values (range) */
  multi: true;
  /** numbers state */
  value: number[];
  /** on numbers state change */
  onChange: (value: number[]) => void;
};

/**
 * single or multi-value number slider. use for numeric values that need quick
 * or imprecise adjustment.
 */
const Slider = ({
  label,
  layout = "vertical",
  tooltip,
  min = 0,
  max = 100,
  step = 1,
  multi,
  value,
  onChange,
}: Props) => {
  /** link to parent form component */
  const form = useForm();

  return (
    <RACSlider
      className={clsx(
        "group flex gap-4",
        layout === "horizontal" && "items-center",
        layout === "vertical" && "flex-col items-start",
      )}
      minValue={min}
      maxValue={max}
      step={Math.min(step, max - min)}
      value={value}
      onChange={(value) => {
        if (!multi && !Array.isArray(value)) onChange(value);
        if (multi && Array.isArray(value)) onChange(value);
      }}
    >
      {({ state }) => (
        <>
          <Label className="flex items-center gap-1">
            {label}
            {tooltip && <Help tooltip={tooltip} />}
          </Label>

          <SliderTrack
            className="
              m-2 box-content h-1 min-w-40 cursor-pointer rounded-full bg-gray
              bg-clip-content p-2 text-accent
              group-hover:text-deep
            "
          >
            {/* fill */}
            <div
              className="
                absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-current
              "
              style={{
                left: multi ? 100 * state.getThumbPercent(0) + "%" : "",
                width:
                  (multi
                    ? state.getThumbPercent(1) - state.getThumbPercent(0)
                    : state.getThumbPercent(0)) *
                    100 +
                  "%",
              }}
            />

            <div
              className="
                absolute -top-full left-0 -translate-x-1/2 translate-y-1
                whitespace-nowrap opacity-0
                group-focus-within:opacity-50
                group-hover:opacity-50
              "
            >
              {formatNumber(min, true)}
            </div>
            <div
              className="
                absolute -top-full right-0 translate-x-1/2 translate-y-1
                whitespace-nowrap opacity-0
                group-focus-within:opacity-50
                group-hover:opacity-50
              "
            >
              {formatNumber(max, true)}
            </div>

            {state.values.map((value, index) => (
              <SliderThumb
                key={index}
                index={index}
                className="
                  top-1/2 size-4 cursor-pointer rounded-full bg-current
                  outline-offset-2 outline-current
                  focus-within:outline-2
                "
              >
                <div
                  className="
                    absolute top-full left-1/2 -translate-x-1/2 translate-y-1
                    text-center whitespace-nowrap
                  "
                >
                  {formatNumber(value, true)}
                </div>
              </SliderThumb>
            ))}

            {/* https://github.com/adobe/react-spectrum/issues/4117 */}
            {state.values.map((value, index) => (
              <input
                key={index}
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                type="number"
                value={value}
                readOnly
                form={form}
              />
            ))}
          </SliderTrack>
        </>
      )}
    </RACSlider>
  );
};

export default Slider;
