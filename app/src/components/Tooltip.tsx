import type { ReactElement, ReactNode } from "react";
import { forwardRef } from "react";
import * as Radix from "@radix-ui/react-tooltip";
import { renderText, shrinkWrap } from "@/util/dom";
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
const Tooltip = forwardRef<HTMLButtonElement, Props>(
  ({ content, children, ...props }: Props, ref) => {
    if (content)
      return (
        <Radix.Provider delayDuration={200}>
          <Radix.Root>
            {/* allows nesting tooltip within popover https://github.com/radix-ui/primitives/discussions/560#discussioncomment-5325935 */}
            <Radix.Trigger
              asChild
              ref={ref}
              {...props}
              aria-label={renderText(content)}
            >
              {children}
            </Radix.Trigger>

            <Radix.Portal>
              <Radix.Content
                ref={(element) => {
                  window.setTimeout(() => shrinkWrap(element));
                  return element;
                }}
                className={classes.content}
                side="top"
              >
                {content}
                <Radix.Arrow className={classes.arrow} />
              </Radix.Content>
            </Radix.Portal>
          </Radix.Root>
        </Radix.Provider>
      );
    else return children;
  },
);

export default Tooltip;
