import type { ReactNode } from "react";
import { Square, SquareCheckBig } from "lucide-react";
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
export default function CheckBox({
  label,
  tooltip,
  value,
  onChange,
  required,
}: Props) {
  /** link to parent form component */
  const form = useForm();

  return (
    <label className="group cursor-pointer rounded-md p-2 transition hover:bg-light-gray">
      <div className="relative size-5 shrink-0 text-deep *:absolute *:size-full group-hover:text-accent has-focus-visible:outline-2">
        <input
          type="checkbox"
          className="opacity-0"
          form={form}
          required={required}
          checked={value}
          onChange={(event) => {
            const value = event.currentTarget.checked;
            preserveScroll(event.currentTarget);
            onChange(value);
          }}
        />
        {value ? <SquareCheckBig /> : <Square />}
      </div>
      {label}
      {tooltip && <Help tooltip={tooltip} />}
      {required && <Asterisk />}
    </label>
  );
}
