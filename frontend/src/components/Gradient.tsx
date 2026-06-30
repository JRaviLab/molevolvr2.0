import type { ComponentProps } from "react";
import type { Option } from "@/components/SelectSingle";
import type { Id } from "@/util/gradient";
import { useId } from "react";
import { range } from "lodash";
import { gradientFunc, gradients } from "@/util/gradient";

type Props = {
  id: Id;
  reverse?: boolean;
  direction?: "horizontal" | "vertical";
} & ComponentProps<"svg">;

/** gradient */
export function Gradient({
  id,
  reverse = false,
  direction = "horizontal",
  ...props
}: Props) {
  const gradientId = useId();

  return (
    <svg viewBox="0 0 10 10" preserveAspectRatio="none" {...props}>
      <defs>
        <linearGradient
          id={gradientId}
          gradientTransform={direction === "vertical" ? "rotate(90)" : ""}
        >
          {range(0, 1, 0.1)
            .concat([1])
            .map((percent, index) => (
              <stop
                key={index}
                offset={`${100 * percent}%`}
                stopColor={gradientFunc(id, reverse)(percent)}
              />
            ))}
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={10} height={10} fill={`url(#${gradientId})`} />
    </svg>
  );
}

/** gradient options for select */
export const gradientOptions = (reverse: boolean): Option<Id>[] =>
  Object.keys(gradients).map((id) => ({
    id: id as Id,
    primary: id,
    icon: <Gradient id={id as Id} reverse={reverse} width="3em" height="1em" />,
  }));
