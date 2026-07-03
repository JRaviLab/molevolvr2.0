import type { ReactElement, ReactNode } from "react";
import { Arrow, Content, Portal, Root, Trigger } from "@radix-ui/react-popover";
import { clsx } from "clsx";

type Props = {
  /** content of popup */
  content: ReactNode;
  /** element that triggers popup on click */
  children: ReactElement;
  /** class on content */
  className?: string;
};

/** popup of interactive content when hovering or focusing children */
export default function Popover({ content, children, className }: Props) {
  return (
    <Root>
      <Trigger asChild>{children}</Trigger>
      <Portal>
        <Content
          className={clsx(
            "z-20 flex max-w-100 flex-col gap-4 rounded-md bg-white p-4 shadow-overlay",
            className,
          )}
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
}
