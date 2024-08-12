import type { ReactElement, ReactNode } from "react";
import { forwardRef } from "react";
import {
  Arrow,
  Content,
  Portal,
  Provider,
  Root,
  Trigger,
} from "@radix-ui/react-tooltip";
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
        <Provider delayDuration={200}>
          <Root>
            {/* allows nesting tooltip within popover https://github.com/radix-ui/primitives/discussions/560#discussioncomment-5325935 */}
            <Trigger
              asChild
              ref={ref}
              {...props}
              aria-label={renderText(content)}
            >
              {children}
            </Trigger>

            <Portal>
              <Content
                ref={(element) => {
                  window.setTimeout(() => shrinkWrap(element));
                  return element;
                }}
                className={classes.content}
                side="top"
              >
                {content}
                <Arrow className={classes.arrow} />
              </Content>
            </Portal>
          </Root>
        </Provider>
      );
    else return children;
  },
);

export default Tooltip;
