import { useState } from "react";
import { UsersFilterBar } from "../../components/users/UsersFilterBar";
import { UsersTable } from "../../components/users/UsersTable";
import { useAdminMentors, useAdminMentees } from "../../hooks/useAdminUsers";
import type { AdminUsersFilterParams } from "../../types/admin.types";
// --- DEMO ONLY ---
import { useEffect, useCallback } from "react";
import DemoDeleteModal from "../../components/demo/DemoDeleteModal";
import DemoEditModal, { DemoEditField } from "../../components/demo/DemoEditModal";
import toast from "react-hot-toast";
// --- END DEMO ONLY ---

const UsersPage = () => {
  const [activeTab, setActiveTab] = useState<"Mentors" | "Mentees">("Mentors");
  
  // State for pagination and filters
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");

  // Build params
  const filterParams: AdminUsersFilterParams = {
    page,
    pageSize: 10,
    searchTerm: searchTerm || undefined,
    status: status || undefined,
  };

  // Queries (Conditional fetching based on activeTab)
  const { 
    data: mentorsData, 
    isLoading: isMentorsLoading, 
    isError: isMentorsError 
  } = useAdminMentors(filterParams, activeTab === "Mentors");

  const { 
    data: menteesData, 
    isLoading: isMenteesLoading, 
    isError: isMenteesError 
  } = useAdminMentees(filterParams, activeTab === "Mentees");

  // Determine active dataset
  const activeData = activeTab === "Mentors" ? mentorsData?.data : menteesData?.data;
  const isLoading = activeTab === "Mentors" ? isMentorsLoading : isMenteesLoading;
  const isError = activeTab === "Mentors" ? isMentorsError : isMenteesError;

  // Handlers
  const handleTabChange = (tab: "Mentors" | "Mentees") => {
    setActiveTab(tab);
    setPage(1); // Reset page on tab switch
    // --- DEMO ONLY ---
    setIsInitialized(false);
    // --- END DEMO ONLY ---
  };

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1); // Reset page on filter change
    // --- DEMO ONLY ---
    setIsInitialized(false);
    // --- END DEMO ONLY ---
  }, []);

  const handleStatusChange = useCallback((val: string) => {
    setStatus(val);
    setPage(1); // Reset page on filter change
    // --- DEMO ONLY ---
    setIsInitialized(false);
    // --- END DEMO ONLY ---
  }, []);

  // --- DEMO ONLY ---
  const [demoItems, setDemoItems] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [itemToModify, setItemToModify] = useState<any>(null);

  useEffect(() => {
    if (!isInitialized && activeData?.items && activeData.pageNumber === page) {
      setDemoItems(activeData.items);
      setIsInitialized(true);
    }
  }, [activeData, isInitialized, page]);

  const handleDeleteConfirm = () => {
    if (itemToModify) {
      setDemoItems(prev => prev.filter(i => i.userId !== itemToModify.userId));
      toast.success("User deleted successfully (Demo)");
    }
  };

  const handleEditSave = (updatedData: any) => {
    setDemoItems(prev => prev.map(i => i.userId === updatedData.userId ? updatedData : i));
    toast.success("User updated successfully (Demo)");
  };

  const editFields: DemoEditField[] = [
    { key: "fullName", label: "Full Name", type: "text" },
    { key: "email", label: "Email", type: "text" },
  ];
  // --- END DEMO ONLY ---

  return (
    <div className="w-full h-full flex flex-col max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-bold text-slateInk mb-2">Users Management</h1>
        <p className="text-gray-500">Manage mentors and mentees across the platform.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => handleTabChange("Mentors")}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "Mentors" ? "text-primary" : "text-gray-500 hover:text-slateInk"
          }`}
        >
          Mentors
          {activeTab === "Mentors" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-md" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("Mentees")}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "Mentees" ? "text-primary" : "text-gray-500 hover:text-slateInk"
          }`}
        >
          Mentees
          {activeTab === "Mentees" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-md" />
          )}
        </button>
      </div>

      <UsersFilterBar 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
      />

      <div className="flex-1">
        <UsersTable 
          // --- DEMO ONLY ---
          data={isInitialized ? demoItems : activeData?.items}
          // --- END DEMO ONLY ---
          isLoading={isLoading}
          isError={isError}
          page={page}
          totalPages={activeData?.totalPages ?? 1}
          onPageChange={(p) => {
            setPage(p);
            // --- DEMO ONLY ---
            setIsInitialized(false);
            // --- END DEMO ONLY ---
          }}
          roleType={activeTab === "Mentors" ? "Mentor" : "Mentee"}
          // --- DEMO ONLY ---
          onEdit={(user) => {
            setItemToModify(user);
            setEditModalOpen(true);
          }}
          onDelete={(user) => {
            setItemToModify(user);
            setDeleteModalOpen(true);
          }}
          // --- END DEMO ONLY ---
        />
      </div>

      {/* --- DEMO ONLY --- */}
      <DemoDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        itemName={itemToModify?.fullName || "User"}
      />
      <DemoEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
        title="Edit User"
        initialData={itemToModify}
        fields={editFields}
      />
      {/* --- END DEMO ONLY --- */}
    </div>
  );
};

export default UsersPage;
