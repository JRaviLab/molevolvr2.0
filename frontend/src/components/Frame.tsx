import type { ComponentProps, ReactNode, Ref } from "react";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { useDebounce, useElementSize, useMergedRefs } from "@reactuses/core";
import clsx from "clsx";
import { clamp } from "lodash";
import { RotateCcw } from "lucide-react";
import Button from "@/components/Button";
import Tooltip from "@/components/Tooltip";
import { usePrint } from "@/util/hooks";

type Props = {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode | ((props: ChildrenProps) => ReactNode);
} & ComponentProps<"div">;

type ChildrenProps = {
  /** chart container width */
  width: number;
  /** available (usually page) width */
  parentWidth: number;
};

/** resizable frame */
export default function Frame({
  ref: passedRef,
  className,
  children,
  ...props
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(passedRef, ref);

  /** sizes */
  let [width] = useElementSize(ref);
  let [parentWidth] = useElementSize(() => ref.current?.parentElement);

  /** avoid too-frequent layout changes and flashing scrollbar */
  width = useDebounce(width, 50);
  parentWidth = useDebounce(parentWidth, 50);

  /** limit width */
  width = clamp(width, 10, 10000);
  parentWidth = clamp(parentWidth, 10, 10000);

  const { printing } = usePrint();

  /** chart content */
  const chart = (
    // rely on component consumer handling keyboard appropriately
    <div
      ref={mergedRef}
      className={clsx(
        "relative grid resize place-items-center overflow-auto p-4 *:col-start-1 *:row-start-1 [&:is([style*='width'],[style*='height'])>.reset-handle]:grid",
        printing
          ? "aspect-auto h-screen max-h-none min-h-0 w-auto max-w-none min-w-0 resize-none overflow-visible rounded-none border-0 bg-white p-0 shadow-none"
          : "rounded-md bg-white shadow-md",
        className,
      )}
      // https://github.com/dequelabs/axe-core/issues/4566
      tabIndex={0}
      {...props}
    >
      {typeof children === "function"
        ? children({ width, parentWidth })
        : children}

      {/* reset handle */}
      <Tooltip content="Reset size">
        {/* Sticky zero-size anchor keeps the button pinned to the scroll viewport corner. */}
        <Button
          design="hollow"
          tooltip="Reset size"
          /* eslint-disable better-tailwindcss/no-unknown-classes */
          className="reset-handle sticky right-0 bottom-0 z-10 hidden translate-4 place-self-end"
          onClick={() => {
            /** reset resize */
            const target = ref.current;
            if (!target) return;
            target.style.width = String(props.style?.width ?? "");
            target.style.height = "";
          }}
        >
          <RotateCcw />
        </Button>
      </Tooltip>
    </div>
  );

  if (printing) return createPortal(chart, document.body);

  return chart;
}
