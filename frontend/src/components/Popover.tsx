import type { ReactElement, ReactNode } from "react";
import { Arrow, Content, Portal, Root, Trigger } from "@radix-ui/react-popover";

type Props = {
  /** content of popup */
  content: ReactNode;
  /** element that triggers popup on click */
  children: ReactElement;
};

/** popup of interactive content when hovering or focusing children */
const Popover = ({ content, children }: Props) => {
  return (
    <Root>
      <Trigger asChild>{children}</Trigger>
      <Portal>
        <Content
          className="
            z-30 flex max-w-100 flex-col gap-4 rounded-sm bg-white p-4
            shadow-overlay
          "
          side="top"
          onFocusCapture={(event) => {
            /** https://github.com/radix-ui/primitives/issues/2248 */
            event.stopPropagation();
          }}
        >
          {content}
          <Arrow className="fill-white" />
        </Content>
      </Portal>
    </Root>
  );
};

export default Popover;
