import type { ReactElement, ReactNode } from "react";
import { cloneElement, Fragment, useId } from "react";
import classNames from "classnames";
import { kebabCase } from "lodash";
import { StringParam, useQueryParam } from "use-query-params";
import { normalizeProps, useMachine } from "@zag-js/react";
import * as tabs from "@zag-js/tabs";
import Tooltip from "@/components/Tooltip";
import classes from "./Tabs.module.css";

type Props = {
  /**
   * keep selected tab synced with url param of this name (leave undefined for
   * no sync)
   */
  syncWithUrl?: string;
  /** series of Tab components */
  children: ReactElement<TabProps>[];
};

const Tabs = ({ syncWithUrl = "", children }: Props) => {
  /** sync selected tab with url */
  const [value, setValue] = useQueryParam(syncWithUrl, StringParam);

  /** tab props */
  const tabProps = children.map((child) => ({
    ...child.props,
    /** make unique tab id from text */
    id: kebabCase(child.props.text),
  }));

  /** set up zag */
  const [state, send] = useMachine(
    tabs.machine({
      /** unique id for component instance */
      id: useId(),
      /** initialize selected tab state */
      value: syncWithUrl ? value || tabProps[0]?.id : tabProps[0]?.id,
      /** when selected tab changes */
      onValueChange: (details) => syncWithUrl && setValue(details.value),
    }),
  );

  /** interact with zag */
  const api = tabs.connect(state, send, normalizeProps);

  return (
    <div {...api.rootProps} className={classes.container}>
      {/* list */}
      <div {...api.tablistProps} className="flex-row gap-sm">
        {tabProps.map((tab, index) => (
          <Tooltip key={index} content={tab.tooltip}>
            <button
              {...api.getTriggerProps({ value: tab.id })}
              className={classes.button}
              type="button"
            >
              {tab.text}
              {tab.icon && cloneElement(tab.icon, { className: "icon" })}
            </button>
          </Tooltip>
        ))}
      </div>

      {/* panels */}
      {tabProps.map((tab, index) => (
        <div
          key={index}
          {...api.getContentProps({ value: tab.id })}
          className={classNames(classes.content, tab.className)}
        >
          {tab.children}
        </div>
      ))}
    </div>
  );
};

export default Tabs;

type TabProps = {
  /**
   * tab button text. should be unique to avoid user confusion, and because
   * kebab-cased to create unique id.
   */
  text: string;
  /** tab button icon */
  icon?: ReactElement;
  /** tab button tooltip content */
  tooltip?: ReactNode;
  /** class on panel content container */
  className?: string;
  /** tab panel content */
  children: ReactNode;
};

/** use within a Tabs component */
const Tab = (props: TabProps) => {
  return <Fragment {...props} />;
};

export { Tab };
