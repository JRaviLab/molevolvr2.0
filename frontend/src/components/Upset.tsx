import { useEffect, useRef } from "react";
import {
  FaBezierCurve,
  FaDownload,
  FaFilePdf,
  FaRegImage,
} from "react-icons/fa6";
import clsx from "clsx";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Popover from "@/components/Popover";
import { fitViewBox, printElement } from "@/util/dom";
import { downloadJpg, downloadPng, downloadSvg } from "@/util/download";
import { rootFontSize, useSvgTransform, useTheme } from "@/util/hooks";
import classes from "./Upset.module.css";

type Props = {
  /** x-axis */
  x: {
    /** column data */
    data: {
      value: number;
    }[];
  };
  /** y-axis */
  y: {
    /** axis label */
    label: string;
    /** row data */
    data: {
      label?: string;
      value: number;
    }[];
  };
  /** cell values */
  data: (boolean | undefined)[][];
};

/** upset plot */
const Upset = ({ x, y, data }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  /** reactive CSS vars */
  const theme = useTheme();

  /** font size, in svg units */
  const fontSize = useSvgTransform(svgRef.current, 1, rootFontSize()).h;

  /** fit view box */
  useEffect(() => {
    fitViewBox(svgRef.current, 0.01);
  });

  return (
    <Flex direction="column" gap="lg">
      <div ref={containerRef} className={clsx("card", classes.container)}>
        <svg
          ref={svgRef}
          className={classes.chart}
          style={{
            fontSize,
            /** size based on number of rows */
            height: 2 * rootFontSize() * (data.length + 2),
          }}
        ></svg>
      </div>

      {/* controls */}
      <Flex>
        <Popover
          content={
            <Flex direction="column" hAlign="stretch" gap="xs">
              <Button
                icon={<FaRegImage />}
                text="PNG"
                onClick={() =>
                  containerRef.current &&
                  downloadPng(containerRef.current, "upset")
                }
                tooltip="High-resolution image"
              />
              <Button
                icon={<FaRegImage />}
                text="JPEG"
                onClick={() =>
                  containerRef.current &&
                  downloadJpg(containerRef.current, "upset")
                }
                tooltip="Compressed image"
              />
              <Button
                icon={<FaBezierCurve />}
                text="SVG"
                onClick={() =>
                  svgRef.current && downloadSvg(svgRef.current, "upset")
                }
                tooltip="Vector image"
              />
              <Button
                icon={<FaFilePdf />}
                text="PDF"
                onClick={() =>
                  containerRef.current && printElement(containerRef.current)
                }
                tooltip="Print as pdf"
              />
            </Flex>
          }
        >
          <Button
            icon={<FaDownload />}
            design="hollow"
            tooltip="Download chart"
          />
        </Popover>
      </Flex>
    </Flex>
  );
};

export default Upset;
