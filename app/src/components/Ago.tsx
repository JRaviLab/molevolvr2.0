import type { ComponentProps } from "react";
import ReactTimeAgo from "react-time-ago";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import Tooltip from "@/components/Tooltip";
import { formatDate, parseDate } from "@/util/string";

/** init library with english */
TimeAgo.addDefaultLocale(en);

type Props = {
  /** iso date string or date object */
  date: string | Date | undefined;
} & ComponentProps<"time">;

/** show datetime in "ago" format, e.g. "20 min ago" */
const Ago = ({ date, ...props }: Props) => {
  if (!date) return <span>???</span>;
  return (
    <Tooltip content={formatDate(date)}>
      <ReactTimeAgo date={parseDate(date)} locale="en-US" {...props} />
    </Tooltip>
  );
};

export default Ago;
