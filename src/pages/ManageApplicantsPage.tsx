
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";

import Layout from "../shared/components/Layout";
import ApplicationsHeader from "../components/ManageApplicants/ApplicationsHeader";
import ApplicationsTabs from "../components/ManageApplicants/ApplicationsTabs";
import ApplicationsFilters from "../components/ManageApplicants/ApplicationsFilters";
import ApplicantsTable from "../components/ManageApplicants/ApplicantsTable";
import ApplicationsPagination from "../components/ManageApplicants/ApplicationsPagination";
import ApplicantSidePanel from "../components/ManageApplicants/ApplicantSidePanel";

import SendResultsModal
from "../components/ManageApplicants/SendResultsModal";

import { useParams } from "react-router-dom";

import type {
  ApplicantListItemDto,
  ProgramApplicantsResponseDto,
} from "../components/ManageApplicants/types";


import {
  getApplicantsByProgram,
    acceptApplicant,
  rejectApplicant,
  setApplicantPending,
    exportApplicants,
      sendResults,

} from "../services/programService";



export default function ApplicationsDetailsPage() {
  const [search, setSearch] = useState("");
  const { id } = useParams();

const [applicants, setApplicants] =
  useState<ApplicantListItemDto[]>([]);

const [, setLoading] =
  useState(false);

const [applicantsData, setApplicantsData] =
  useState<ProgramApplicantsResponseDto | null>(
    null
  );

  const [levelFilter, setLevelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
const [selectedApplicant, setSelectedApplicant] =
  useState<ApplicantListItemDto | null>(
    null
  );
    const [isPanelOpen, setIsPanelOpen] = useState(false);


  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [showSendModal, setShowSendModal] =
  useState(false);

const [sendingResults, setSendingResults] =
  useState(false);

 

 


  const fetchApplicants = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await getApplicantsByProgram(
        Number(id),
        currentPage,
        rowsPerPage,
        statusFilter === "All" ? undefined : statusFilter,
        search,
        levelFilter === "All" ? undefined : levelFilter
      );
      setApplicants(response.data.items);
      setApplicantsData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, currentPage, rowsPerPage, statusFilter, search, levelFilter]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, search, levelFilter, statusFilter]);


const handleRowClick = (
  applicant: ApplicantListItemDto
) => {
    console.log(applicant);


  setSelectedApplicant(applicant);

  setIsPanelOpen(true);
};


const handleExport =
  async () => {

    try {

      const blob =
        await exportApplicants(
          Number(id)
        );

      const url =
        window.URL.createObjectURL(
          new Blob([blob])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        "Applicants.xlsx"
      );

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

    } catch (error) {

      console.error(error);
    }
};

const handleSendResults =
  async () => {
    try {
      setSendingResults(true);
      await sendResults(Number(id));
      setShowSendModal(false);
      toast.success("Results notifications sent successfully.");
      
      // Refresh the applicants list to update notification badges
      await fetchApplicants();
    } catch (error: any) {
      console.error(error);
      setShowSendModal(false);
      
      // Fallback message if backend does not provide one or if it's generic
      const msg = error?.response?.data?.message || "There are no new accepted or rejected applicants to notify.";
      toast.error(msg);
    } finally {
      setSendingResults(false);
    }
};


const handleStatusChange =
  async (
    applicationId: number,
    nextStatus: string
  ) => {

    try {

      // update table
      setApplicants((prev) =>
        prev.map((app) =>
          app.applicationId ===
          applicationId
            ? {
                ...app,
                status: nextStatus,
              }
            : app
        )
      );

      // update side panel
      setSelectedApplicant((prev: any) =>
        prev &&
        prev.applicationId ===
          applicationId
          ? {
              ...prev,
              status: nextStatus,
            }
          : prev
      );

      if (nextStatus === "Accepted") {

        await acceptApplicant(
          applicationId
        );

      } else if (
        nextStatus === "Rejected"
      ) {

        await rejectApplicant(
          applicationId
        );

      } else if (
        nextStatus === "Pending"
      ) {

        await setApplicantPending(
          applicationId
        );
      }

    } catch (error) {

      console.error(error);
    }
};

  return (
    <Layout>
      <div className="space-y-6">
<ApplicationsHeader
  title="Manage Applicants"
  description="Review, evaluate, and manage applicant submissions for this program."
  onExport={handleExport}
  onSendResults={() =>
    setShowSendModal(true)
  }
/>
        <ApplicationsTabs statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[280px] flex-1">
            <ApplicationsFilters
              search={search}
              setSearch={setSearch}
              levelFilter={levelFilter}
              setLevelFilter={setLevelFilter}
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-3 py-2 shadow-sm">
            <span className="text-sm text-gray-500">Rows:</span>
            {[4, 8, 12].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setRowsPerPage(count)}
                className={`rounded-lg px-3 py-1 text-sm transition ${
                  rowsPerPage === count ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <ApplicantsTable
data={applicants}

          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          onRowClick={handleRowClick}
onChangeStatus={handleStatusChange}        />

        <ApplicationsPagination
  currentPage={
    applicantsData?.currentPage || 1
  }
  totalPages={
    applicantsData?.totalPages || 1
  }
  totalItems={
    applicantsData?.totalCount || 0
  }
  pageSize={rowsPerPage}
  onPageChange={setCurrentPage}
/>
<ApplicantSidePanel
  applicant={selectedApplicant}
  isOpen={isPanelOpen}
  onClose={() =>
    setIsPanelOpen(false)
  }

  onAccept={(id: number) =>
    handleStatusChange(
      id,
      "Accepted"
    )
  }

  onReject={(id: number) =>
    handleStatusChange(
      id,
      "Rejected"
    )
  }
/>

<SendResultsModal
  open={showSendModal}
  loading={sendingResults}
  onClose={() =>
    setShowSendModal(false)
  }
  onConfirm={handleSendResults}
/>

      </div>
    </Layout>
  );
}
