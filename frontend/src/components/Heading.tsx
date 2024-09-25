import type { ReactElement, ReactNode } from "react";
import { cloneElement, useRef } from "react";
import { FaLink } from "react-icons/fa6";
import clsx from "clsx";
import { kebabCase } from "lodash";
import Badge from "@/components/Badge";
import Link from "@/components/Link";
import { renderText } from "@/util/dom";
import classes from "./Heading.module.css";

type Props = {
  /** "indent" level */
  level: 1 | 2 | 3 | 4;
  /** icon element or badge */
  icon?: ReactElement | string;
  /** manually set anchor link instead of automatically from children text */
  anchor?: string;
  /** class on heading */
  className?: string;
  /** heading content */
  children: ReactNode;
};

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
  const id = kebabCase(anchor ?? renderText(children));

  /** icon or badge */
  const iconElement =
    typeof icon === "string" ? (
      <Badge className={classes.badge}>{icon}</Badge>
    ) : (
      cloneElement(icon, { className: classes.icon })
    );

  return (
    <Tag id={id} ref={ref} className={clsx(className, classes.heading)}>
      {iconElement}

      {/* content */}
      <span className={classes.content}>
        {children}

        {/* link to section */}
        {id && (
          <Link
            to={"#" + id}
            className={classes.anchor}
            aria-label="Heading link"
          >
            <FaLink />
          </Link>
        )}
      </span>
    </Tag>
  );
};

export default Heading;
