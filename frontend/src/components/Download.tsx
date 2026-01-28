import type { ReactNode, RefObject } from "react";
import type { Filename, Tabular } from "@/util/download";
import {
  LuBraces,
  LuDownload,
  LuImage,
  LuSpline,
  LuTable,
  LuTerminal,
} from "react-icons/lu";
import Button from "@/components/Button";
import Popover from "@/components/Popover";
import {
  downloadCsv,
  downloadJpg,
  downloadJson,
  downloadPng,
  downloadSvg,
  downloadTsv,
  downloadTxt,
} from "@/util/download";

type Props = {
  /** download filename */
  filename: Filename;
  /** element to render raster image of */
  raster?: RefObject<Element | null>;
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

/** chart download button */
const Download = ({
  filename,
  raster,
  vector,
  tabular,
  text,
  json,
  children,
}: Props) => {
  return (
    <Popover
      content={
        <div className="flex flex-col gap-2">
          {raster && (
            <>
              <Button
                icon={<LuImage />}
                text="PNG"
                onClick={async () => {
                  if (!raster.current) return;
                  downloadPng(raster.current, filename);
                }}
                tooltip="High-resolution image"
              />
              <Button
                icon={<LuImage />}
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
              icon={<LuSpline />}
              text="SVG"
              onClick={() => {
                if (!vector.current) return;
                downloadSvg(vector.current, filename);
              }}
              tooltip="Vector image"
            />
          )}
          {tabular && (
            <>
              <Button
                icon={<LuTable />}
                text="TSV"
                onClick={() => downloadTsv(tabular, filename)}
                tooltip="Tab-separated data"
              />
              <Button
                icon={<LuTable />}
                text="CSV"
                onClick={() => downloadCsv(tabular, filename)}
                tooltip="Tab-separated data"
              />
            </>
          )}
          {text && (
            <Button
              icon={<LuTerminal />}
              text="Text"
              onClick={() => downloadTxt(text, filename)}
              tooltip="Raw text data"
            />
          )}
          {!!json && (
            <Button
              icon={<LuBraces />}
              text="JSON"
              onClick={() => downloadJson(json, filename)}
              tooltip="JSON data"
            />
          )}
          {children}
        </div>
      }
    >
      <Button icon={<LuDownload />} design="hollow" tooltip="Download" />
    </Popover>
  );
};

export default Download;
