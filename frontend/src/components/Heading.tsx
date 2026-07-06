import type { JSX, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { atom, useSetAtom } from "jotai";
import Link from "@/components/Link";
import { renderText } from "@/util/dom";
import { slugify } from "@/util/string";

type Props = {
  /** "indent" level */
  level: 1 | 2 | 3 | 4;
  /** icon element or badge */
  icon?: ReactNode;
  /** manually set anchor link instead of automatically from children text */
  anchor?: string;
  /** class on heading */
  className?: string;
  /** heading content */
  children: ReactNode;
};

type Heading = {
  element: HTMLHeadingElement;
  id: string;
  level: number;
  icon?: ReactNode;
  content: ReactNode;
};

/** global list of headings */
export const headingsAtom = atom<Heading[]>([]);

/** demarcates a new section/level of content */
export function Heading({ level, icon, anchor, className, children }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  /** heading tag */
  const Tag: keyof JSX.IntrinsicElements = `h${level}`;

  const setHeadings = useSetAtom(headingsAtom);

  /** url-compatible, "slugified" id */
  const id = anchor ?? slugify(renderText(children));

  useEffect(() => {
    const element = ref.current;

    if (element)
      /** add heading to list */
      setHeadings((headings) => {
        /** find position to insert */
        const position =
          headings.findLastIndex(
            (heading) =>
              heading.element.compareDocumentPosition(element) &
              Node.DOCUMENT_POSITION_FOLLOWING,
          ) + 1;

        /** this heading */
        const heading = {
          element,
          id,
          level,
          icon,
          content: children,
        };

        /** insert at correct position */
        headings.splice(position, 0, heading);

        return headings;
      });

    return () => {
      /** remove heading from list */
      setHeadings((headings) =>
        headings.filter((heading) => heading.element !== element),
      );
    };
  }, [id, children, icon, level, setHeadings]);

  return (
    <Tag id={id} ref={ref} className={className}>
      <Link to={"#" + id} className="contents! text-current no-underline">
        {icon && (
          <div className="grid place-items-center text-gray">{icon}</div>
        )}
        {children}
      </Link>
    </Tag>
  );
}

export function H1(props: Omit<Props, "level">) {
  return <Heading level={1} {...props} />;
}

export function H2(props: Omit<Props, "level">) {
  return <Heading level={2} {...props} />;
}

export function H3(props: Omit<Props, "level">) {
  return <Heading level={3} {...props} />;
}

export function H4(props: Omit<Props, "level">) {
  return <Heading level={4} {...props} />;
}
