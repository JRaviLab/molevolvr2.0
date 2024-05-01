import type { ReactNode } from "react";
import { createContext, useContext, useId } from "react";
import { createPortal } from "react-dom";
import { checkboxKeySuffix } from "@/components/CheckBox";

export type FormData = Record<
  string,
  string | number | boolean | (string | number | boolean)[]
>;

type Props = {
  /** called when form submitted */
  onSubmit: (data: FormData) => unknown;
  /** children field elements. can be deeply nested. */
  children: ReactNode;
};

const FormContext = createContext<string | undefined>(undefined);
export const useForm = () => useContext(FormContext);

/** form wrapper around set of fields */
const Form = ({ onSubmit, children, ...props }: Props) => {
  /** unique id to link form and controls */
  const id = useId();

  return (
    <>
      {/* enable useForm in any child inputs */}
      <FormContext.Provider value={id}>{children}</FormContext.Provider>

      {/* append actual form to end of document to avoid affecting layout and CSS selectors */}
      {createPortal(
        <form
          id={id}
          style={{ display: "contents" }}
          onSubmit={(event) => {
            /** get data from form */
            event.preventDefault();
            const form = event.currentTarget;
            const formData = new FormData(form);

            /**
             * loop through keys and values to transform form data into nicer
             * format. don't do fromEntries because keys with same name (e.g. in
             * multi-select) get overwritten.
             */
            const data: FormData = {};
            for (let key of formData.keys()) {
              /** determine if checkbox from key name */
              const isCheckbox = key.endsWith(checkboxKeySuffix);

              const values = formData.getAll(key).map((value) => {
                /** if we can parse as number, do it */
                if (
                  typeof value === "string" &&
                  value.trim() &&
                  !Number.isNaN(Number(value))
                )
                  return Number(value);

                /** return actual boolean for checkboxes instead of default "on" */
                if (isCheckbox) return Boolean(value);

                /** return raw (string) value */
                return String(value);
              });

              /** remove checkbox marker */
              if (isCheckbox)
                key = key.replace(new RegExp(checkboxKeySuffix + "$"), "");

              /** assign single primitive or multi array */
              data[key] = values.length === 1 ? values[0]! : values;
            }

            /** call callback */
            onSubmit(data);
          }}
          {...props}
        />,
        document.body,
      )}
    </>
  );
};

export default Form;
