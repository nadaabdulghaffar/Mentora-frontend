import { Download, Send } from "lucide-react";

type Props = {
  title: string;
  description: string;
  onSendResults?: () => void;
  onExport?: () => void;
  sendLabel?: string;
  exportLabel?: string;
};

export default function ApplicationsHeader({
  title,
  description,
  onSendResults,
  onExport,
  sendLabel = "Send Results",
  exportLabel = "Export",
}: Props) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-[42px] font-bold text-[#1F2432] leading-tight">{title}</h1>
        <p className="mt-3 text-[16px] text-gray-500">{description}</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSendResults}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-[14px] hover:bg-green-100"
        >
          <Send size={16} />
          {sendLabel}
        </button>

        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-200 bg-white text-[14px] hover:bg-gray-50"
        >
          <Download size={16} />
          {exportLabel}
        </button>
      </div>
    </div>
  );
}