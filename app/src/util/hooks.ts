import { useEffect, useRef } from "react";

/** listen for changes to dom */
export const useMutation = (
  /** element to listen to (otherwise use returned ref) */
  element: Element | undefined,
  options: MutationObserverInit | undefined,
  callback: MutationCallback,
) => {
  const ref = useRef(null);

  useEffect(() => {
    const target = element || ref.current;
    if (!target) return;
    const observer = new MutationObserver(callback);
    observer.observe(target, options);
    return () => {
      observer.disconnect();
    };
  });

  return ref;
};
