import type { ReactElement, ReactNode } from "react";
import { cloneElement, useId, useState } from "react";
import { FaRegCircle, FaRegCircleDot } from "react-icons/fa6";
import classNames from "classnames";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import classes from "./Radios.module.css";

export type Option<ID = string> = {
  /** unique id */
  id: ID;
  /** primary content */
  primary: ReactNode;
  /** secondary content */
  secondary?: ReactNode;
  /** tertiary content */
  tertiary?: ReactNode;
  /** icon next to content */
  icon?: ReactElement;
};

type Props<O extends Option> = {
  /** label content */
  label: ReactNode;
  /** tooltip on help icon */
  tooltip?: ReactNode;
  /** pass with "as const" */
  options: readonly O[];
  /** selected option id */
  value?: O["id"];
  /** when selected option changes */
  onChange?: (value: O["id"]) => void;
  /** field name in form data */
  name?: string;
};

/**
 * group of mutually-exclusive options. only use for 2-4 very important options
 * that all need to be simultaneously visible, otherwise use select.
 */
const Radios = <O extends Option>({
  label,
  tooltip,
  options,
  value,
  onChange,
  name,
}: Props<O>) => {
  /** link to parent form component */
  const form = useForm();

  /** fallback name */
  const fallbackName = useId();

  /** local checked state */
  const [checked, setChecked] = useState(value);

  /** ensure local selected value always defined */
  const _checked =
    !checked || !options.find((option) => option.id === checked)
      ? options[0]!.id
      : checked;

  return (
    <div role="group" className={classes.container}>
      <legend className={classes.label}>
        {label}
        {tooltip && <Help tooltip={tooltip} />}
      </legend>

      <div className={classes.options}>
        {options.map((option, index) => (
          <label key={index} className={classes.option}>
            <input
              className="sr-only"
              type="radio"
              form={form}
              name={name ?? fallbackName}
              value={option.id}
              checked={_checked === option.id}
              onChange={() => {
                setChecked(option.id);
                onChange?.(option.id);
              }}
            />

            {/* check mark */}
            {_checked === option.id ? (
              <FaRegCircleDot
                className={classNames(classes.check, classes.checked)}
              />
            ) : (
              <FaRegCircle className={classes.check} />
            )}

            {/* text content */}
            <div className={classes.text}>
              <span className="primary">{option.primary}</span>
              {option.secondary && (
                <span className="secondary">{option.secondary}</span>
              )}
              {option.tertiary && (
                <span className="secondary">{option.tertiary}</span>
              )}
            </div>

            {/* icon */}
            {option.icon &&
              cloneElement(option.icon, { className: classes.icon })}
          </label>
        ))}
      </div>
    </div>
  );
};

export default Radios;
