import type { ComponentProps, ReactElement, ReactNode } from "react";
import type { RequireAtLeastOne } from "type-fest";
import { useId, useRef } from "react";
import { useElementBounding } from "@reactuses/core";
import { Copy, X } from "lucide-react";
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
  /** require some kind of accessible label */
  RequireAtLeastOne<{
    label: ReactNode;
    tooltip: ReactNode;
    placeholder: string;
  }>;

type Single = {
  /** single line */
  multi?: false;
} & Pick<ComponentProps<"input">, "type" | "autoComplete" | "required">;

type Multi = {
  /** multi-line */
  multi: true;
} & Pick<ComponentProps<"textarea">, "autoComplete" | "required">;

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
  let side: ReactNode = "";
  if (value)
    side = (
      <>
        {multi && (
          <Button
            design="hollow"
            className="rounded-none"
            tooltip="Copy text"
            icon={<Copy />}
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
          icon={<X />}
          onClick={() => {
            if (ref.current) ref.current.value = "";
            onChange("");
          }}
        />
      </>
    );
  else if (icon)
    side = (
      <>
        {multi && <div />}
        <div>{icon}</div>
      </>
    );
  else
    side = (
      <>
        {multi && <div />}
        <div />
      </>
    );

  /** extra padding needed for side element */
  const sidePadding = useElementBounding(sideRef).width;

  /** input field */
  const input = multi ? (
    <textarea
      ref={ref}
      id={id}
      className="
        min-h-[calc(3lh+--spacing(4)+2px)] grow resize rounded-md border
        border-light-gray bg-white p-2
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
        grow rounded-md border border-light-gray bg-white p-2
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
        <label className="flex items-center gap-1" htmlFor={id}>
          {label}
          {tooltip && <Help tooltip={tooltip} />}
          {props.required && <Asterisk />}
        </label>
      )}

      {/* if no label but need tooltip, put it around input */}
      <Tooltip content={!label && tooltip ? tooltip : undefined}>
        <div className="relative flex items-start">
          {input}
          <div
            ref={sideRef}
            className="
              absolute top-0 right-0 flex items-start text-dark-gray
              *:grid *:size-[calc(var(--leading-normal)*1em+--spacing(4)+2px)]
              *:place-items-center *:p-0
            "
          >
            {side}
          </div>
        </div>
      </Tooltip>
    </>
  );
};

export default TextBox;
