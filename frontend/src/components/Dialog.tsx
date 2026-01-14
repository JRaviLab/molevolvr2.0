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
        <div className="fixed inset-0 z-30 flex items-center justify-center p-8">
          <Content as={Fragment}>
            <div className="shadow-overlay relative flex max-h-full w-(--content) max-w-full flex-col gap-4 rounded bg-white p-4">
              <Title>{title}</Title>
              <Description className="sr-only">{title}</Description>
              <button
                className="text-gray absolute top-2 right-2 p-2"
                onClick={close}
              >
                <FaCircleXmark />
              </button>
              <div className="flex w-full flex-col gap-4 overflow-y-auto">
                {typeof content === "function" ? content(close, open) : content}
              </div>
              {bottomContent && (
                <div className="flex flex-wrap items-center gap-4">
                  {typeof bottomContent === "function"
                    ? bottomContent(close, open)
                    : bottomContent}
                </div>
              )}
            </div>
          </Content>
        </div>
      </Root>
    </>
  );
};

export default Dialog;
