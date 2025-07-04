import {
  cloneElement,
  Fragment,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { FaAngleDown } from "react-icons/fa6";
import { VscCircleFilled } from "react-icons/vsc";
import clsx from "clsx";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { usePrevious } from "@reactuses/core";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import classes from "./Select.module.css";

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

export type Option<ID = string> = {
  /** unique id */
  id: ID;
  /** primary label */
  primary: ReactNode;
  /** secondary label */
  secondary?: ReactNode;
  /** icon */
  icon?: ReactElement<{ className: string }>;
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
  useEffect(() => {
    if (previousSelected && previousSelected !== selectedWFallback)
      onChange?.(selectedWFallback);
  }, [selectedWFallback, previousSelected, onChange]);

  /** update local state from controlled value */
  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  /** link to parent form component */
  const form = useForm();

  /** full selected option object */
  const fullSelected = options.find(
    (option) => option.id === selectedWFallback,
  );

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

          /** find current selected index */
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
        {fullSelected?.icon}
        <span className="truncate">{fullSelected?.primary}</span>
        <FaAngleDown />
      </ListboxButton>

      {/* dropdown */}
      <ListboxOptions
        className={classes.options}
        anchor={{ to: "bottom start", padding: 10 }}
        modal={false}
      >
        {options.map((option) => (
          <ListboxOption key={option.id} value={option.id} as={Fragment}>
            {({ focus, selected }) => (
              <li className={classes.option} data-active={focus}>
                {/* check mark */}
                <VscCircleFilled
                  className={classes.check}
                  style={{ opacity: selected ? 1 : 0 }}
                />
                {/* text */}
                <span className={classes.primary}>{option.primary}</span>
                <span className={clsx("secondary", classes.secondary)}>
                  {option.secondary}
                </span>
                {/* icon */}
                {option.icon &&
                  cloneElement(option.icon, {
                    className: clsx("secondary", classes.icon),
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
