import type { ReactElement, ReactNode } from "react";
import { Fragment, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import classNames from "classnames";
import { kebabCase } from "lodash";
import { Content, List, Root, Trigger } from "@radix-ui/react-tabs";
import Tooltip from "@/components/Tooltip";
import classes from "./Tabs.module.css";

type Props = {
  /**
   * keep selected tab synced with url param of this name (leave undefined for
   * no sync)
   */
  syncWithUrl?: string;
  /** series of Tab components */
  children: ReactElement<TabProps> | ReactElement<TabProps>[];
  /** starting selected tab id (defaults to first tab) */
  defaultValue?: string;
};

const Tabs = ({ syncWithUrl = "", children, defaultValue }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  /** tab props */
  const tabs = (Array.isArray(children) ? children : [children])
    .filter((child): child is ReactElement => !!child)
    .map((child) => ({
      ...child.props,
      /** make unique tab id from text */
      id: kebabCase(child.props.text),
    }));

  defaultValue ??= tabs[0]!.id;

  /** https://github.com/radix-ui/primitives/issues/602 */
  /** local selected tab state */
  const [selected, setSelected] = useState(defaultValue ?? "");

  /** sync selected tab with url */
  const [searchParams] = useSearchParams();

  /** update selected from url */
  const fromUrl = searchParams.get(syncWithUrl) ?? defaultValue ?? "";
  useEffect(() => {
    setSelected(fromUrl);
  }, [fromUrl]);

  return (
    <Root
      className={classes.root}
      value={selected}
      onValueChange={(value) => {
        setSelected(value);
        /** update url from selected */
        if (syncWithUrl) {
          if (value === defaultValue) searchParams.delete(syncWithUrl);
          else searchParams.set(syncWithUrl, value);
          navigate(
            { ...location, search: "?" + searchParams.toString() },
            { state: location.state },
          );
        }
      }}
    >
      {/* tab buttons */}
      <List className={classes.buttons}>
        {tabs.map((tab, index) => (
          <Tooltip key={index} content={tab.tooltip}>
            <Trigger
              value={tab.id}
              className={classNames(
                classes.button,
                tab.id === selected && classes.active,
              )}
            >
              {tab.text}
              {tab.icon}
            </Trigger>
          </Tooltip>
        ))}
      </List>

      {/* panels */}
      {tabs.map((tab, index) => (
        <Content key={index} value={tab.id} className={classes.content}>
          {tab.children}
        </Content>
      ))}
    </Root>
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
  /** tab panel content */
  children: ReactNode;
};

/** use within a Tabs component */
const Tab = (props: TabProps) => {
  return <Fragment {...props} />;
};

export { Tab };
