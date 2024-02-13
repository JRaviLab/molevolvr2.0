import type { ReactElement } from "react";
import { cloneElement, useId } from "react";
import { FaCaretDown, FaCheck, FaCircle } from "react-icons/fa6";
import classNames from "classnames";
import { omit } from "lodash";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import * as select from "@zag-js/select";
import type { PropTypes } from "@zag-js/types";
import { useForm } from "@/components/Form";
import type { LabelProps } from "@/components/Label";
import Label, { forwardLabelProps } from "@/components/Label";
import classes from "./Select.module.css";

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
  /** field name */
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

type Props<O extends Option> = Base<O> & LabelProps & (Single<O> | Multi<O>);

/** dropdown select box, multi or single */
const Select = <O extends Option>({
  multi,
  value,
  onChange,
  options,
  name,
  ...props
}: Props<O>) => {
  /** set up zag */
  const [state, send] = useMachine(
    select.machine<O>({
      /** unique id for component instance */
      id: useId(),
      /** link field to form */
      name,
      form: useForm(),
      /** multiple selections allowed */
      multiple: !!multi,
      /** options */
      collection: select.collection({
        /** options */
        items: options.map((option) => omit(option, "icon")),
        /** for uniquely identifying option */
        itemToValue: (option) => option.id,
        /** string to use for type-ahead */
        itemToString: (option) => option.text,
      }),
      /** initialize selected values (array of ids) */
      value: value
        ? [value].flat().map((value) => value.id)
        : multi
          ? []
          : options[0]
            ? [options[0].id]
            : [],
      /** when selected items change */
      onValueChange: (details) =>
        multi
          ? onChange?.(
              details.items,
              details.items.length === 0
                ? "none"
                : details.items.length === options.length
                  ? "all"
                  : details.items.length,
            )
          : details.items[0] && onChange?.(details.items[0]),
    }),
  );

  /** interact with zag */
  const api = select.connect<PropTypes, O>(state, send, normalizeProps);

  /** label to show in button trigger */
  let selectedLabel = "";
  const selected = api.selectedItems;
  const count = [selected].flat().length;
  if (count === 0) selectedLabel = "None";
  else if (count === 1) selectedLabel = [selected].flat()[0]?.text || "";
  else if (count === options.length) selectedLabel = "All";
  else selectedLabel = count + " selected";

  /** check icon */
  const Check = multi ? FaCheck : FaCircle;

  /** all selected */
  const allSelected = api.selectedItems.length === options.length;

  /** count number of filled columns in options */
  let cols = 2;
  if (options.some((option) => option.info)) cols++;
  if (options.some((option) => option.icon)) cols++;

  return (
    <>
      <div {...api.rootProps} className={classes.root}>
        {/* trigger */}
        <div {...api.controlProps} className={classes.control}>
          <Label
            {...api.labelProps}
            {...forwardLabelProps(props, api.triggerProps.id)}
          >
            <button {...api.triggerProps} className={classes.button}>
              <span className="truncate" aria-hidden={true}>
                {selectedLabel}
              </span>
              <FaCaretDown />
            </button>
          </Label>
        </div>

        {/* popup */}
        <Portal>
          {api.isOpen && (
            <div {...api.positionerProps} className={classes.popup}>
              {/* select all/none */}
              <ul {...api.contentProps} className={classes.list}>
                {multi && (
                  <button
                    className={classes.option}
                    onClick={() =>
                      api.setValue(
                        allSelected ? [] : options.map((option) => option.id),
                      )
                    }
                  >
                    <Check
                      className={classes.check}
                      style={{ opacity: allSelected ? 1 : 0 }}
                    />
                    <span className={classes.text}>All</span>
                  </button>
                )}

                {/* main options */}
                {options.map((option, index) => (
                  <li
                    key={index}
                    {...api.getItemProps({ item: option })}
                    className={classes.option}
                    style={{
                      ...api.contentProps.style,
                      gridTemplateColumns: ["30px", "2fr", "1fr", "30px"]
                        .slice(0, cols)
                        .join(" "),
                    }}
                  >
                    <Check
                      {...api.getItemIndicatorProps({ item: option })}
                      className={classes.check}
                      style={{ height: multi ? "" : "8px" }}
                    />
                    <span className={classes.text}>{option.text}</span>
                    {option.info && (
                      <span className="secondary">{option.info}</span>
                    )}
                    {option.icon &&
                      cloneElement(option.icon, {
                        className: classNames(classes.icon, "secondary"),
                      })}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Portal>
      </div>

      {/* for form usage */}
      <select
        {...api.hiddenSelectProps}
        value={multi ? api.value : api.value[0]}
        /** https://github.com/facebook/react/issues/27657 */
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
};

export default Select;
