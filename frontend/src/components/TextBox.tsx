import type { ComponentProps, ReactElement, ReactNode } from "react";
import type { RequireAtLeastOne } from "type-fest";
import { useId, useRef } from "react";
import { useElementBounding } from "@reactuses/core";
import { clsx } from "clsx";
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
  /** class on root */
  className?: string;
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
} & Omit<ComponentProps<"input">, "onChange">;

type Multi = {
  /** multi-line */
  multi: true;
} & Omit<ComponentProps<"textarea">, "onChange">;

/** single or multi-line text input box */
export default function TextBox({
  label,
  tooltip,
  multi,
  icon,
  value,
  onChange,
  className,
  ...props
}: Props) {
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
            className="translate-x-2"
            design="hollow"
            tooltip="Copy text"
            onClick={async () => {
              await window.navigator.clipboard.writeText(value);
              toast("Copied text", "success");
            }}
          >
            <Copy />
          </Button>
        )}
        <Button
          design="hollow"
          tooltip="Clear text"
          onClick={() => onChange("")}
        >
          <X />
        </Button>
      </>
    );
  else if (icon) side = <div>{icon}</div>;

  /** extra padding needed for side element */
  const sidePadding = useElementBounding(sideRef).width;

  /** input field */
  const input = multi ? (
    <textarea
      id={id}
      className="size-full p-2"
      style={{ paddingRight: sidePadding ? sidePadding : "" }}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={3}
      form={form}
      {...(props as ComponentProps<"textarea">)}
    />
  ) : (
    <input
      id={id}
      className="size-full h-10 p-2"
      style={{ paddingRight: sidePadding ? sidePadding : "" }}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      form={form}
      {...(props as ComponentProps<"input">)}
    />
  );
  return (
    <div className={clsx("flex gap-2", className)}>
      {(label || props.required) && (
        <label className="flex items-center gap-2" htmlFor={id}>
          {label}
          {tooltip && <Help tooltip={tooltip} />}
          {props.required && <Asterisk />}
        </label>
      )}

      {/* if no label but need tooltip, put it around input */}
      <Tooltip content={!label && tooltip ? tooltip : undefined}>
        <div
          className={clsx(
            "relative flex min-h-10 overflow-hidden rounded-md border border-light-gray bg-white hover:border-accent has-[input:focus-visible]:focus has-[textarea:focus-visible]:focus",
            multi && "resize",
          )}
        >
          {input}
          <div
            ref={sideRef}
            className="absolute -top-px right-0 flex text-dark-gray *:grid *:size-10 *:place-items-center"
          >
            {side}
          </div>
        </div>
      </Tooltip>
    </div>
  );
}
