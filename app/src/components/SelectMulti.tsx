import type { ReactElement, ReactNode } from "react";
import { cloneElement, Fragment } from "react";
import { FaAngleDown, FaCheck } from "react-icons/fa6";
import classNames from "classnames";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import classes from "./Select.module.css";

export type Option<ID = string> = {
  /** unique id */
  id: ID;
  /** text label */
  text: string;
  /** secondary text */
  info?: string;
  /** icon */
  icon?: ReactElement;
};

type Props<O extends Option> = {
  /** layout of label and control */
  layout?: "vertical" | "horizontal";
  /** label content */
  label: ReactNode;
  /** tooltip on help icon */
  tooltip?: ReactNode;
  /** pass with "as const" */
  options: readonly O[];
  /** selected options state */
  value?: O["id"][];
  /** on selected options state change */
  onChange?: (value: O["id"][], count: number | "all" | "none") => void;
  /** field name in form data */
  name?: string;
};

/** multi select box */
const SelectMulti = <O extends Option>({
  label,
  layout = "vertical",
  tooltip,
  value,
  onChange,
  options,
  name,
}: Props<O>) => {
  /** link to parent form component */
  const form = useForm();

  return (
    <Listbox
      className={classNames(classes.container, classes[layout])}
      as="div"
      multiple
      value={value}
      onChange={(value) =>
        onChange?.(
          value,

          value.length === 0
            ? "none"
            : value.length === options.length
              ? "all"
              : value.length,
        )
      }
    >
      {({ value }) => {
        let selectedLabel = "";
        const count = value.length;
        if (count === 0) selectedLabel = "None";
        else if (count === 1)
          selectedLabel =
            options.find((option) => option.id === value[0])?.text || "";
        else if (count === options.length) selectedLabel = "All";
        else selectedLabel = count + " selected";

        return (
          <>
            {/* label */}
            <Label className={classes.label}>
              {label}
              {tooltip && <Help tooltip={tooltip} />}
            </Label>

            {/* button */}
            <ListboxButton className={classes.button}>
              <span className="truncate">{selectedLabel}</span>
              <FaAngleDown />
            </ListboxButton>

            {/* dropdown */}
            <ListboxOptions
              className={classes.options}
              anchor="bottom start"
              modal={false}
            >
              {options.map((option) => (
                <ListboxOption key={option.id} value={option.id} as={Fragment}>
                  {({ focus, selected }) => (
                    <li
                      className={classNames(
                        classes.option,
                        focus && classes["option-active"],
                      )}
                    >
                      <FaCheck
                        className={classes.check}
                        style={{ opacity: selected ? 1 : 0 }}
                      />
                      <span className={classes.text}>{option.text}</span>
                      <span className={classNames(classes.info, "secondary")}>
                        {option.info}
                      </span>
                      {option.icon &&
                        cloneElement(option.icon, {
                          className: classNames(classes.icon, "secondary"),
                        })}
                    </li>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>

            {/* for FormData */}
            <select
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              multiple
              name={name}
              form={form}
              value={value}
              onChange={() => null}
            >
              {options.map((option, index) => (
                <option key={index} value={option.id}>
                  {option.text}
                </option>
              ))}
            </select>
          </>
        );
      }}
    </Listbox>
  );
};

export default SelectMulti;
