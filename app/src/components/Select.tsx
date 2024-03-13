import { cloneElement, Fragment, type ReactElement } from "react";
import { FaCaretDown, FaCheck } from "react-icons/fa6";
import { Float } from "@headlessui-float/react";
import { Listbox } from "@headlessui/react";
import { useForm } from "@/components/Form";
import classes from "./Select.module.css";

/** https://github.com/adobe/react-spectrum/issues/2140 */
/** https://github.com/adobe/react-spectrum/issues/4863 */

export type Option = {
  /** unique id */
  id: string;
  /** text label */
  text: string;
  /** secondary text */
  info?: string;
  /** icon */
  icon?: ReactElement;
};

type Base<O extends Option> = {
  /** pass with "as const" */
  options: readonly O[];
  /** label text */
  label: string;
  /** field name in form submission */
  name?: string;
};

type Single<O extends Option> = {
  /** multiple selected values allowed */
  multi?: false;
  /** selected option state */
  value?: O;
  /** on selected option state change */
  onChange?: (value: O) => void;
};

type Multi<O extends Option> = {
  multi: true;
  /** selected options state */
  value?: O[];
  /** on selected options state change */
  onChange?: (value: O[], count: number | "all" | "none") => void;
};

type Props<O extends Option> = Base<O> & (Single<O> | Multi<O>);

/** dropdown select box, multi or single */
const Component = <O extends Option>({
  multi,
  value,
  onChange,
  options,
  label,
  name,
}: Props<O>) => {
  const form = useForm();

  const selected = value ? value : multi ? [] : options[0]!;

  return (
    <Listbox
      as="div"
      className={classes.select}
      multiple={multi}
      value={value ? selected : undefined}
      defaultValue={!value ? selected : undefined}
      onChange={(value) => {
        if (Array.isArray(value) && multi) onChange?.(value, value.length);
        if (!Array.isArray(value) && !multi) onChange?.(value);
      }}
    >
      {({ value }) => {
        const flatValue = [value].flat();
        let selectedLabel = "";
        if (flatValue.length === 0) selectedLabel = "None";
        else if (flatValue.length === 1) selectedLabel = flatValue[0]!.text;
        else if (flatValue.length === options.length) selectedLabel = "All";
        else selectedLabel = flatValue.length + " selected";

        return (
          <>
            <Listbox.Label>{label}</Listbox.Label>
            <Float>
              <Listbox.Button className={classes.button}>
                <span className={classes.buttonLabel}>{selectedLabel}</span>
                <FaCaretDown />
              </Listbox.Button>
              <Listbox.Options className={classes.list}>
                {options.map((option, index) => (
                  <Listbox.Option key={index} value={option} as={Fragment}>
                    {({ active, selected }) => (
                      <li
                        className={classes.item}
                        data-active={active || undefined}
                      >
                        <FaCheck
                          className={classes.check}
                          style={{ opacity: selected ? 1 : 0 }}
                        />
                        <span className={classes.text}>{option.text}</span>
                        {option.info && (
                          <span className={classes.info}>{option.info}</span>
                        )}
                        {option.icon &&
                          cloneElement(option.icon, {
                            className: classes.icon,
                          })}
                      </li>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Float>

            {/* for form data */}
            {/* https://github.com/tailwindlabs/headlessui/discussions/3031 */}
            <select
              style={{ display: "none" }}
              multiple={multi}
              form={form}
              name={name}
              value={
                Array.isArray(value) ? value.map((value) => value.id) : value.id
              }
              /** https://github.com/facebook/react/issues/27657 */
              onChange={() => null}
            >
              {options.map((option, index) => (
                <option key={index} value={option.id} />
              ))}
            </select>
          </>
        );
      }}
    </Listbox>
  );
};

export default Component;
