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
  json?: unknown | (() => unknown);
  /** extra buttons */
  children?: ReactNode;
};

/** chart download button */
export default function Download({
  filename,
  raster,
  vector,
  tabular,
  text,
  json,
  children,
}: Props) {
  const _json = typeof json === "function" ? json() : json;

  return (
    <Popover
      className="gap-2!"
      content={
        <>
          {raster && (
            <>
              <Button
                tooltip="High-resolution image"
                onClick={async () => {
                  if (!raster.current) return;
                  downloadPng(raster.current, filename);
                }}
              >
                <Image />
                PNG
              </Button>
              <Button
                tooltip="Compressed image"
                onClick={async () => {
                  if (!raster.current) return;
                  downloadJpg(raster.current, filename);
                }}
              >
                <Image />
                JPEG
              </Button>
            </>
          )}
          {vector && (
            <Button
              tooltip="Vector image"
              onClick={() => {
                if (!vector.current) return;
                downloadSvg(vector.current, filename);
              }}
            >
              <Spline />
              SVG
            </Button>
          )}
          {tabular && (
            <>
              <Button
                tooltip="Tab-separated data"
                onClick={() => downloadTsv(tabular, filename)}
              >
                <Table />
                TSV
              </Button>
              <Button
                tooltip="Comma-separated data"
                onClick={() => downloadCsv(tabular, filename)}
              >
                <Table />
                CSV
              </Button>
            </>
          )}
          {text && (
            <Button
              tooltip="Raw text data"
              onClick={() => downloadTxt(text, filename)}
            >
              <Terminal />
              TXT
            </Button>
          )}
          {!!json && (
            <Button
              tooltip="JSON data"
              onClick={() => downloadJson(_json, filename)}
            >
              <Braces />
              JSON
            </Button>
          )}
          {children}
        </>
      }
    >
      <Button design="hollow" tooltip="Download">
        <DownloadIcon />
      </Button>
    </Popover>
  );
}
