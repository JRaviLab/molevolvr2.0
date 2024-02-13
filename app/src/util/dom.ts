import type { ReactNode } from "react";
import reactToText from "react-to-text";
import { sleep } from "@/util/misc";

/** wait for element matching selector to appear, checking periodically */
export const waitFor = async <El extends Element>(
  selector: string,
): Promise<El | undefined> => {
  const waits = [
    0, 1, 5, 10, 20, 30, 40, 50, 100, 200, 300, 400, 500, 1000, 2000, 3000,
  ];
  while (waits.length) {
    const match = document.querySelector<El>(selector);
    if (match) return match;
    await sleep(waits.shift());
  }
};

/** scroll to element by selector */
export const scrollTo = async (selector: string) => {
  /** wait for element to appear */
  const element = await waitFor(selector);
  if (!element) return;

  /** wait for layout shifts */
  await sleep(100);

  /** scroll to element */
  element.scrollIntoView({ behavior: "smooth" });
};

/** restart animations on element */
export const restartAnimations = (element: Element): void => {
  for (const animation of document.getAnimations()) {
    if (
      animation.effect instanceof KeyframeEffect &&
      element.contains(animation.effect.target)
    ) {
      animation.cancel();
      animation.play();
    }
  }
};

/** get text content of react node */
export const renderText = (node: ReactNode) => {
  /** try normally */
  let text = reactToText(node);
  if (text.trim()) return text.trim();

  /** https://github.com/lhansford/react-to-text/issues/332 */
  try {
    // @ts-expect-error not checking deep props
    text = reactToText(node.type.render(node.props));
  } catch (error) {
    //
  }
  if (text.trim()) return text.trim();

  return "";
};

/** find index of first element "in view". model behavior off of wikiwand.com. */
export const firstInView = (elements: HTMLElement[]) => {
  const offset = parseInt(
    window.getComputedStyle(document.documentElement).scrollPaddingTop,
  );
  for (const element of elements.reverse())
    if (element.getBoundingClientRect()?.top < offset + 10) return element;
};
