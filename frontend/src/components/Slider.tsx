import { useRef, type ReactNode } from "react";
import {
  Label,
  Slider as RACSlider,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";
import { useElementSize } from "@reactuses/core";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import { formatNumber } from "@/util/string";

type Props = Base & (Single | Multi);

type Base = {
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
  tooltip,
  min = 0,
  max = 100,
  step = 1,
  multi,
  value,
  onChange,
}: Props) => {
  const track = useRef<HTMLDivElement>(null);
  const [, height] = useElementSize(track, { box: "border-box" });

  /** link to parent form component */
  const form = useForm();

  return (
    <RACSlider
      className="contents"
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
          <Label
            className="flex items-center gap-1"
            style={{ minHeight: height }}
          >
            {label}
            {tooltip && <Help tooltip={tooltip} />}
          </Label>

          <SliderTrack
            ref={track}
            className="
              group mx-2 flex h-9 min-w-40 cursor-pointer items-center
              rounded-full text-accent
              group-hover:text-deep
            "
          >
            {/* bg fill */}
            <div className="absolute h-1 w-full rounded-full bg-gray" />

            {/* active fill */}
            <div
              className="absolute h-1 rounded-full bg-current"
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

            {/* min marker */}
            <div
              className="
                absolute bottom-full left-0 -translate-x-1/2 translate-y-1
                whitespace-nowrap opacity-0
                group-focus-within:opacity-50
                group-hover:opacity-50
              "
            >
              {formatNumber(min, true)}
            </div>

            {/* max marker */}
            <div
              className="
                absolute right-0 bottom-full translate-x-1/2 translate-y-1
                whitespace-nowrap opacity-0
                group-focus-within:opacity-50
                group-hover:opacity-50
              "
            >
              {formatNumber(max, true)}
            </div>

            {/* thumb and marker */}
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
