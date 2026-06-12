import { useState, useRef, useEffect } from "react";
import { MoreVertical, ShieldOff, ShieldAlert, Bell } from "lucide-react";
import { useBanUser, useReactivateUser, useNotifyUser } from "../../hooks/useAdminUsers";
import { toast } from "react-hot-toast";

interface UserActionMenuProps {
  userId: string;
  status: string;
  // --- DEMO ONLY ---
  onEdit?: () => void;
  onDelete?: () => void;
  // --- END DEMO ONLY ---
}

export const UserActionMenu = ({ userId, status, onEdit, onDelete }: UserActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const banMutation = useBanUser();
  const reactivateMutation = useReactivateUser();
  const notifyMutation = useNotifyUser();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleAction = async (action: 'ban' | 'reactivate' | 'notify') => {
    setIsOpen(false);
    try {
      if (action === 'ban') {
        if (!confirm("Are you sure you want to ban this user?")) return;
        await banMutation.mutateAsync(userId);
        toast.success("User banned successfully");
      } else if (action === 'reactivate') {
        if (!confirm("Are you sure you want to reactivate this user?")) return;
        await reactivateMutation.mutateAsync(userId);
        toast.success("User reactivated successfully");
      } else if (action === 'notify') {
        await notifyMutation.mutateAsync(userId);
        toast.success("Notification sent");
      }
    } catch (error) {
      toast.error("Action failed. Please try again.");
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            {/* --- DEMO ONLY --- */}
            <button
              onClick={() => {
                setIsOpen(false);
                onEdit?.();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Bell size={14} className="text-gray-400" />
              Edit User (Demo)
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onDelete?.();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <ShieldAlert size={14} className="text-red-400" />
              Delete User (Demo)
            </button>
            {/* --- END DEMO ONLY --- */}
            
            {status === "Active" ? (
              <button
                onClick={() => handleAction('ban')}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                disabled={banMutation.isPending}
              >
                <ShieldOff size={14} />
                Ban User
              </button>
            ) : (
              <button
                onClick={() => handleAction('reactivate')}
                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                disabled={reactivateMutation.isPending}
              >
                <ShieldAlert size={14} />
                Reactivate User
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
