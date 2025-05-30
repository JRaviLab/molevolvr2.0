import type { ReactNode, RefObject } from "react";
import {
  FaBezierCurve,
  FaDownload,
  FaFilePdf,
  FaRegImage,
  FaTableCellsLarge,
} from "react-icons/fa6";
import { PiBracketsCurlyBold } from "react-icons/pi";
import { TbPrompt } from "react-icons/tb";
import type { Promisable } from "type-fest";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Popover from "@/components/Popover";
import { printElement } from "@/util/dom";
import {
  downloadCsv,
  downloadJpg,
  downloadJson,
  downloadPng,
  downloadSvg,
  downloadTsv,
  downloadTxt,
  type Filename,
  type Tabular,
} from "@/util/download";

type Props = {
  /** download filename */
  filename: Filename;
  /** element to render raster image of */
  raster?: RefObject<Element | null>;
  /** code to run before and after raster download */
  rasterEffect?: () => Promisable<() => Promisable<void>>;
  /** svg element to save */
  vector?: RefObject<SVGSVGElement | null>;
  /** element to print to pdf */
  print?: RefObject<Element | null>;
  /** code to run before and after print */
  printEffect?: () => Promisable<() => Promisable<void>>;
  /** csv/tsv data */
  tabular?: { data: Tabular; filename?: string }[];
  /** text string */
  text?: string;
  /** json data */
  json?: unknown;
  /** extra buttons */
  children?: ReactNode;
};

/** chart download button */
const Download = ({
  filename,
  raster,
  rasterEffect,
  vector,
  print,
  printEffect,
  tabular,
  text,
  json,
  children,
}: Props) => {
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
                  const post = await rasterEffect?.();
                  downloadPng(raster.current, filename);
                  await post?.();
                }}
                tooltip="High-resolution image"
              />
              <Button
                icon={<FaRegImage />}
                text="JPEG"
                onClick={async () => {
                  if (!raster.current) return;
                  const post = await rasterEffect?.();
                  downloadJpg(raster.current, filename);
                  await post?.();
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
              icon={<FaFilePdf />}
              text="PDF"
              onClick={async () => {
                if (!print.current) return;
                const post = await printEffect?.();
                printElement(print.current);
                await post?.();
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
