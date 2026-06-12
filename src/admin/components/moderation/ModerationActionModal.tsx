import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import type { AdminActionRequest } from "../../types/admin.types";

interface ModerationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: AdminActionRequest) => void;
  isLoading?: boolean;
}

export const ModerationActionModal: React.FC<ModerationActionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [contentAction, setContentAction] = useState<AdminActionRequest["contentAction"]>("None");
  const [userAction, setUserAction] = useState<AdminActionRequest["userAction"]>("None");
  const [banDurationHours, setBanDurationHours] = useState<number | "">("");
  const [userActionMessage, setUserActionMessage] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      contentAction,
      userAction,
      banDurationHours: banDurationHours === "" ? undefined : banDurationHours,
      userActionMessage: userActionMessage || undefined,
      adminNotes: adminNotes || undefined,
    });
  };

  const isTempBan = userAction === "TemporaryBan";
  const isValid = !isTempBan || (isTempBan && typeof banDurationHours === "number" && banDurationHours > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slateInk">Apply Moderation Action</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="moderation-action-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Content Action */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slateInk">Content Action</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={contentAction}
                onChange={(e) => setContentAction(e.target.value as any)}
              >
                <option value="None">None</option>
                <option value="Approved">Approve (Clear Report)</option>
                <option value="ContentDeleted">Delete Content</option>
              </select>
            </div>

            {/* User Action */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slateInk">User Action</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={userAction}
                onChange={(e) => setUserAction(e.target.value as any)}
              >
                <option value="None">None</option>
                <option value="Warning">Warning</option>
                <option value="TemporaryBan">Temporary Ban</option>
                <option value="PermanentBan">Permanent Ban</option>
              </select>
            </div>

            {/* Ban Duration (Conditional) */}
            {isTempBan && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slateInk">Ban Duration (Days)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={banDurationHours}
                  onChange={(e) => setBanDurationHours(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 24 for 1 day"
                />
              </div>
            )}

            {/* User Message */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slateInk">Message to User (Optional)</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                value={userActionMessage}
                onChange={(e) => setUserActionMessage(e.target.value)}
                placeholder="Reason for warning or ban..."
              />
            </div>

            {/* Admin Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slateInk">Internal Admin Notes (Optional)</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Visible only to other admins..."
              />
            </div>

            {(!isValid) && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                <span>Temporary bans require a valid duration in hours.</span>
              </div>
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-slateInk transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="moderation-action-form"
            disabled={!isValid || isLoading}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? "Applying..." : "Apply Action"}
          </button>
        </div>
      </div>
    </div>
  );
};
