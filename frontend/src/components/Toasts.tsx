import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";
import { atom, getDefaultStore, useAtomValue } from "jotai";
import { uniqueId } from "lodash";
import Button from "@/components/Button";
import { renderText } from "@/util/dom";
import { sleep } from "@/util/misc";

/** available categories of toasts and associated styles */
const types = {
  info: {
    color: "var(--color-info)",
    icon: <FaCircleInfo />,
    timeout: 5,
  },
  success: {
    color: "var(--color-success)",
    icon: <FaCircleCheck />,
    timeout: 3,
  },
  warning: {
    color: "var(--color-warning)",
    icon: <FaCircleExclamation />,
    timeout: 5,
  },
  error: {
    color: "var(--color-error)",
    icon: <FaTriangleExclamation />,
    timeout: 20,
  },
};

type Toast = {
  /** id/name to de-duplicate by */
  id: string;
  /** determines icon and style */
  type: keyof typeof types;
  /** content */
  content: ReactNode;
  /** close timer */
  timer: number;
};

/** list of "toasts" (notifications) in corner of screen. singleton. */
const Toasts = () => {
  const toasts = useAtomValue(toastsAtom);

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed right-0 bottom-0 z-40 flex flex-col gap-4 p-4"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast, index) => (
        <div
          key={index}
          className="grid grid-cols-[min-content_1fr_min-content] items-center rounded bg-white shadow"
          style={{ color: types[toast.type].color }}
        >
          <div className="p-4">{types[toast.type].icon}</div>
          <div
            className="text-black"
            role={toast.type === "error" ? "alert" : "status"}
          >
            {toast.content}
          </div>
          <Button
            design="hollow"
            icon={<FaXmark />}
            tooltip="Dismiss notification"
            onClick={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>,
    document.body,
  );
};

export default Toasts;

/** global toasts */
const toastsAtom = atom<Toast[]>([]);

/** add toast to end */
const addToast = (toast: Toast) => {
  removeToast(toast.id);
  const newToasts = getDefaultStore().get(toastsAtom).concat([toast]);
  getDefaultStore().set(toastsAtom, newToasts);
};

/** remove toast by id */
const removeToast = (id: Toast["id"]) => {
  const newToasts = getDefaultStore()
    .get(toastsAtom)
    .filter((toast) => {
      const existing = toast.id === id;
      if (existing) window.clearTimeout(toast.timer);
      return !existing;
    });
  getDefaultStore().set(toastsAtom, newToasts);
};

/** add toast to global queue */
const toast = async (
  content: Toast["content"],
  type: Toast["type"] = "info",
  id?: Toast["id"],
) => {
  /** make sure to set state outside of render */
  await sleep();

  /** timeout before close, in ms */
  const timeout = 1000 * types[type].timeout + 10 * renderText(content).length;

  const newToast = {
    id: id ?? uniqueId(),
    type: type ?? "info",
    content,
    timer: window.setTimeout(() => removeToast(newToast.id), timeout),
  };
  addToast(newToast);
};

export { toast };
