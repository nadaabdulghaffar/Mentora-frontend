import { useState, useEffect } from "react";
import { AlertCircle, Search } from "lucide-react";
import { useAdminCommunities } from "../../hooks/useAdminCommunities";
import { useDebounce } from "../../../hooks/useDebounce";
// --- DEMO ONLY ---
import DemoDeleteModal from "../../components/demo/DemoDeleteModal";
import DemoEditModal, { DemoEditField } from "../../components/demo/DemoEditModal";
import { Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
// --- END DEMO ONLY ---

const CommunitiesPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isError } = useAdminCommunities({
    pageNumber: page,
    pageSize: 10,
    search: debouncedSearch || undefined,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
    // --- DEMO ONLY ---
    setIsInitialized(false);
    // --- END DEMO ONLY ---
  };

  // --- DEMO ONLY ---
  const [demoItems, setDemoItems] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [itemToModify, setItemToModify] = useState<any>(null);

  useEffect(() => {
    if (!isInitialized && data?.data?.items && data.data.pageNumber === page) {
      setDemoItems(data.data.items);
      setIsInitialized(true);
    }
  }, [data, isInitialized, page]);

  const handleDeleteConfirm = () => {
    if (itemToModify) {
      setDemoItems(prev => prev.filter(i => i.communityId !== itemToModify.communityId));
      toast.success("Community deleted successfully (Demo)");
    }
  };

  const handleEditSave = (updatedData: any) => {
    setDemoItems(prev => prev.map(i => i.communityId === updatedData.communityId ? updatedData : i));
    toast.success("Community updated successfully (Demo)");
  };

  const editFields: DemoEditField[] = [
    { key: "name", label: "Community Name", type: "text" },
    { key: "domainName", label: "Domain", type: "text" },
    { key: "createdByUserName", label: "Owner", type: "text" },
  ];
  // --- END DEMO ONLY ---

  return (
    <div className="w-full h-full flex flex-col max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-slateInk mb-2">Communities</h1>
          <p className="text-gray-500">Monitor all active communities across the platform.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            placeholder="Search communities..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slateInk">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Community</th>
                <th className="px-6 py-4">Domain</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4 text-center">Members</th>
                <th className="px-6 py-4 text-center">Posts</th>
                <th className="px-6 py-4">Created Date</th>
                {/* --- DEMO ONLY --- */}
                <th className="px-6 py-4 text-right">Actions</th>
                {/* --- END DEMO ONLY --- */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle size={32} className="mb-2" />
                      <p>Failed to load communities. Please try again.</p>
                    </div>
                  </td>
                </tr>
              ) : isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-48 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 rounded mx-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 rounded mx-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              ) : (isInitialized ? demoItems : data?.data?.items) && (isInitialized ? demoItems : data?.data.items).length > 0 ? (
                (isInitialized ? demoItems : data?.data.items).map((community: any) => (
                  <tr key={community.communityId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{community.name}</td>
                    <td className="px-6 py-4 text-gray-600">{community.domainName}</td>
                    <td className="px-6 py-4 text-gray-600">{community.createdByUserName}</td>
                    <td className="px-6 py-4 text-center font-medium">{community.memberCount}</td>
                    <td className="px-6 py-4 text-center font-medium">{community.postCount}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(community.createdAt).toLocaleDateString()}</td>
                    {/* --- DEMO ONLY --- */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setItemToModify(community);
                            setEditModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Edit Community (Demo)"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setItemToModify(community);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Community (Demo)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    {/* --- END DEMO ONLY --- */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No communities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(data?.data.totalPages ?? 0) > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30 mt-auto">
            <span className="text-sm text-gray-500">
              Page {page} of {data?.data.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPage(page - 1);
                  setIsInitialized(false);
                }}
                disabled={page <= 1}
                className="px-3 py-1 text-sm rounded border border-gray-200 bg-white text-slateInk disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  setPage(page + 1);
                  setIsInitialized(false);
                }}
                disabled={page >= data!.data.totalPages}
                className="px-3 py-1 text-sm rounded border border-gray-200 bg-white text-slateInk disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- DEMO ONLY --- */}
      <DemoDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Community"
        itemName={itemToModify?.name || "Community"}
      />
      <DemoEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
        title="Edit Community"
        initialData={itemToModify}
        fields={editFields}
      />
      {/* --- END DEMO ONLY --- */}
    </div>
  );
};

export default CommunitiesPage;
