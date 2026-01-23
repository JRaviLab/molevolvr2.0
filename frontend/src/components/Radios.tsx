import { useEffect } from "react";
import type { ReactElement, ReactNode } from "react";
import { LuCircle, LuCircleCheckBig } from "react-icons/lu";
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
  value: O["id"];
  /** when selected option changes */
  onChange: (value: O["id"]) => void;
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
}: Props<O>) => {
  /** link to parent form component */
  const form = useForm();

  /** selected option */
  const selected = options.find((option) => option.id === value);

  /** auto-select first option if needed */
  useEffect(() => {
    if (options.length > 0 && !selected) onChange(options[0]!.id);
  });

  return (
    <div role="group" className="contents">
      <legend className="flex items-center gap-2">
        {label}
        {tooltip && <Help tooltip={tooltip} />}
      </legend>

      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <label
            key={index}
            className="
              flex items-start gap-4 p-2
              hover:bg-off-white
            "
          >
            <input
              className="sr-only"
              type="radio"
              form={form}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
            />

            {/* check mark */}
            {value === option.id ? (
              <LuCircleCheckBig className="h-lh w-[1.1em] text-accent" />
            ) : (
              <LuCircle className="h-lh w-[1.1em] text-gray" />
            )}

            {/* text content */}
            <div className="flex flex-col items-start gap-2">
              <span>{option.primary}</span>
              {option.secondary && (
                <span className="text-dark-gray">{option.secondary}</span>
              )}
              {option.tertiary && (
                <span className="text-gray">{option.tertiary}</span>
              )}
            </div>

            {/* icon */}
            {option.icon && <div className="text-dark-gray">{option.icon}</div>}
          </label>
        ))}
      </div>
    </div>
  );
};

export default Radios;
