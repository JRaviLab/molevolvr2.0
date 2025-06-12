import { useState } from "react";
import type { ReactElement, ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import {
  FaBezierCurve,
  FaDownload,
  FaPrint,
  FaRegImage,
  FaTableCellsLarge,
} from "react-icons/fa6";
import { PiBracketsCurlyBold } from "react-icons/pi";
import { TbPrompt } from "react-icons/tb";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Popover from "@/components/Popover";
import type { Filename, Tabular } from "@/util/download";
import {
  downloadCsv,
  downloadJpg,
  downloadJson,
  downloadPng,
  downloadSvg,
  downloadTsv,
  downloadTxt,
  getFilename,
} from "@/util/download";
import { sleep } from "@/util/misc";
import classes from "./Download.module.css";

type Props = {
  /** download filename */
  filename: Filename;
  /** element to render raster image of */
  raster?: RefObject<Element | null>;
  /** component to print to pdf */
  print?: ReactElement;
  /** svg element to save */
  vector?: RefObject<SVGSVGElement | null>;
  /** csv/tsv data */
  tabular?: { data: Tabular; filename?: string }[];
  /** text string */
  text?: string;
  /** json data */
  json?: unknown;
  /** extra buttons */
  children?: ReactNode;
};

/** app entrypoint element */
const appElement = document.getElementById("app")!;

/** chart download button */
const Download = ({
  filename,
  raster,
  vector,
  print,
  tabular,
  text,
  json,
  children,
}: Props) => {
  /** printing state */
  const [printing, setPrinting] = useState(false);

  /** if printing, render just chart */
  if (print && printing)
    return createPortal(
      <div className={classes.printing}>{print}</div>,
      document.body,
    );

  return (
    <Popover
      content={
        <Flex direction="column" hAlign="stretch" gap="xs">
          {raster && (
            <>
              <Button
                icon={<FaRegImage />}
                text="PNG"
                onClick={async () => {
                  if (!raster.current) return;
                  downloadPng(raster.current, filename);
                }}
                tooltip="High-resolution image"
              />
              <Button
                icon={<FaRegImage />}
                text="JPEG"
                onClick={async () => {
                  if (!raster.current) return;
                  downloadJpg(raster.current, filename);
                }}
                tooltip="Compressed image"
              />
            </>
          )}
          {vector && (
            <Button
              icon={<FaBezierCurve />}
              text="SVG"
              onClick={() => {
                if (!vector.current) return;
                downloadSvg(vector.current, filename);
              }}
              tooltip="Vector image"
            />
          )}
          {print && (
            <Button
              icon={<FaPrint />}
              text="PDF"
              onClick={async () => {
                /** save scroll */
                const scrollY = window.scrollY;
                /** save title */
                const title = document.title;
                /** set title to suggest pdf filename */
                document.title = getFilename(filename);
                /** turn on printing mode */
                setPrinting(true);
                /** hide rest of app */
                appElement.style.display = "none";
                /** wait for re-render and paint */
                await sleep();
                /** open print dialog */
                window.print();
                /** turn off printing mode */
                setPrinting(false);
                /** restore title */
                document.title = title;
                /** re-show rest of app */
                appElement.style.display = "";
                /** wait for re-render and paint */
                await sleep();
                /** restore scroll */
                window.scrollTo(0, scrollY);
              }}
              tooltip="Print as pdf"
            />
          )}
          {tabular && (
            <>
              <Button
                icon={<FaTableCellsLarge />}
                text="TSV"
                onClick={() => downloadTsv(tabular, filename)}
                tooltip="Tab-separated data"
              />
              <Button
                icon={<FaTableCellsLarge />}
                text="CSV"
                onClick={() => downloadCsv(tabular, filename)}
                tooltip="Tab-separated data"
              />
            </>
          )}
          {text && (
            <Button
              icon={<TbPrompt />}
              text="Text"
              onClick={() => downloadTxt(text, filename)}
              tooltip="Raw text data"
            />
          )}
          {!!json && (
            <Button
              icon={<PiBracketsCurlyBold />}
              text="JSON"
              onClick={() => downloadJson(json, filename)}
              tooltip="JSON data"
            />
          )}
          {children}
        </Flex>
      }
    >
      <Button icon={<FaDownload />} design="hollow" tooltip="Download" />
    </Popover>
  );
};

export default Download;
