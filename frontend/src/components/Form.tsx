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

  /** prevent implicit form submit from pressing enter on input */
  useEventListener("keydown", (event) => {
    if (
      event.key === "Enter" &&
      event.target instanceof Element &&
      event.target.matches("input")
    )
      /** prevent submit */
      event.preventDefault();
  });

  return (
    <>
      {/* enable useForm in any child inputs */}
      <FormContext.Provider value={id}>{children}</FormContext.Provider>

      {/* append actual form to end of document to avoid affecting layout and css selectors */}
      {createPortal(
        <form
          id={id}
          className="contents"
          onSubmit={(event) => {
            /** prevent page navigation */
            event.preventDefault();

            /** only submit if triggered by a submit button */
            if (
              event.nativeEvent instanceof SubmitEvent &&
              event.nativeEvent.submitter?.matches("button[type='submit']")
            )
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
