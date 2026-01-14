import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { LuSquare, LuSquareCheck } from "react-icons/lu";
import Asterisk from "@/components/Asterisk";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import { preserveScroll } from "@/util/dom";

type Props = {
  /** label content */
  label: ReactNode;
  /** tooltip content */
  tooltip?: ReactNode;
  /** checked state */
  value?: boolean;
  /** on checked state change */
  onChange?: (value: boolean) => void;
  /** field name in form data */
  name?: string;
  /** whether must be checked for form to be submitted */
  required?: boolean;
};

/** mark field name as boolean for nicer parsing of FormData */
export const checkboxKeySuffix = "-checkbox";

/** simple checkbox with label */
const CheckBox = ({
  label,
  tooltip,
  value,
  onChange,
  name,
  required,
}: Props) => {
  /** link to parent form component */
  const form = useForm();

  /** local checked state */
  const [checked, setChecked] = useState(value ?? false);

  /** update local state from controlled value */
  useEffect(() => {
    if (value !== undefined) setChecked(value);
  }, [value]);

  return (
    <label className="group hover:bg-off-white p-2">
      <input
        type="checkbox"
        className="sr-only"
        checked={value}
        onChange={(event) => {
          const value = event.currentTarget.checked;
          preserveScroll(event.currentTarget);
          onChange?.(value);
          setChecked(value);
        }}
        form={form}
        name={name + checkboxKeySuffix}
        required={required}
      />
      {checked ? (
        <LuSquareCheck className="text-accent group-hover:text-deep size-5" />
      ) : (
        <LuSquare className="text-accent group-hover:text-deep size-5" />
      )}
      {label}
      {tooltip && <Help tooltip={tooltip} />}
      {required && <Asterisk />}
    </label>
  );
};

export default CheckBox;
