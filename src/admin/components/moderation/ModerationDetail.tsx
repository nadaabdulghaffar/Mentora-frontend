import { useState } from "react";
import { AlertCircle, FileText, User as UserIcon, Calendar, MessageSquare, Shield, Clock, ExternalLink, Mail } from "lucide-react";
import { ProfileAvatar } from "../../../components/profile";
import { useModerationDetail, useApplyModerationAction } from "../../hooks/useModeration";
import { ModerationActionModal } from "./ModerationActionModal";
import type { AdminActionRequest } from "../../types/admin.types";
import { toast } from "react-hot-toast";

interface ModerationDetailProps {
  selectedId: string | null;
}

export const ModerationDetail = ({ selectedId }: ModerationDetailProps) => {
  const { data: detailData, isLoading, isError } = useModerationDetail(selectedId || undefined);
  const { mutate: applyAction, isPending } = useApplyModerationAction();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!selectedId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 border-l border-gray-100 bg-gray-50/30">
        <Shield size={48} className="mb-4 text-gray-300" />
        <p className="text-lg font-medium text-slateInk">No Report Selected</p>
        <p className="text-sm">Select an item from the queue to view details.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full p-8 border-l border-gray-100 space-y-6 animate-pulse">
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-1/3 bg-gray-200 rounded" />
            <div className="h-4 w-1/4 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-40 w-full bg-gray-200 rounded-xl" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (isError || !detailData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-400 p-8 border-l border-gray-100">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-lg font-medium">Failed to load details</p>
        <p className="text-sm">The report might have been removed.</p>
      </div>
    );
  }

  // Use raw response object from mentora API pattern (.data might have been nested)
  const detail = (detailData as any).data || detailData;

  const handleActionSubmit = (request: AdminActionRequest) => {
    applyAction(
      { id: detail.reportedItemId, request },
      {
        onSuccess: () => {
          toast.success("Moderation action applied successfully.");
          setIsModalOpen(false);
        },
        onError: () => {
          toast.error("Failed to apply moderation action.");
        },
      }
    );
  };

  const isResolved = detail.status === "ActionTaken" || detail.status === "Cleared";

  return (
    <div className="h-full flex flex-col border-l border-gray-100 bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-start justify-between">
        <div className="flex gap-4 items-center">
          <ProfileAvatar
            pictureUrl={detail.ownerPictureUrl}
            name={detail.ownerName}
            className="w-16 h-16 rounded-full object-cover shadow-sm"
          />
          <div>
            <h2 className="text-xl font-semibold text-slateInk">{detail.ownerName}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mt-2">
              <span className="flex items-center gap-1"><UserIcon size={14} /> {detail.ownerRole}</span>
              {detail.ownerEmail && (
                <span className="flex items-center gap-1"><Mail size={14} /> {detail.ownerEmail}</span>
              )}
              <span className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(detail.ownerJoinedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
            Score: {detail.reportScore} / {detail.reportThreshold}
          </div>
          <p className="text-xs text-gray-400 mt-2">Target: {detail.targetType}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Reported Content Snapshot */}
        <section>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText size={16} /> Reported Content Snapshot
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 relative group">
            {detail.content.contentUrl && (
              <a href={detail.content.contentUrl} target="_blank" rel="noreferrer" className="absolute top-4 right-4 text-gray-400 hover:text-primary transition-colors">
                <ExternalLink size={18} />
              </a>
            )}
            <h4 className="font-medium text-slateInk mb-2">{detail.content.title}</h4>
            {detail.content.body && (
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{detail.content.body}</p>
            )}
            <p className="text-xs text-gray-400 mt-4"><Clock size={12} className="inline mr-1"/>Posted {new Date(detail.content.createdAt).toLocaleString()}</p>
          </div>
        </section>

        {/* Reason Breakdown & Reports */}
        <section>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MessageSquare size={16} /> Submissions ({detail.reports?.length || 0})
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(detail.reasonBreakdown || {}).map(([reason, count]) => (
              <div key={reason} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {reason} <span className="opacity-60 ml-1">({count as number})</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {detail.reports?.map((report: any) => (
              <div key={report.reportId} className="bg-white border border-gray-100 shadow-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ProfileAvatar pictureUrl={report.reporterPictureUrl} name={report.reporterName} className="w-6 h-6 rounded-full" />
                    <span className="text-sm font-medium text-slateInk">{report.reporterName}</span>
                    <span className="text-xs text-gray-400">• {new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">{report.reason}</span>
                </div>
                {report.description && <p className="text-sm text-gray-600 mt-2">{report.description}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Owner History */}
        {detail.ownerHistory?.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield size={16} /> Past Moderation History
            </h3>
            <div className="space-y-3">
              {detail.ownerHistory.map((hist: any, i: number) => (
                <div key={i} className="flex gap-4 p-3 rounded-lg border border-amber-100 bg-amber-50/50">
                  <div className={`p-2 rounded-full h-fit ${hist.isActive ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slateInk">{hist.actionType}</span>
                      {!hist.isActive && <span className="text-[10px] uppercase tracking-wide bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-sm">Expired</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{hist.message || "No message provided."}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(hist.issuedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Footer Action */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end items-center">
        {isResolved ? (
          <div className="flex items-center gap-4 text-sm w-full">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">Resolved</span>
            <div className="text-gray-500">
              Content Action: <span className="text-slateInk">{detail.contentAction || "None"}</span> • 
              User Action: <span className="text-slateInk">{detail.userAction || "None"}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm w-full sm:w-auto"
          >
            Review & Apply Action
          </button>
        )}
      </div>

      <ModerationActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleActionSubmit}
        isLoading={isPending}
      />
    </div>
  );
};
