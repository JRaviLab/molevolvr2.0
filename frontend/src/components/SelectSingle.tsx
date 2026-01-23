import { Fragment, useEffect } from "react";
import type { ReactElement, ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";
import { VscCircleFilled } from "react-icons/vsc";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import clsx from "clsx";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";

type Props<O extends Option> = {
  /** label content */
  label: ReactNode;
  /** tooltip on help icon */
  tooltip?: ReactNode;
  /** pass with "as const" */
  options: readonly O[];
  /** selected option state */
  value: O["id"];
  /** on selected option state change */
  onChange: (value: O["id"]) => void;
};

export type Option<ID = string | number> = {
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
  tooltip,
  value,
  onChange,
  options,
}: Props<O>) => {
  /** link to parent form component */
  const form = useForm();

  /** selected index */
  let index = options.findIndex((option) => option.id === value);
  /** selected option */
  const selected = options.find((option) => option.id === value);

  /** auto-select first option if needed */
  useEffect(() => {
    if (options.length > 0 && !selected) onChange(options[0]!.id);
  });

  return (
    <Listbox
      className="contents"
      as="div"
      form={form}
      value={value}
      onChange={onChange}
    >
      {/* label */}
      <Label className="flex items-center gap-1">
        {label}
        {tooltip && <Help tooltip={tooltip} />}
      </Label>

      {/* button */}
      <ListboxButton
        className="
          gap-2 border-b border-current p-2 text-accent
          hover:text-deep
        "
        onKeyDown={({ key }) => {
          if (index === -1) return;

          if (!(key === "ArrowLeft" || key === "ArrowRight")) return;

          /** inc/dec selected index */
          if (key === "ArrowLeft" && index > 0) index--;
          if (key === "ArrowRight" && index < options.length - 1) index++;

          /** new selected index */
          const selected = options[index];
          if (selected) onChange(selected.id);
        }}
      >
        {selected?.icon}
        <span className="grow truncate py-1 leading-none">
          {selected?.primary}
        </span>
        <LuChevronDown />
      </ListboxButton>

      {/* dropdown */}
      <ListboxOptions
        className="z-20 min-w-(--button-width) bg-white shadow-sm"
        anchor={{ to: "bottom start", padding: 10 }}
        modal={false}
      >
        {options.map((option) => (
          <ListboxOption key={option.id} value={option.id} as={Fragment}>
            {({ focus, selected }) => (
              <li
                className={clsx(
                  `
                    flex max-w-[calc(100dvw--spacing(20))] cursor-pointer
                    items-center gap-2 p-2
                  `,
                  focus && "bg-off-white",
                )}
              >
                {/* check mark */}
                <VscCircleFilled
                  className={clsx(
                    "text-accent",
                    selected ? "opacity-100" : "opacity-0",
                  )}
                />
                {/* text */}
                <span className="flex grow-2 items-center leading-none">
                  {option.primary}
                </span>
                <span
                  className="
                    flex grow items-center justify-end justify-self-end
                    text-right text-sm leading-none text-gray
                  "
                >
                  {option.secondary}
                </span>
                {/* icon */}
                {option.icon && (
                  <div className="justify-self-end text-gray">
                    {option.icon}
                  </div>
                )}
              </li>
            )}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
};

export default SelectSingle;
