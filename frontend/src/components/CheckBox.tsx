import type { ReactNode } from "react";
import { Square, SquareCheck } from "lucide-react";
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
  value: boolean;
  /** on checked state change */
  onChange: (value: boolean) => void;
  /** whether must be checked for form to be submitted */
  required?: boolean;
};

/** simple checkbox with label */
const CheckBox = ({ label, tooltip, value, onChange, required }: Props) => {
  /** link to parent form component */
  const form = useForm();

  return (
    <label
      className="
        group p-2
        hover:bg-off-white
      "
    >
      <input
        type="checkbox"
        className="sr-only"
        form={form}
        required={required}
        checked={value}
        onChange={(event) => {
          const value = event.currentTarget.checked;
          preserveScroll(event.currentTarget);
          onChange(value);
        }}
      />
      {value ? (
        <SquareCheck
          className="
            size-5 text-accent
            group-hover:text-deep
          "
        />
      ) : (
        <Square
          className="
            size-5 text-accent
            group-hover:text-deep
          "
        />
      )}
      {label}
      {tooltip && <Help tooltip={tooltip} />}
      {required && <Asterisk />}
    </label>
  );
};

export default CheckBox;
