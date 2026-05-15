import { useRef, useState } from "react";

import { Paperclip, Upload } from "lucide-react";

import {
  extractErrorMessage,
  uploadTaskAttachment,
} from "../../../services/roadmapService";

interface Props {
  attachmentUrl: string;
  onAttachmentUrlChange: (value: string) => void;
  disabled?: boolean;
}

export default function TaskAttachmentFields({
  attachmentUrl,
  onAttachmentUrlChange,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadHint, setUploadHint] = useState<string | null>(null);

  const pickFile = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || disabled) return;

    setUploading(true);
    setUploadHint(null);
    try {
      const url = await uploadTaskAttachment(file);
      onAttachmentUrlChange(url);
      setUploadHint("File uploaded — link filled in below.");
    } catch (err) {
      setUploadHint(extractErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label
        className="
          flex items-center gap-2
          text-xs font-bold tracking-wide
          text-[#475467]
        "
      >
        <Paperclip size={15} />
        Attachment
      </label>

      <p className="text-xs text-[#667085] leading-relaxed">
        Upload a file (stored by Mentora) or paste a link to an external
        resource (Drive, Dropbox, GitHub, etc.).
      </p>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={onFile}
        disabled={disabled || uploading}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={pickFile}
          disabled={disabled || uploading}
          className="
            inline-flex items-center gap-2 h-11 px-4 rounded-2xl
            border border-[#D0D5DD] bg-white text-sm font-semibold
            text-[#344054] hover:bg-[#F9FAFB] transition
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <Upload size={16} />
          {uploading ? "Uploading…" : "Upload file"}
        </button>
      </div>

      <input
        value={attachmentUrl}
        onChange={(e) => onAttachmentUrlChange(e.target.value)}
        placeholder="https://…"
        disabled={disabled}
        className="
          w-full h-12 rounded-2xl
          bg-[#F3F5F9]
          px-4 outline-none
          disabled:opacity-60
        "
      />

      {uploadHint ? (
        <p
          className={`text-xs ${uploadHint.startsWith("File uploaded") ? "text-emerald-700" : "text-red-600"}`}
        >
          {uploadHint}
        </p>
      ) : null}
    </div>
  );
}
