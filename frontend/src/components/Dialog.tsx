import type { ReactElement, ReactNode } from "react";
import { FaCircleXmark } from "react-icons/fa6";
import {
  Close,
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Title,
  Trigger,
} from "@radix-ui/react-dialog";
import Flex from "@/components/Flex";
import classes from "./Dialog.module.css";

type Props = {
  /** title of dialog */
  title: ReactNode;
  /** main content of dialog. gets scrollbar if it can't fit on screen. */
  content: ReactNode;
  /**
   * content at bottom of dialog, usually for actions. always visible (doesn't
   * get scrollbar).
   */
  bottomContent?: ReactNode;
  /** element that triggers dialog on click */
  children: ReactElement;
};

/** "fullscreen" dialog of interactive content when clicking children */
const Dialog = ({ title, content, bottomContent, children }: Props) => (
  <Root>
    <Trigger asChild>{children}</Trigger>
    <Portal>
      <div className={classes.fullscreen}>
        <Overlay className={classes.overlay} />
        <Content className={classes.content} asChild>
          <Flex direction="column">
            <Title>{title}</Title>
            <Description className="sr-only">{title}</Description>
            <Close className={classes.close}>
              <FaCircleXmark />
            </Close>
            <Flex className={classes.scroll} direction="column">
              {content}
            </Flex>
            <Flex hAlign="right" full>
              {bottomContent}
            </Flex>
          </Flex>
        </Content>
      </div>
    </Portal>
  </Root>
);

export default Dialog;
