import type { ReactElement, ReactNode } from "react";
import { cloneElement, useEffect, useId, useState } from "react";
import { FaCircleDot, FaRegCircle } from "react-icons/fa6";
import clsx from "clsx";
import { usePrevious } from "@reactuses/core";
import Flex from "@/components/Flex";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import { sleep } from "@/util/misc";
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

  /** local copy of selected state */
  const [selected, setSelected] = useState(value);

  /** whether selected option undefined and needs to fallback */
  const fallback =
    !selected || !options.find((option) => option.id === selected);

  /** ensure local selected value always defined */
  const selectedWFallback: O["id"] = fallback ? options[0]!.id : selected;

  /** notify parent when selected changes */
  const previousSelected = usePrevious(selectedWFallback);
  if (previousSelected && previousSelected !== selectedWFallback)
    sleep().then(() => onChange?.(selectedWFallback));

  /** update local state from controlled value */
  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  return (
    <Flex
      direction="column"
      hAlign="left"
      role="group"
      className={classes.container}
    >
      <legend className={classes.label}>
        {label}
        {tooltip && <Help tooltip={tooltip} />}
      </legend>

      <Flex direction="column" gap="xs" hAlign="stretch">
        {options.map((option, index) => (
          <Flex
            tag="label"
            hAlign="stretch"
            vAlign="top"
            wrap={false}
            gap="sm"
            key={index}
            className={classes.option}
          >
            <input
              className="sr-only"
              type="radio"
              form={form}
              name={name ?? fallbackName}
              value={option.id}
              checked={selectedWFallback === option.id}
              onChange={() => setSelected(option.id)}
            />

            {/* check mark */}
            {selectedWFallback === option.id ? (
              <FaCircleDot className={clsx(classes.check, classes.checked)} />
            ) : (
              <FaRegCircle className={classes.check} />
            )}

            {/* text content */}
            <Flex direction="column" hAlign="left" gap="sm">
              <span
                className={clsx(
                  "primary",
                  selectedWFallback === option.id && classes.checked,
                )}
              >
                {option.primary}
              </span>
              {option.secondary && (
                <span className="secondary">{option.secondary}</span>
              )}
              {option.tertiary && (
                <span className="secondary">{option.tertiary}</span>
              )}
            </Flex>

            {/* icon */}
            {option.icon &&
              cloneElement(option.icon, { className: classes.icon })}
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default Radios;
