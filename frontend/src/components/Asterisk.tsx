import { AsteriskIcon } from "lucide-react";
import Tooltip from "@/components/Tooltip";

/** asterisk for things like required form fields */
export default function Asterisk() {
  return (
    <Tooltip content="Required">
      <AsteriskIcon className="text-error" />
    </Tooltip>
  );
}
