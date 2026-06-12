import { AlertCircle, User as UserIcon, MessageSquare, Flag } from "lucide-react";
import { ProfileAvatar } from "../../../components/profile";
import type { ReportedItemSummaryDto, ModerationQueueFilterParams } from "../../types/admin.types";

interface ModerationQueueProps {
  data?: { items: ReportedItemSummaryDto[]; totalPages: number };
  isLoading: boolean;
  isError: boolean;
  params: ModerationQueueFilterParams;
  onParamsChange: (params: ModerationQueueFilterParams) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ModerationQueue = ({
  data,
  isLoading,
  isError,
  params,
  onParamsChange,
  selectedId,
  onSelect,
}: ModerationQueueProps) => {

  const handleStatusChange = (status: string) => {
    onParamsChange({ ...params, status: status === "All" ? undefined : status, pageNumber: 1 });
  };

  const handlePageChange = (newPage: number) => {
    onParamsChange({ ...params, pageNumber: newPage });
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-100">
      {/* Filters Header */}
      <div className="p-4 border-b border-gray-100 space-y-3">
        <h2 className="text-lg font-semibold text-slateInk">Moderation Queue</h2>
        <div className="flex gap-2">
          {["All", "Open", "FlaggedForReview", "ActionTaken"].map((status) => {
            const isActive = (status === "All" && !params.status) || params.status === status;
            return (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${
                  isActive
                    ? "bg-slateInk text-white border-slateInk"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {status.replace(/([A-Z])/g, " $1").trim()}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">
            <AlertCircle size={32} className="mx-auto mb-2" />
            <p className="text-sm">Failed to load queue</p>
          </div>
        ) : data?.items?.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Flag size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Queue is empty</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data?.items.map((item: any) => {
              const isSelected = selectedId === item.reportedItemId;
              return (
                <div
                  key={item.reportedItemId}
                  onClick={() => onSelect(item.reportedItemId)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    isSelected ? "bg-primary/5 border-l-4 border-primary" : "border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <ProfileAvatar
                        pictureUrl={item.ownerPictureUrl}
                        name={item.ownerName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slateInk line-clamp-1">{item.ownerName}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.targetType}</p>
                      </div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded ${
                      item.reportScore >= item.reportThreshold ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {item.reportScore}/{item.reportThreshold}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2 mb-2 flex items-start gap-1.5">
                    <MessageSquare size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{item.topReason || "Reported"}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded ${
                      item.status === "ActionTaken" || item.status === "Cleared" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {(data?.totalPages || 0) > 1 && (
        <div className="p-3 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
          <button
            onClick={() => handlePageChange((params.pageNumber || 1) - 1)}
            disabled={(params.pageNumber || 1) <= 1}
            className="px-2 py-1 text-xs font-medium bg-white border border-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-xs text-gray-500">
            Page {params.pageNumber || 1} of {data?.totalPages}
          </span>
          <button
            onClick={() => handlePageChange((params.pageNumber || 1) + 1)}
            disabled={(params.pageNumber || 1) >= (data?.totalPages || 1)}
            className="px-2 py-1 text-xs font-medium bg-white border border-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
