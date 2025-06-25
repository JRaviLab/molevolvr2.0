import {
  cloneElement,
  Fragment,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { FaCircleXmark } from "react-icons/fa6";
import {
  DialogPanel as Content,
  Description,
  Dialog as Root,
  DialogTitle as Title,
} from "@headlessui/react";
import Flex from "@/components/Flex";
import classes from "./Dialog.module.css";

type Props = {
  /** title of dialog */
  title: ReactNode;
  /** main content of dialog. gets scrollbar if it can't fit on screen. */
  content: Content;
  /**
   * content at bottom of dialog, usually for actions. always visible (doesn't
   * get scrollbar).
   */
  bottomContent?: Content;
  /** when open state changes */
  onChange?: (open: boolean) => void;
  /** element that triggers dialog on click */
  children: ReactElement<{ onClick: () => void }>;
};

type Content = ReactNode | ((close: () => void, open: () => void) => ReactNode);

/** "fullscreen" dialog of interactive content when clicking children */
const Dialog = ({
  title,
  content,
  bottomContent,
  onChange,
  children,
}: Props) => {
  const [isOpen, setOpen] = useState(false);
  const open = () => {
    setOpen(true);
    onChange?.(true);
  };
  const close = () => {
    setOpen(false);
    onChange?.(false);
  };

  return (
    <>
      {cloneElement(children, { onClick: open })}
      <Root open={isOpen} onClose={close}>
        <div className={classes.fullscreen}>
          <Content as={Fragment}>
            <Flex direction="column" className={classes.content}>
              <Title>{title}</Title>
              <Description className="sr-only">{title}</Description>
              <button className={classes.close} onClick={close}>
                <FaCircleXmark />
              </button>
              <Flex
                className={classes.scroll}
                direction="column"
                vAlign="top"
                full
              >
                {typeof content === "function" ? content(close, open) : content}
              </Flex>
              {bottomContent && (
                <Flex hAlign="right" full>
                  {typeof bottomContent === "function"
                    ? bottomContent(close, open)
                    : bottomContent}
                </Flex>
              )}
            </Flex>
          </Content>
        </div>
      </Root>
    </>
  );
};

export default Dialog;
