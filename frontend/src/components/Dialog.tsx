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
import Button from "@/components/Button";

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
        <div className="fixed inset-0 z-20 flex items-center justify-center p-8">
          <Content as={Fragment}>
            <div
              className="
                relative flex max-h-full w-(--content) max-w-full flex-col
                rounded-md bg-white shadow-overlay
              "
            >
              {/* top */}
              <div className="flex items-center justify-center p-2 shadow-sm">
                <Title>{title}</Title>
                <Description className="sr-only">{title}</Description>
                <Button
                  design="hollow"
                  tooltip="Close dialog"
                  icon={<FaCircleXmark />}
                  className="text-gray"
                  onClick={close}
                />
              </div>

              {/* middle */}
              <div className="flex w-full flex-col gap-4 overflow-y-auto p-4">
                {typeof content === "function" ? content(close, open) : content}
              </div>

              {/* bottom */}
              {bottomContent && (
                <div
                  className="
                    flex flex-wrap items-center justify-center gap-4 p-4
                    shadow-sm
                  "
                >
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
