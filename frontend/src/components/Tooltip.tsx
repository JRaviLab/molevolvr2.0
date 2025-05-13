import type { ReactElement, ReactNode, Ref } from "react";
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
  ref?: Ref<HTMLButtonElement>;
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
 * focusing children
 */
const Tooltip = ({ ref, content, children, ...props }: Props) => {
  if (!content) return children;

  return (
    <Provider delayDuration={100} disableHoverableContent>
      <Root>
        {/* allows nesting tooltip within popover https://github.com/radix-ui/primitives/discussions/560#discussioncomment-5325935 */}
        <Trigger asChild ref={ref} {...props} aria-label={renderText(content)}>
          {children}
        </Trigger>

        <Portal>
          <Content
            ref={(el) => {
              /**
               * radix ui tooltip puts two children at end that aren't part of
               * text content
               */
              shrinkWrap(el, 0, -3);
            }}
            className={classes.content}
            side="top"
            data-dark="true"
          >
            {content}
            <Arrow className={classes.arrow} />
          </Content>
        </Portal>
      </Root>
    </Provider>
  );
};

export default Tooltip;
