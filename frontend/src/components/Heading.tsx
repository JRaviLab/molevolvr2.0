import { useEffect, useRef } from "react";
import type { JSX, ReactElement, ReactNode } from "react";
import clsx from "clsx";
import { atom, useSetAtom } from "jotai";
import Badge from "@/components/Badge";
import Link from "@/components/Link";
import { renderText } from "@/util/dom";
import { slugify } from "@/util/string";

type Props = {
  /** "indent" level */
  level: 1 | 2 | 3 | 4;
  /** icon element or badge */
  icon?: ReactElement<{ className: string }> | string;
  /** manually set anchor link instead of automatically from children text */
  anchor?: string;
  /** class on heading */
  className?: string;
  /** heading content */
  children: ReactNode;
};

type Heading = {
  ref: HTMLHeadingElement;
  id: string;
  level: number;
  icon?: ReactNode;
  text: ReactNode;
};

/** global list of headings */
export const headingsAtom = atom<Heading[]>([]);

/**
 * demarcates a new section/level of content. only use one level 1 per page.
 * don't use levels below 4.
 */
const Heading = ({
  level,
  icon = <></>,
  anchor,
  className,
  children,
}: Props) => {
  const ref = useRef<HTMLHeadingElement>(null);

  /** heading tag */
  const Tag: keyof JSX.IntrinsicElements = `h${level}`;

  /** url-compatible, "slugified" id */
  const id = anchor ?? slugify(renderText(children));

  /** icon or badge */
  let iconElement: ReactNode = null;
  if (typeof icon === "string") iconElement = <Badge>{icon}</Badge>;
  if (typeof icon === "object" && typeof icon.type === "function")
    iconElement = <div className="flex opacity-25">{icon}</div>;

  const setHeadings = useSetAtom(headingsAtom);

  /** on every render */
  useEffect(() => {
    const element = ref.current;

    if (element) {
      setHeadings((headings) =>
        headings
          /** remove heading from list */
          .filter((heading) => heading.ref !== element)
          /** add heading to list */
          .concat([
            { ref: element, id, level, icon: iconElement, text: children },
          ])
          /**
           * make sure list is in order of document appearance
           * https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
           */
          .sort((a, b) =>
            a.ref.compareDocumentPosition(b.ref) &
            Node.DOCUMENT_POSITION_FOLLOWING
              ? -1
              : 1,
          ),
      );
    }

    return () =>
      /** remove heading from list */
      setHeadings((headings) =>
        headings.filter((heading) => heading.ref !== element),
      );
  });

  return (
    <Link to={"#" + id} className={clsx("group", className)}>
      <Tag
        id={id}
        ref={ref}
        className="
          text-deep
          group-hover:text-accent
        "
      >
        {iconElement}
        {children}
      </Tag>
    </Link>
  );
};

export default Heading;
