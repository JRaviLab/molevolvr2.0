import {
  cloneElement,
  Fragment,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { FaAngleDown } from "react-icons/fa6";
import { VscCircleFilled } from "react-icons/vsc";
import classNames from "classnames";
import { Float } from "@headlessui-float/react";
import * as HUI from "@headlessui/react";
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
  /** selected option state */
  value?: O["id"];
  /** on selected option state change */
  onChange?: (value: O["id"]) => void;
  /** field name in form data */
  name?: string;
};

/** single select box */
const SelectSingle = <O extends Option>({
  label,
  layout = "vertical",
  tooltip,
  value,
  onChange,
  options,
  name,
}: Props<O>) => {
  /** local copy of selected value to programmatically set HUI state */
  const [local, setLocal] = useState(value);

  /** ensure local selected value always defined */
  const _local: O["id"] =
    !local || !options.find((option) => option.id === local)
      ? options[0]!.id
      : local;

  /** link to parent form component */
  const form = useForm();

  return (
    <HUI.Listbox
      className={classNames(classes.container, classes[layout])}
      value={_local}
      onChange={(value) => {
        /** update local value */
        setLocal(value);
        /** parent onChange */
        onChange?.(value);
      }}
      name={name}
      form={form}
      as="div"
    >
      {/* label */}
      <HUI.Listbox.Label className={classes.label}>
        {label}
        {tooltip && <Help tooltip={tooltip} />}
      </HUI.Listbox.Label>

      <Float placement="bottom-start" floatingAs={Fragment} adaptiveWidth>
        {/* button */}
        <HUI.Listbox.Button
          className={classes.button}
          onKeyDown={({ key }) => {
            if (!(key === "ArrowLeft" || key === "ArrowRight")) return;

            /** find curent selected index */
            let index = options.findIndex((option) => option.id === _local);
            if (index === -1) return;

            /** inc/dec selected index */
            if (key === "ArrowLeft" && index > 0) index--;
            if (key === "ArrowRight" && index < options.length - 1) index++;

            /** new selected index */
            const selected = options[index]!;

            /** update local value */
            setLocal(selected.id);
            /** parent onChange */
            onChange?.(selected.id);
          }}
        >
          <span className="truncate">
            {options.find((option) => option.id === _local)?.text}
          </span>
          <FaAngleDown />
        </HUI.Listbox.Button>

        {/* dropdown */}
        <HUI.Listbox.Options className={classes.options}>
          {options.map((option) => (
            <HUI.Listbox.Option key={option.id} value={option.id} as={Fragment}>
              {({ active, selected }) => (
                <li
                  className={classNames(
                    classes.option,
                    active && classes["option-active"],
                  )}
                >
                  {/* check mark */}
                  <VscCircleFilled
                    className={classes.check}
                    style={{ opacity: selected ? 1 : 0 }}
                  />
                  {/* text */}
                  <span className={classes.text}>{option.text}</span>
                  <span className={classNames(classes.info, "secondary")}>
                    {option.info}
                  </span>
                  {/* icon */}
                  {option.icon &&
                    cloneElement(option.icon, {
                      className: classNames(classes.icon, "secondary"),
                    })}
                </li>
              )}
            </HUI.Listbox.Option>
          ))}
        </HUI.Listbox.Options>
      </Float>
    </HUI.Listbox>
  );
};

export default SelectSingle;
