import type { ReactElement, ReactNode } from "react";
import { cloneElement, useId } from "react";
import { FaRegCircle, FaRegCircleDot } from "react-icons/fa6";
import * as radio from "@zag-js/radio-group";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useForm } from "@/components/Form";
import type { LabelProps } from "@/components/Label";
import Label, { forwardLabelProps } from "@/components/Label";
import classes from "./Radios.module.css";

type Base<Value extends string> = {
  /** selected option id */
  value?: Value;
  /** when selected option changes */
  onChange?: (value: Value) => void;
  /** list of options */
  options: readonly {
    /** unique id to identify option */
    id: Value;
    /** primary content */
    primary: ReactNode;
    /** secondary content */
    secondary?: ReactNode;
    /** icon next to content */
    icon?: ReactElement;
  }[];
  /** field name */
  name?: string;
};

type Props<Value extends string> = Base<Value> & LabelProps;

/**
 * group of mutually-exclusive options. only use for 2-4 very important options
 * that all need to be simultaneously visible, otherwise use select.
 */
const Radios = <Value extends string>({
  value,
  onChange,
  options,
  name,
  ...props
}: Props<Value>) => {
  /** set up zag */
  const [state, send] = useMachine(
    radio.machine({
      /** unique id for component instance */
      id: useId(),
      /** link field and form */
      name,
      form: useForm(),
      /** initialize selected value state */
      value: String(value || options[0]?.id || 0),
      /** when selected value changes */
      onValueChange: (details) => onChange?.(details.value as Value),
    }),
  );

  /** interact with zag */
  const api = radio.connect(state, send, normalizeProps);

  /** check icon */
  const Check = ({ selected = false, ...props }) =>
    selected ? <FaRegCircleDot {...props} /> : <FaRegCircle {...props} />;

  return (
    <Label
      {...api.labelProps}
      {...forwardLabelProps(props, api.rootProps.id)}
      layout="vertical"
      width="unset"
    >
      <div {...api.rootProps} className={classes.list}>
        {options.map((option) => (
          <label
            key={option.id}
            {...api.getItemProps({ value: option.id })}
            className={classes.option}
          >
            {/* check */}
            <Check
              className={classes.check}
              selected={option.id === api.value}
              {...api.getItemControlProps({ value: option.id })}
            />

            {/* text content */}
            <div {...api.getItemTextProps({ value: option.id })}>
              <span className="primary">{option.primary}</span>
              <br />
              {option.secondary && (
                <span className="secondary">{option.secondary}</span>
              )}
            </div>

            {/* icon */}
            {option.icon &&
              cloneElement(option.icon, { className: classes.icon })}

            <input {...api.getItemHiddenInputProps({ value: option.id })} />
          </label>
        ))}
      </div>
    </Label>
  );
};

export default Radios;
