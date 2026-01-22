import { Fragment } from "react";
import type { ReactElement, ReactNode } from "react";
import { LuCheck, LuChevronDown } from "react-icons/lu";
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
  /** layout of label and control */
  layout?: "vertical" | "horizontal";
  /** label content */
  label: ReactNode;
  /** tooltip on help icon */
  tooltip?: ReactNode;
  /** pass with "as const" */
  options: readonly O[];
  /** selected options state */
  value: O["id"][];
  /** on selected options state change */
  onChange: (value: O["id"][], count: number | "all" | "none") => void;
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

/** multi select box */
const SelectMulti = <O extends Option>({
  label,
  layout = "vertical",
  tooltip,
  value,
  onChange,
  options,
}: Props<O>) => {
  /** link to parent form component */
  const form = useForm();

  return (
    <Listbox
      className={clsx(
        "flex gap-4",
        layout === "horizontal" && "items-center",
        layout === "vertical" && "flex-col items-start",
      )}
      as="div"
      multiple
      value={value}
      onChange={(value) =>
        onChange(
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
        let selectedLabel: ReactNode = "";
        const count = value.length;
        if (count === 0) selectedLabel = "None selected";
        else if (count === 1)
          selectedLabel =
            options.find((option) => option.id === value[0])?.primary || "";
        else if (count === options.length) selectedLabel = "All selected";
        else selectedLabel = count + " selected";

        return (
          <>
            {/* label */}
            <Label className="flex items-center gap-1">
              {label}
              {tooltip && <Help tooltip={tooltip} />}
            </Label>

            {/* button */}
            <ListboxButton
              className="
                grow gap-2 border-b-2 border-current p-2 text-accent
                hover:text-deep
              "
            >
              <span className="grow truncate">{selectedLabel}</span>
              <LuChevronDown />
            </ListboxButton>

            {/* dropdown */}
            <ListboxOptions
              className="z-30 min-w-min bg-white shadow-sm"
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
                      <LuCheck
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

            {/* for FormData */}
            <select
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              multiple
              form={form}
              value={value}
              onChange={() => null}
            >
              {options.map((option, index) => (
                <option key={index} value={option.id}>
                  {option.primary}
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
