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
export default function Tooltip({ ref, content, children, ...props }: Props) {
  if (!content) return children;

  return (
    <Provider delayDuration={100} disableHoverableContent>
      <Root>
        {/* allows nesting tooltip within popover https://github.com/radix-ui/primitives/discussions/560#discussioncomment-5325935 */}
        <Trigger asChild ref={ref} aria-label={renderText(content)} {...props}>
          {children}
        </Trigger>

        <Portal>
          <Content
            ref={(element) => {
              /**
               * radix ui tooltip puts two children at end that aren't part of
               * text content
               */
              shrinkWrap(element, 0, -3);
            }}
            className="z-20 flex max-w-80 flex-col gap-2 rounded-md bg-black p-4 text-white"
            side="top"
          >
            {content}
            <Arrow className="scale-110 fill-black" />
          </Content>
        </Portal>
      </Root>
    </Provider>
  );
}
