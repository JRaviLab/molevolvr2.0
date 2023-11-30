import type { ReactElement, ReactNode } from "react";
import { cloneElement, useId } from "react";
import classNames from "classnames";
import * as popover from "@zag-js/popover";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { renderText } from "@/util/dom";
import classes from "./Popover.module.css";

type Props = {
  /** title of popover */
  label: string;
  /** content of popup */
  content: ReactNode;
  /** trigger */
  children: ReactElement;
};

/**
 * popup of interactive content when hovering or focusing children. for use in
 * other components, not directly.
 */
const Popover = ({ label, content, children }: Props) => {
  /** set up zag */
  const [state, send] = useMachine(
    popover.machine({
      /** unique id for component instance */
      id: useId(),
      /** settings */
      positioning: {
        placement: "top",
      },
    }),
  );

  /** interact with zag */
  const api = popover.connect(state, send, normalizeProps);

  return (
    <>
      {/* children elements that trigger opening on hover/focus */}
      {cloneElement(children, {
        /** pass props necessary to trigger */
        ...api.triggerProps,
        /** make sure original props preserved */
        ...children.props,
        /** set aria label if trigger has no visible text */
        "aria-label": !renderText(children) ? label : undefined,
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
              {/* <div
                {...api.titleProps}
                className={classNames(classes.label, "primary", "bold")}
              >
                {label}
              </div>
              <button {...api.closeTriggerProps} className={classes.close}>
                <FaXmark />
              </button> */}
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
};

export default Popover;
