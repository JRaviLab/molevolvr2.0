import { AsteriskIcon } from "lucide-react";
import Tooltip from "@/components/Tooltip";

/** asterisk for things like required form fields */
const Asterisk = () => (
  <Tooltip content="Required">
    <AsteriskIcon className="relative -ml-1 -translate-y-2 scale-75 text-error" />
  </Tooltip>
);

export default Asterisk;
