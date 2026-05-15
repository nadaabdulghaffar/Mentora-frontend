import React from 'react';
import { X, FileText, ExternalLink, Download } from 'lucide-react';

export interface TaskResource {
  id: string;
  name: string;
  type: 'pdf' | 'document' | 'link';
  size?: string;
  url?: string;
}

export interface TaskDetails {
  id: string;
  title?: string;
  category?: string;
  dueDate?: string;
  description?: string;
  resources?: TaskResource[];
}

interface ViewTaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: TaskDetails | null;
  onSubmitTask?: () => void;
}

const ViewTaskDetailsModal: React.FC<ViewTaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
  onSubmitTask,
}) => {
  if (!isOpen || !task) return null;

  const handleSubmit = () => {
    if (onSubmitTask) {
      onSubmitTask();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              {task.category && (
                <span className="rounded-full bg-[#E8DAFD] px-3 py-1 text-xs font-bold uppercase text-[#6E56CF]">
                  {task.category}
                </span>
              )}
              {task.dueDate && (
                <span className="rounded-full border border-[#FF6B6B] bg-[#FFF5F5] px-3 py-1 text-xs font-bold uppercase text-[#FF6B6B]">
                  📋 DUE: {task.dueDate}
                </span>
              )}
            </div>
            <h2 className="text-3xl font-bold text-[#1F2432]">{task.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X size={24} className="text-[#6F7689]" />
          </button>
        </div>

        <div className="border-t border-[#E6E9F2] py-6">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Task Summary */}
            {task.description && (
              <div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#1F2432]">
                  Task Summary
                </h3>
                <p className="leading-7 text-[#5E667D]">{task.description}</p>
              </div>
            )}

            {/* Attached Resources */}
            {task.resources && task.resources.length > 0 && (
              <div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#1F2432]">
                  Attached Resources
                </h3>
                <div className="space-y-3">
                  {task.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between rounded-lg border border-[#E6E9F2] bg-[#F8FAFB] p-3"
                    >
                      <div className="flex items-center gap-3">
                        {resource.type === 'pdf' || resource.type === 'document' ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFE8E8]">
                            <FileText size={18} className="text-[#FF6B6B]" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8DAFD]">
                            <ExternalLink size={18} className="text-[#6E56CF]" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-[#1F2432]">{resource.name}</p>
                          {resource.size && (
                            <p className="text-xs text-[#A0AABC]">{resource.size}</p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rounded-lg p-2 hover:bg-[#E6E9F2]"
                      >
                        {resource.type === 'link' ? (
                          <ExternalLink size={18} className="text-[#6E56CF]" />
                        ) : (
                          <Download size={18} className="text-[#6E56CF]" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl bg-[#6E56CF] px-8 py-3 font-semibold text-white hover:bg-[#5E46BF]"
          >
            🚀 SUBMIT TASK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTaskDetailsModal;
