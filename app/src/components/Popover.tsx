import type { ReactElement, ReactNode } from "react";
import { Arrow, Content, Portal, Root, Trigger } from "@radix-ui/react-popover";
import classes from "./Popover.module.css";

type Props = {
  /** content of popup */
  content: ReactNode;
  /** element that triggers popup on click */
  children: ReactElement;
};

/**
 * popup of interactive content when hovering or focusing children. for use in
 * other components, not directly.
 */
const Popover = ({ content, children }: Props) => {
  return (
    <Root>
      <Trigger asChild>{children}</Trigger>
      <Portal>
        <Content className={classes.content} side="top">
          {content}
          <Arrow className={classes.arrow} />
        </Content>
      </Portal>
    </Root>
  );
};

export default Popover;
