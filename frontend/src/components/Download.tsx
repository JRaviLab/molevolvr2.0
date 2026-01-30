import type { ReactNode, RefObject } from "react";
import type { Filename, Tabular } from "@/util/download";
import {
  Braces,
  DownloadIcon,
  Image,
  Spline,
  Table,
  Terminal,
} from "lucide-react";
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
                icon={<Image />}
                text="PNG"
                tooltip="High-resolution image"
                onClick={async () => {
                  if (!raster.current) return;
                  downloadPng(raster.current, filename);
                }}
              />
              <Button
                icon={<Image />}
                text="JPEG"
                tooltip="Compressed image"
                onClick={async () => {
                  if (!raster.current) return;
                  downloadJpg(raster.current, filename);
                }}
              />
            </>
          )}
          {vector && (
            <Button
              icon={<Spline />}
              text="SVG"
              tooltip="Vector image"
              onClick={() => {
                if (!vector.current) return;
                downloadSvg(vector.current, filename);
              }}
            />
          )}
          {tabular && (
            <>
              <Button
                icon={<Table />}
                text="TSV"
                tooltip="Tab-separated data"
                onClick={() => downloadTsv(tabular, filename)}
              />
              <Button
                icon={<Table />}
                text="CSV"
                tooltip="Tab-separated data"
                onClick={() => downloadCsv(tabular, filename)}
              />
            </>
          )}
          {text && (
            <Button
              icon={<Terminal />}
              text="Text"
              tooltip="Raw text data"
              onClick={() => downloadTxt(text, filename)}
            />
          )}
          {!!json && (
            <Button
              icon={<Braces />}
              text="JSON"
              tooltip="JSON data"
              onClick={() => downloadJson(json, filename)}
            />
          )}
          {children}
        </div>
      }
    >
      <Button icon={<DownloadIcon />} tooltip="Download" design="hollow" />
    </Popover>
  );
};

export default Download;
