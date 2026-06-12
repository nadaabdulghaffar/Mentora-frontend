import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, AlertCircle } from "lucide-react";
import { useAdminPrograms } from "../../hooks/useAdminPrograms";
import { useDebounce } from "../../../hooks/useDebounce";
import ProgramDetailPanel from "./ProgramDetailPanel";
// --- DEMO ONLY ---
import DemoDeleteModal from "../../components/demo/DemoDeleteModal";
import DemoEditModal, { DemoEditField } from "../../components/demo/DemoEditModal";
import { Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
// --- END DEMO ONLY ---

const ProgramsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIdParam = searchParams.get("selectedId");
  const selectedProgramId = selectedIdParam ? parseInt(selectedIdParam, 10) : null;

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isError } = useAdminPrograms({
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

  const handleSelectProgram = (id: number) => {
    setSearchParams({ selectedId: id.toString() });
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
      setDemoItems(prev => prev.filter(i => i.programId !== itemToModify.programId));
      toast.success("Program deleted successfully (Demo)");
    }
  };

  const handleEditSave = (updatedData: any) => {
    setDemoItems(prev => prev.map(i => i.programId === updatedData.programId ? updatedData : i));
    toast.success("Program updated successfully (Demo)");
  };

  const editFields: DemoEditField[] = [
    { key: "programTitle", label: "Title", type: "text" },
    { key: "domainName", label: "Domain", type: "text" },
    { key: "mentorName", label: "Mentor", type: "text" },
  ];
  // --- END DEMO ONLY ---

  return (
    <div className="w-full h-full flex flex-col max-w-[1600px] mx-auto overflow-hidden">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-poppins font-bold text-slateInk mb-2">Programs</h1>
        <p className="text-gray-500">Monitor mentorship programs and review applicant statistics.</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-160px)] min-h-[600px]">
        {/* Left Side: Queue / List */}
        <div className={`flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${selectedProgramId ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
          {/* Header & Filters */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Search programs by title or mentor..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {isError ? (
              <div className="flex flex-col items-center justify-center text-red-500 h-full">
                <AlertCircle size={32} className="mb-2" />
                <p>Failed to load programs.</p>
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (isInitialized ? demoItems : data?.data?.items) && (isInitialized ? demoItems : data?.data.items).length > 0 ? (
              <div className="space-y-3">
                {(isInitialized ? demoItems : data?.data.items).map((program: any) => (
                  <div
                    key={program.programId}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedProgramId === program.programId
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="cursor-pointer flex-1" onClick={() => handleSelectProgram(program.programId)}>
                        <h3 className="font-semibold text-slateInk text-base">{program.programTitle}</h3>
                        <p className="text-xs font-medium text-primary bg-primary/10 inline-block px-2 py-0.5 rounded mt-1">
                          {program.domainName}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        {/* --- DEMO ONLY --- */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToModify(program);
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Edit Program (Demo)"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToModify(program);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Program (Demo)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {/* --- END DEMO ONLY --- */}
                        <span className="text-xs text-gray-500">{new Date(program.createdDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3 cursor-pointer" onClick={() => handleSelectProgram(program.programId)}>
                      Mentor: <span className="font-medium text-slateInk">{program.mentorName}</span>
                    </div>

                    <div className="flex gap-4 text-xs font-medium cursor-pointer" onClick={() => handleSelectProgram(program.programId)}>
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                        {program.acceptedMenteesCount} Accepted
                      </span>
                      <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                        {program.pendingMenteesCount} Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No programs found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {(data?.data.totalPages ?? 0) > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
              <span className="text-xs text-gray-500">Page {page} of {data?.data.totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPage(page - 1);
                    setIsInitialized(false);
                  }}
                  disabled={page <= 1}
                  className="px-2 py-1 text-xs rounded border border-gray-200 bg-white text-slateInk disabled:opacity-50 hover:bg-gray-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => {
                    setPage(page + 1);
                    setIsInitialized(false);
                  }}
                  disabled={page >= data!.data.totalPages}
                  className="px-2 py-1 text-xs rounded border border-gray-200 bg-white text-slateInk disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Detail View */}
        <div className={`flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
          selectedProgramId ? 'w-1/2 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-4 border-none'
        }`}>
          {selectedProgramId && (
            <ProgramDetailPanel programId={selectedProgramId} />
          )}
        </div>
      </div>

      {/* --- DEMO ONLY --- */}
      <DemoDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Program"
        itemName={itemToModify?.programTitle || "Program"}
      />
      <DemoEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
        title="Edit Program"
        initialData={itemToModify}
        fields={editFields}
      />
      {/* --- END DEMO ONLY --- */}
    </div>
  );
};

export default ProgramsPage;
