import type { ChangeEvent, ComponentProps, DragEvent } from "react";
import { useRef, useState } from "react";
import classNames from "classnames";
import Button from "@/components/Button";
import classes from "./UploadButton.module.css";

type Props = {
  /**
   * formats to accept.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
   */
  accept?: string;
  /** callback with file */
  onUpload: (file: File, filename: string) => void;
} & ComponentProps<typeof Button>;

/** file dialog or drag & drop button */
const UploadButton = ({ onUpload, accept = "", tooltip, ...props }: Props) => {
  const ref = useRef<HTMLInputElement>(null);

  /** dragging */
  const [drag, setDrag] = useState(false);

  /** upload file */
  const upload = async (target: HTMLInputElement | DataTransfer | null) => {
    const file = (target?.files || [])[0];
    const filename = file?.name || "";
    if (!file) return;

    /** pass upload to parent */
    onUpload(file, filename);

    /** reset file input */
    if (ref.current) ref.current.value = "";
  };

  /** on file input change */
  const onChange = (event: ChangeEvent<HTMLInputElement>) =>
    upload(event.target);

  /** on button click, click hidden file input */
  const onClick = () => ref.current?.click();

  /** on button file drop */
  const onDrop = (event: DragEvent) => {
    setDrag(false);
    upload(event.dataTransfer);
  };

  return (
    <span>
      <Button
        {...props}
        tooltip={tooltip || "Choose or drag & drop a file"}
        className={classNames({ [classes.drag!]: drag })}
        onClick={onClick}
        onDragEnter={() => setDrag(true)}
        onDragLeave={() => setDrag(false)}
        onDragOver={(event: DragEvent) => event.preventDefault()}
        onDrop={(event: DragEvent) => {
          event.preventDefault();
          event.stopPropagation();
          onDrop(event);
        }}
      />

      <input
        ref={ref}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={onChange}
      />
    </span>
  );
};

export default UploadButton;
