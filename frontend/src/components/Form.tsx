import { createContext, useContext, useId } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEventListener } from "@reactuses/core";

type Props = {
  /** called when form submitted */
  onSubmit: () => unknown;
  /** children field elements. can be deeply nested. */
  children: ReactNode;
};

const FormContext = createContext<string | undefined>(undefined);
export const useForm = () => useContext(FormContext);

/** form wrapper around set of fields */
const Form = ({ onSubmit, children, ...props }: Props) => {
  /** unique id to link form and controls */
  const id = useId();

  usePreventImplicitSubmit();

  return (
    <>
      {/* enable useForm in any child inputs */}
      <FormContext.Provider value={id}>{children}</FormContext.Provider>

      {/* append actual form to end of document to avoid affecting layout and CSS selectors */}
      {createPortal(
        <form
          id={id}
          className="contents"
          onSubmit={(event) => {
            /** prevent page navigation */
            event.preventDefault();
            /** call callback */
            onSubmit();
          }}
          {...props}
        />,
        document.body,
      )}
    </>
  );
};

export default Form;

/** prevent implicit form submit */
const usePreventImplicitSubmit = () => {
  useEventListener("keydown", (event) => {
    const { key, target } = event;
    /** only on enter key */
    if (key !== "Enter") return;
    /** only on elements */
    if (!(target instanceof Element)) return;
    /** only on inputs */
    if (!target.matches("input")) return;
    /** only on submit button */
    if (target.matches("button[type='submit']")) return;
    /** prevent submit */
    event.preventDefault();
  });
  useEventListener("click", (event) => {
    const { target } = event;
    /** only on elements */
    if (!(target instanceof Element)) return;
    /** only on submit button */
    if (target.matches("button[type='submit']")) return;
    /** prevent submit */
    event.preventDefault();
  });
};
