import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { atom, getDefaultStore, useAtomValue } from "jotai";
import { uniqueId } from "lodash";
import { X } from "lucide-react";
import Button from "@/components/Button";
import { types } from "@/components/Mark";
import { renderText } from "@/util/dom";
import { sleep } from "@/util/misc";

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

/** timeout for each toast type */
const timeouts: Record<keyof typeof types, number> = {
  info: 5,
  loading: 5,
  success: 3,
  warning: 5,
  error: 20,
  analyzing: 5,
};

/** list of "toasts" (notifications) in corner of screen. singleton. */
const Toasts = () => {
  const toasts = useAtomValue(toastsAtom);

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed right-0 bottom-0 z-30 flex flex-col gap-4 p-4"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="
            grid grid-cols-[min-content_1fr_min-content] items-center rounded-md
            bg-white shadow-sm
          "
          style={{ color: types[toast.type].color }}
        >
          <div className="p-4">{types[toast.type].icon}</div>
          <div className="text-black" role="alert">
            {toast.content}
          </div>
          <Button
            icon={<X />}
            tooltip="Dismiss notification"
            design="hollow"
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
export const toast = async (
  content: Toast["content"],
  type: Toast["type"] = "info",
  id?: Toast["id"],
) => {
  /** make sure to set state outside of render */
  await sleep();

  /** timeout before close, in ms */
  const timeout = 1000 * timeouts[type] + 10 * renderText(content).length;

  const newToast = {
    id: id ?? uniqueId(),
    type: type ?? "info",
    content,
    timer: window.setTimeout(() => removeToast(newToast.id), timeout),
  };
  addToast(newToast);
};
