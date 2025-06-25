import { useState } from "react";
import { FaAngleUp } from "react-icons/fa6";
import { useEventListener } from "@reactuses/core";
import Button from "@/components/Button";
import Feedback from "@/components/Feedback";
import Flex from "@/components/Flex";
import Toasts from "@/components/Toasts";
import classes from "./ViewCorner.module.css";

/** buttons and other stuff that stays in corner of view at all times. singleton. */
const ViewCorner = () => {
  const scrolled = useScrolled();

  return (
    <Flex className={classes.container} vAlign="bottom">
      <Toasts />

      <Flex direction="column" gap="sm">
        {scrolled && (
          <Button
            className={classes.button}
            icon={<FaAngleUp />}
            tooltip="Scroll to top of page"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
        )}

        <Feedback />
      </Flex>
    </Flex>
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
