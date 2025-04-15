import clsx from "clsx";
import { startCase } from "lodash";
import Flex from "@/components/Flex";
import classes from "./Legend.module.css";

type Props = {
  entries: Record<
    string,
    {
      color?: string;
      shape?: number[];
      stroke?: boolean;
    }
  >;
};

/** general purpose legend with colored symbols and labels */
const Legend = ({ entries }: Props) => {
  return (
    <div className={classes.legend}>
      {Object.entries(entries).map(
        ([label, { color, shape, stroke }], index) => (
          <Flex key={index} hAlign="left" vAlign="top" gap="sm" wrap={false}>
            <svg viewBox="-1 -1 2 2" className={classes.symbol}>
              {shape ? (
                stroke ? (
                  <>
                    {/* <polyline
                      stroke="var(--black)"
                      strokeWidth={0.6}
                      strokeLinecap="round"
                      points={shape.join(" ")}
                    /> */}
                    <polyline
                      stroke={color}
                      strokeWidth={0.4}
                      strokeLinecap="round"
                      points={shape.join(" ")}
                    />
                  </>
                ) : (
                  <polygon
                    fill={color}
                    // stroke="var(--black)"
                    // strokeWidth={0.1}
                    points={shape.join(" ")}
                  />
                )
              ) : (
                <circle
                  fill={color}
                  // stroke="var(--black)"
                  // strokeWidth={0.1}
                  r={1}
                />
              )}
            </svg>
            <div className={clsx(classes.label, !label && "secondary")}>
              {startCase(label) || "-"}
            </div>
          </Flex>
        ),
      )}
    </div>
  );
};

export default Legend;
