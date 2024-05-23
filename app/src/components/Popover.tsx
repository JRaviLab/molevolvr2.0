import type { ReactElement, ReactNode } from "react";
import * as Radix from "@radix-ui/react-popover";
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
    <Radix.Root>
      <Radix.Trigger asChild>{children}</Radix.Trigger>
      <Radix.Portal>
        <Radix.Content className={classes.content} side="top">
          {content}
          <Radix.Arrow className={classes.arrow} />
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
};

export default Popover;
