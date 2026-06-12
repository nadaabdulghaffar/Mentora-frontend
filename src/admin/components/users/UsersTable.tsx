import { ProfileAvatar } from "../../../components/profile";
import type { AdminUserListItemDto } from "../../types/admin.types";
import { UserActionMenu } from "./UserActionMenu";
import { AlertCircle } from "lucide-react";

interface UsersTableProps {
  data?: AdminUserListItemDto[];
  isLoading: boolean;
  isError: boolean;
  page: number;
  totalPages: number;
  roleType: "Mentor" | "Mentee";
  // --- DEMO ONLY ---
  onEdit?: (user: any) => void;
  onDelete?: (user: any) => void;
  // --- END DEMO ONLY ---
}

export const UsersTable = ({
  data,
  isLoading,
  isError,
  page,
  totalPages,
  onPageChange,
  roleType,
  // --- DEMO ONLY ---
  onEdit,
  onDelete,
  // --- END DEMO ONLY ---
}: UsersTableProps) => {
  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-red-500">
        <AlertCircle size={32} className="mb-2" />
        <p>Failed to load users. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slateInk">
          <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Join Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              // Skeleton Rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-48 bg-gray-200 rounded" />
                    </div>
                  </td>
                  <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                  <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded-full" /></td>
                  <td className="px-6 py-4 text-right"><div className="h-6 w-6 bg-gray-200 rounded ml-auto" /></td>
                </tr>
              ))
            ) : data && data.length > 0 ? (
              data.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        pictureUrl={user.profilePictureUrl}
                        alt={user.fullName}
                        name={user.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-slateInk">{user.fullName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{roleType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{new Date(user.joinDate).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <UserActionMenu 
                      userId={user.userId} 
                      status={user.status} 
                      // --- DEMO ONLY ---
                      onEdit={() => onEdit?.(user)}
                      onDelete={() => onDelete?.(user)}
                      // --- END DEMO ONLY ---
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No users found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30 mt-auto">
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 text-sm rounded border border-gray-200 bg-white text-slateInk disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 text-sm rounded border border-gray-200 bg-white text-slateInk disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
