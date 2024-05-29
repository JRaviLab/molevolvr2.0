import { useEffect, useState, type ReactNode } from "react";
import { FaRegSquare, FaRegSquareCheck } from "react-icons/fa6";
import Asterisk from "@/components/Asterisk";
import Flex from "@/components/Flex";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import classes from "./CheckBox.module.css";

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
    <Flex tag="label" gap="sm" wrap={false} className={classes.container}>
      <input
        type="checkbox"
        className="sr-only"
        checked={value}
        onChange={(event) => {
          const value = event.currentTarget.checked;
          onChange?.(value);
          setChecked(value);
        }}
        form={form}
        name={name + checkboxKeySuffix}
        required={required}
      />
      {checked ? (
        <FaRegSquareCheck className={classes.check} />
      ) : (
        <FaRegSquare className={classes.check} />
      )}
      {label}
      {tooltip && <Help tooltip={tooltip} />}
      {required && <Asterisk />}
    </Flex>
  );
};

export default CheckBox;
