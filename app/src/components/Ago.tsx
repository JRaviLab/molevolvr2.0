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
  /** class on time element */
  className?: string;
};

/** show datetime in "ago" format, e.g. "20 min ago" */
const Ago = ({ date, className }: Props) => {
  /** parse arg as date */
  const parsed = parseDate(date);
  if (!parsed) return <span>???</span>;

  /** full date for tooltip */
  const full = formatDate(date);

  return (
    <Tooltip content={full || "???"}>
      {/* span needed because tooltip component needs child ref, and time-ago library does not forward it */}
      <span>
        <ReactTimeAgo
          className={className}
          date={parsed}
          locale="en-US"
          tabIndex={0}
        />
      </span>
    </Tooltip>
  );
};

export default Ago;
