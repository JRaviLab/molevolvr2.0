import type { CSSProperties } from "react";
import { useId } from "react";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";
import { useEvent } from "react-use";
import classNames from "classnames";
import { uniqueId } from "lodash";
import { normalizeProps, Portal, useActor, useMachine } from "@zag-js/react";
import * as toast from "@zag-js/toast";
import Loading from "@/assets/loading.svg?react";
import classes from "./Toasts.module.css";

/** list of "toasts" (notifications) in corner of screen. singleton. */
const Toasts = () => {
  /** set up zag */
  const [state, send] = useMachine(
    toast.group.machine<ToastProps>({
      /** unique id for component instance */
      id: useId(),
    }),
  );

  /** interact with zag */
  const api = toast.group.connect(state, send, normalizeProps);

  /** listen for global toast window event */
  useEvent("toast", (event: CustomEvent<ToastProps>) =>
    api.upsert(event.detail),
  );

  return (
    <Portal>
      {!!api.toasts.length && (
        <div
          {...api.getGroupProps({ placement: "bottom-end" })}
          className={classes.list}
        >
          {api.toasts.map((toast, index) => (
            <Toast key={index} actor={toast} />
          ))}
        </div>
      )}
    </Portal>
  );
};

export default Toasts;

/** individual toast box */
const Toast = ({ actor }: { actor: toast.Service<ToastProps> }) => {
  /** set up zag */
  const [state, send] = useActor(actor);

  /** interact with zag */
  const api = toast.connect(state, send, normalizeProps);

  const { _type = "info", text } = state.context || {};

  return (
    <div
      {...api.rootProps}
      className={classNames(classes.toast, "card")}
      style={{ "--color": types[_type].color } as CSSProperties}
    >
      {/* type icon */}
      {types[_type].icon}
      {/* content */}
      <div {...api.titleProps}>{text}</div>
      {/* x */}
      <button onClick={api.dismiss}>
        <FaXmark />
      </button>
    </div>
  );
};

/** available categories of toasts and associated styles */
const types = {
  info: { color: "var(--deep)", icon: <FaCircleInfo /> },
  loading: { color: "var(--deep)", icon: <Loading /> },
  success: { color: "var(--success)", icon: <FaCircleCheck /> },
  warning: { color: "var(--warning)", icon: <FaCircleExclamation /> },
  error: { color: "var(--error)", icon: <FaTriangleExclamation /> },
};

type ToastProps = {
  /** id/name to de-duplicate by */
  id: string;
  /** determines icon and style */
  _type: keyof typeof types;
  /** content */
  text: string;
} & toast.ToastOptions;

/** emit global toast event for toast component to listen for */
const makeToast = (
  text: ToastProps["text"],
  type?: ToastProps["_type"],
  id?: ToastProps["id"],
) =>
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: {
        id: id || uniqueId(),
        _type: type || "info",
        type: "custom",
        text,
      } satisfies ToastProps,
    }),
  );

export { makeToast as toast };
