import type { ReactElement, ReactNode } from "react";
import { cloneElement, useEffect, useId } from "react";
import classNames from "classnames";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import * as tooltip from "@zag-js/tooltip";
import { renderText } from "@/util/dom";
import classes from "./Tooltip.module.css";

type Props = {
  /**
   * content of popup. use raw string for plain text, <>react element for
   * <strong>rich text</strong></>.
   */
  content?: ReactNode;
  /** trigger */
  children: ReactElement;
};

/**
 * popup of minimal, non-interactive help or contextual info when hovering or
 * focusing children. for use in other components, not directly.
 */
const Tooltip = ({ content, children }: Props) => {
  /** set up zag */
  const [state, send] = useMachine(
    tooltip.machine({
      /** unique id for component instance */
      id: useId(),
      /** settings */
      openDelay: 200,
      closeDelay: 0,
      // closeDelay: 999999, // debug
      positioning: {
        placement: "top",
      },
    }),
  );

  /** interact with zag */
  const api = tooltip.connect(state, send, normalizeProps);

  /** force reposition after every render (change to contents) */
  useEffect(() => {
    api.reposition();
  });

  if (content)
    return (
      <>
        {/* children elements that trigger opening on hover/focus */}
        {cloneElement(children, {
          /** pass props necessary to trigger */
          ...api.triggerProps,
          /** make sure original props preserved */
          ...children.props,
          /** set aria label if trigger has no visible text */
          "aria-label": !renderText(children) ? renderText(content) : undefined,
        })}

        {/* popup */}
        <Portal>
          {api.isOpen && (
            <div {...api.positionerProps} className={classes.popup}>
              {/* content */}
              <div
                {...api.contentProps}
                className={classNames(classes.content, "card")}
              >
                {content}
              </div>

              {/* caret */}
              <div {...api.arrowProps} className={classes.arrow}>
                <div {...api.arrowTipProps} />
              </div>
            </div>
          )}
        </Portal>
      </>
    );
  else return children;
};

export default Tooltip;
