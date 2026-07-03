import type { ComponentProps, ReactElement, ReactNode } from "react";
import { cloneElement, Fragment, useState } from "react";
import {
  DialogPanel as Content,
  Description,
  Dialog as Root,
  DialogTitle as Title,
} from "@headlessui/react";
import { X } from "lucide-react";
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
  children: ReactElement<ComponentProps<"button">>;
};

type Content = ReactNode | ((close: () => void, open: () => void) => ReactNode);

/** "fullscreen" dialog of interactive content when clicking children */
export default function Dialog({
  title,
  content,
  bottomContent,
  onChange,
  children,
}: Props) {
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
      {cloneElement(children, {
        onClick: open,
        /** prevent implicit submission of wrapping form */
        type: "button",
      })}
      <Root as={Fragment} open={isOpen} onClose={close}>
        <div className="fixed inset-0 z-20 flex items-center justify-center p-8">
          <Content as={Fragment}>
            <div className="relative flex size-full max-h-max max-w-max flex-col rounded-md bg-white shadow-overlay">
              {/* top */}
              <div className="flex items-center justify-center gap-4 p-4 shadow-md">
                <Title className="m-0 grow">{title}</Title>
                <Description className="sr-only">{title}</Description>
                <Button design="hollow" tooltip="Close dialog" onClick={close}>
                  <X />
                </Button>
              </div>

              {/* middle */}
              <div className="flex flex-col gap-4 overflow-y-auto p-4">
                {typeof content === "function" ? content(close, open) : content}
              </div>

              {/* bottom */}
              {bottomContent && (
                <div className="flex flex-wrap items-center justify-center gap-4 p-4 shadow-md">
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
}
