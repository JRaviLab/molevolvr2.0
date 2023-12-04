import type { ReactNode } from "react";
import { useId } from "react";
import { FaRegSquare, FaRegSquareCheck } from "react-icons/fa6";
import * as checkbox from "@zag-js/checkbox";
import { normalizeProps, useMachine } from "@zag-js/react";
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
  /** field name */
  name?: string;
};

/** obscure values to be able to distinguish boolean (checkbox) in FormData */
export const checkedValue = "__checkedValue__";
export const uncheckedValue = "__uncheckedValue__";

/** simple checkbox with label */
const CheckBox = ({ label, tooltip, value, onChange, name }: Props) => {
  /** set up zag */
  const [state, send] = useMachine(
    checkbox.machine({
      /** unique id for component instance */
      id: useId(),
      /** link field and form */
      name,
      form: useForm(),
      /** value of checked for FormData */
      value: checkedValue,
      /** initialize state */
      checked: value,
      /** when state changes */
      onCheckedChange: (details) => onChange?.(!!details.checked),
    }),
  );

  /** interact with zag */
  const api = checkbox.connect(state, send, normalizeProps);

  /** check icon */
  const Check = api.isChecked ? FaRegSquareCheck : FaRegSquare;

  return (
    <label {...api.rootProps} className={classes.label}>
      <Check {...api.controlProps} className={classes.check} />
      <span {...api.labelProps}>{label}</span>
      <input {...api.hiddenInputProps} name={undefined} />

      {/* for FormData */}
      <input
        style={api.hiddenInputProps.style}
        value={api.isChecked ? checkedValue : uncheckedValue}
        checked
        readOnly
        tabIndex={-1}
        aria-hidden="true"
        name={api.hiddenInputProps.name}
        form={api.hiddenInputProps.form}
      />
      {tooltip && <Help tooltip={tooltip} />}
    </label>
  );
};

export default CheckBox;
