import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";
import clsx from "clsx";
import { atom, getDefaultStore, useAtomValue } from "jotai";
import { uniqueId } from "lodash";
import Flex from "@/components/Flex";
import { renderText } from "@/util/dom";
import { sleep } from "@/util/misc";
import classes from "./Toasts.module.css";

/** available categories of toasts and associated styles */
const types = {
  info: { color: "var(--deep)", icon: <FaCircleInfo />, timeout: 5 },
  success: { color: "var(--success)", icon: <FaCircleCheck />, timeout: 3 },
  warning: {
    color: "var(--warning)",
    icon: <FaCircleExclamation />,
    timeout: 5,
  },
  error: {
    color: "var(--error)",
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
    <Flex
      className={classes.toasts}
      column
      hAlign="stretch"
      gap="sm"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast, index) => (
        <div
          key={index}
          className={clsx("card", classes.toast)}
          style={{ "--color": types[toast.type].color } as CSSProperties}
        >
          {types[toast.type].icon}
          <div role={toast.type === "error" ? "alert" : "status"}>
            {toast.content}
          </div>
          <button onClick={() => removeToast(toast.id)}>
            <FaXmark />
          </button>
        </div>
      ))}
    </Flex>,
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
