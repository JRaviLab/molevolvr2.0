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
import classes from "./Slider.module.css";

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
  /** field name in form data */
  name?: string;
};

type Single = {
  /** single value */
  multi?: false;
  /** number state */
  value?: number;
  /** on number state change */
  onChange?: (value: number) => void;
};

type Multi = {
  /** multiple values (range) */
  multi: true;
  /** numbers state */
  value?: number[];
  /** on numbers state change */
  onChange?: (value: number[]) => void;
};

type Props = Base & (Single | Multi);

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
  name,
}: Props) => {
  /** link to parent form component */
  const form = useForm();

  return (
    <RACSlider
      className={clsx(classes.container, classes[layout])}
      defaultValue={(value ?? multi) ? [min, max] : min}
      value={value}
      minValue={min}
      maxValue={max}
      step={Math.min(step, max - min)}
      onChange={(value) => {
        if (!multi && !Array.isArray(value)) onChange?.(value);
        if (multi && Array.isArray(value)) onChange?.(value);
      }}
    >
      {({ state }) => (
        <>
          <Label>
            {label}
            {tooltip && <Help tooltip={tooltip} />}
          </Label>
          <SliderTrack className={classes.track}>
            {/* fill */}
            <div
              className={classes.fill}
              style={{
                left: multi ? state.getThumbPercent(0) * 100 + "%" : "",
                width:
                  (multi
                    ? state.getThumbPercent(1) - state.getThumbPercent(0)
                    : state.getThumbPercent(0)) *
                    100 +
                  "%",
              }}
            />

            <div className={classes["secondary-marker"]} style={{ left: "0%" }}>
              {formatNumber(min, true)}
            </div>
            <div
              className={classes["secondary-marker"]}
              style={{ left: "100%" }}
            >
              {formatNumber(max, true)}
            </div>

            {state.values.map((value, index) => (
              <SliderThumb key={index} index={index} className={classes.thumb}>
                <div className={classes["primary-marker"]}>
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
                name={name}
              />
            ))}
          </SliderTrack>
        </>
      )}
    </RACSlider>
  );
};

export default Slider;
