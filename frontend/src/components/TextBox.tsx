import { useId, useRef } from "react";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { FaRegCopy, FaXmark } from "react-icons/fa6";
import { useElementBounding } from "@reactuses/core";
import Asterisk from "@/components/Asterisk";
import Button from "@/components/Button";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import { toast } from "@/components/Toasts";
import Tooltip from "@/components/Tooltip";

type Props = Base & (Single | Multi) & Description;

type Base = {
  /** hint icon to show on side */
  icon?: ReactElement;
  /** text state */
  value: string;
  /** on text state change */
  onChange: (value: string) => void;
};

type Description =
  /** require label and/or tooltip for accessibility */
  | { label: ReactNode; tooltip?: ReactNode }
  | { label?: ReactNode; tooltip: ReactNode };

type Single = {
  /** single line */
  multi?: false;
} & Pick<
  ComponentProps<"input">,
  "placeholder" | "type" | "autoComplete" | "required"
>;

type Multi = {
  /** multi-line */
  multi: true;
} & Pick<
  ComponentProps<"textarea">,
  "placeholder" | "autoComplete" | "required"
>;

/** single or multi-line text input box */
const TextBox = ({
  label,
  tooltip,
  multi,
  icon,
  value,
  onChange,
  ...props
}: Props) => {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);

  /** link to parent form component */
  const form = useForm();

  /** unique id for field */
  const id = useId();

  /** side elements */
  let sideElements: ReactNode = "";
  if (value)
    sideElements = (
      <>
        {multi && (
          <Button
            design="hollow"
            className="rounded-none"
            tooltip="Copy text"
            icon={<FaRegCopy />}
            onClick={async () => {
              await window.navigator.clipboard.writeText(value);
              toast("Copied text", "success");
            }}
          />
        )}
        <Button
          design="hollow"
          className="rounded-none"
          tooltip="Clear text"
          icon={<FaXmark />}
          onClick={() => {
            if (ref.current) ref.current.value = "";
            onChange("");
          }}
        />
      </>
    );
  else if (icon)
    sideElements = <div className="grid place-items-center">{icon}</div>;

  /** extra padding needed for side element */
  const sidePadding = useElementBounding(sideRef).width;

  /** input field */
  const input = multi ? (
    <textarea
      ref={ref}
      id={id}
      className="
        min-h-[calc(var(--leading-normal)*3em+--spacing(4)+4px)] grow resize
        rounded-sm border-2 border-off-white bg-white p-2
        hover:border-accent
      "
      style={{ paddingRight: sidePadding ? sidePadding : "" }}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      form={form}
      {...props}
    />
  ) : (
    <input
      ref={ref}
      id={id}
      className="
        grow rounded-sm border-2 border-off-white bg-white p-2
        hover:border-accent
      "
      style={{ paddingRight: sidePadding ? sidePadding : "" }}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      form={form}
      {...props}
    />
  );

  return (
    <>
      {(label || props.required) && (
        <label
          className="
            flex min-h-[calc(var(--leading-normal)*1em+--spacing(4)+4px)]
            items-center gap-1
          "
          htmlFor={id}
        >
          {label}
          {tooltip && <Help tooltip={tooltip} />}
          {props.required && <Asterisk />}
        </label>
      )}

      {/* if no label but need tooltip, put it around input */}
      <Tooltip content={!label && tooltip ? tooltip : undefined}>
        <div className="relative flex items-start">
          {input}

          {/* side element */}
          <div
            ref={sideRef}
            className="
              absolute inset-y-1.5 right-1.5 flex items-start text-dark-gray
              *:size-8
            "
          >
            {sideElements}
          </div>
        </div>
      </Tooltip>
    </>
  );
};

export default TextBox;
