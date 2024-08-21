import {
  cloneElement,
  Fragment,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Label } from "react-aria-components";
import { FaAngleDown } from "react-icons/fa6";
import { VscCircleFilled } from "react-icons/vsc";
import clsx from "clsx";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { usePrevious } from "@reactuses/core";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import { sleep } from "@/util/misc";
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
  /** local copy of selected value */
  const [selected, setSelected] = useState(value);

  /** whether selected option undefined and needs to fallback */
  const fallback =
    !selected || !options.find((option) => option.id === selected);

  /** ensure local selected value always defined */
  const selectedWFallback: O["id"] = fallback ? options[0]!.id : selected;

  /** notify parent when selected changes */
  const previousSelected = usePrevious(selectedWFallback);
  if (previousSelected && previousSelected !== selectedWFallback)
    sleep().then(() => onChange?.(selectedWFallback));

  /** update local state from controlled value */
  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  /** link to parent form component */
  const form = useForm();

  return (
    <Listbox
      className={clsx(classes.container, classes[layout])}
      value={selectedWFallback}
      onChange={setSelected}
      name={name}
      form={form}
      as="div"
    >
      {/* label */}
      <Label className={classes.label}>
        {label}
        {tooltip && <Help tooltip={tooltip} />}
      </Label>

      {/* button */}
      <ListboxButton
        className={classes.button}
        onKeyDown={({ key }) => {
          if (!(key === "ArrowLeft" || key === "ArrowRight")) return;

          /** find curent selected index */
          let index = options.findIndex(
            (option) => option.id === selectedWFallback,
          );
          if (index === -1) return;

          /** inc/dec selected index */
          if (key === "ArrowLeft" && index > 0) index--;
          if (key === "ArrowRight" && index < options.length - 1) index++;

          /** new selected index */
          const selected = options[index]!;

          /** update local value */
          setSelected(selected.id);
        }}
      >
        <span className="truncate">
          {options.find((option) => option.id === selectedWFallback)?.text}
        </span>
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
                className={clsx(
                  classes.option,
                  focus && classes["option-active"],
                )}
              >
                {/* check mark */}
                <VscCircleFilled
                  className={classes.check}
                  style={{ opacity: selected ? 1 : 0 }}
                />
                {/* text */}
                <span className={classes.text}>{option.text}</span>
                <span className={clsx(classes.info, "secondary")}>
                  {option.info}
                </span>
                {/* icon */}
                {option.icon &&
                  cloneElement(option.icon, {
                    className: clsx(classes.icon, "secondary"),
                  })}
              </li>
            )}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
};

export default SelectSingle;
