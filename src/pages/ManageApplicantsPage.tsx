
import { useEffect, useMemo, useState } from "react";

import Layout from "../shared/components/Layout";
import ApplicationsHeader from "../components/ManageApplicants/ApplicationsHeader";
import ApplicationsTabs from "../components/ManageApplicants/ApplicationsTabs";
import ApplicationsFilters from "../components/ManageApplicants/ApplicationsFilters";
import ApplicantsTable from "../components/ManageApplicants/ApplicantsTable";
import ApplicationsPagination from "../components/ManageApplicants/ApplicationsPagination";
import ApplicantSidePanel from "../components/ManageApplicants/ApplicantSidePanel";
import type { Applicant } from "../components/ManageApplicants/types";

type ApplicantRecord = Applicant & {
  education: string;
  bio: string;
  answers: { question: string; answer: string }[];
};

const applicantsMock: ApplicantRecord[] = Array.from({ length: 25 }, (_, index) => ({
  id: String(index + 1),
  name: `Applicant ${index + 1}`,
  avatar: `https://i.pravatar.cc/100?img=${index + 10}`,
  appliedDate: "Oct 10, 2023",
  level: ["Junior", "Mid-Level", "Senior"][index % 3] as Applicant["level"],
  program: "UX Program",
  status: ["Accepted", "Pending", "Rejected"][index % 3] as Applicant["status"],
  education: "BFA Digital Design",
  bio: "Passionate about UX and accessibility.",
  answers: [
    {
      question: "Why do you want to join this mentorship?",
      answer: "I want to grow in UX and learn from mentors.",
    },
  ],
}));

export default function ApplicationsDetailsPage() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantRecord | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [statusState, setStatusState] = useState<Record<string, Applicant["status"]>>(
    Object.fromEntries(applicantsMock.map((applicant) => [applicant.id, applicant.status])) as Record<
      string,
      Applicant["status"]
    >
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const filteredApplicants = applicantsMock.filter((applicant) => {
    const currentStatus = statusState[applicant.id];

    return (
      applicant.name.toLowerCase().includes(search.toLowerCase()) &&
      (levelFilter === "All" || applicant.level === levelFilter) &&
      (statusFilter === "All" || currentStatus === statusFilter)
    );
  });

  const sortedApplicants = [...filteredApplicants].sort((a, b) => {
    const firstDate = new Date(a.appliedDate).getTime();
    const secondDate = new Date(b.appliedDate).getTime();
    return sortOrder === "ASC" ? firstDate - secondDate : secondDate - firstDate;
  });

  const totalPages = Math.max(1, Math.ceil(sortedApplicants.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * rowsPerPage;
  const paginatedApplicants = sortedApplicants.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, search, levelFilter, statusFilter, sortOrder]);

  const handleRowClick = (applicant: ApplicantRecord) => {
    setSelectedApplicant({
      ...applicant,
      status: statusState[applicant.id],
    });
    setIsPanelOpen(true);
  };

  const handleStatusChange = (id: string, nextStatus: Applicant["status"]) => {
    setStatusState((prev) => ({
      ...prev,
      [id]: nextStatus,
    }));

    setSelectedApplicant((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            status: nextStatus,
          }
        : prev
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <ApplicationsHeader
          title="My Applications"
          description="Review and manage all applications submitted to your programs."
        />

        <ApplicationsTabs statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[280px] flex-1">
            <ApplicationsFilters
              search={search}
              setSearch={setSearch}
              levelFilter={levelFilter}
              setLevelFilter={setLevelFilter}
              sortOrder={sortOrder}
              setSortOrder={(value) => setSortOrder(value as "ASC" | "DESC")}
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
          data={paginatedApplicants}
          statusState={statusState}
          setStatusState={setStatusState}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          onRowClick={handleRowClick}
          onChangeStatus={handleStatusChange}
        />

        <ApplicationsPagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={sortedApplicants.length}
          pageSize={rowsPerPage}
          onPageChange={setCurrentPage}
        />

        <ApplicantSidePanel
          applicant={selectedApplicant}
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          onAccept={(id: string) => handleStatusChange(id, "Accepted")}
          onReject={(id: string) => handleStatusChange(id, "Rejected")}
        />
      </div>
    </Layout>
  );
}
