import { useEffect } from "react";
import { truncate } from "lodash";

type Props = {
  /**
   * tab and page title. can be multiple parts (which get separated by
   * delimiter).
   */
  title: string | string[];
  /** page description */
  description?: string;
};

/**
 * set specific metadata for current page (overrides site-wide metadata in
 * .env), akin to react-helmet
 */
export const Meta = ({ title, description }: Props) => {
  /** set title */
  useEffect(() => {
    /** concat title string from parts */
    const string = [title]
      .flat()
      .concat(import.meta.env.VITE_TITLE)
      .map((part) => truncate(part.trim(), { length: 25, separator: " " }))
      .filter(Boolean)
      .join(" | ");

    /** set attributes */
    document.title = string;
    document
      .querySelector("meta[name='title']")
      ?.setAttribute("content", string);
    document
      .querySelector("meta[property='og:title']")
      ?.setAttribute("content", string);
  }, [title]);

  /** set description */
  useEffect(() => {
    /** get page-specific, or fall back to site-wide */
    const string = (description || import.meta.env.VITE_DESCRIPTION).trim();

    /** set attributes */
    document
      .querySelector("meta[name='description']")
      ?.setAttribute("content", string);
    document
      .querySelector("meta[property='og:description']")
      ?.setAttribute("content", string);
  }, [description]);

  return <></>;
};

export default Meta;
