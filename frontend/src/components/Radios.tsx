import { cloneElement, useEffect, useId, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { FaCircleDot, FaRegCircle } from "react-icons/fa6";
import { usePrevious } from "@reactuses/core";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";

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
  icon?: ReactElement<{ className: string }>;
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
  useEffect(() => {
    if (previousSelected && previousSelected !== selectedWFallback)
      onChange?.(selectedWFallback);
  }, [selectedWFallback, previousSelected, onChange]);

  /** update local state from controlled value */
  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  return (
    <div role="group" className="flex flex-col items-start gap-4">
      <legend className="flex items-center gap-2">
        {label}
        {tooltip && <Help tooltip={tooltip} />}
      </legend>

      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <label
            key={index}
            className="hover:bg-off-white flex items-start gap-4 p-2"
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
              <FaCircleDot className="text-accent" />
            ) : (
              <FaRegCircle />
            )}

            {/* text content */}
            <div className="flex flex-col items-start gap-4">
              <span>{option.primary}</span>
              {option.secondary && (
                <span className="text-dark-gray">{option.secondary}</span>
              )}
              {option.tertiary && (
                <span className="text-gray">{option.tertiary}</span>
              )}
            </div>

            {/* icon */}
            {option.icon &&
              cloneElement(option.icon, { className: "text-dark-gray" })}
          </label>
        ))}
      </div>
    </div>
  );
};

export default Radios;
