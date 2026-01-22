import { useState } from "react";
import { LuChevronUp } from "react-icons/lu";
import { useEventListener } from "@reactuses/core";
import Button from "@/components/Button";
import Feedback from "@/components/Feedback";

/** buttons that stay in corner of view at all times. singleton. */
const ViewCorner = () => {
  const scrolled = useScrolled();

  return (
    <div className="fixed right-0 bottom-0 z-30 flex flex-col items-end gap-2 p-2">
      {scrolled && (
        <Button
          className="shadow-sm"
          icon={<LuChevronUp />}
          tooltip="Scroll to top of page"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
      )}

      <Feedback />
    </div>
  );
};

export default ViewCorner;

/** has user scrolled down a bit */
const useScrolled = () => {
  const [scrolled, setScrolled] = useState(false);
  /** useWindowScroll causes re-render on every scroll event */
  useEventListener("scroll", () => setScrolled(window.scrollY > 100));
  return scrolled;
};
