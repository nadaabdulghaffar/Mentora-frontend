import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRecentApplications } from "../../services/programService";
import { ProfileAvatar } from "../profile/ProfileAvatar";

const COMPONENT_NAME = "MentorActiveApplicationsSection";

/* =========================
   TYPES
========================= */
type DashboardApplication = {
  applicationId: number;
  programId: number;
  applicantName: string;
  applicantAvatar: string | null;
  appliedAt: string;
  level: string;
  programName: string;
};


/* =========================
   STYLES
========================= */
const levelStyles = {
  Senior: "bg-blue-50 text-blue-600",
  "Mid-level": "bg-purple-50 text-purple-600",
  Junior: "bg-green-50 text-green-600",
};

export default function ActiveApplicationsSection() {
  const navigate = useNavigate();

  const { data: response, isLoading: loading } = useQuery({
    queryKey: ["recentApplications"],
    queryFn: getRecentApplications,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const applications: DashboardApplication[] = response?.data || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <h2 className="text-[22px] font-bold text-[#1F2432]">
          Active Applications
        </h2>

        {/* 🔥 VIEW ALL BUTTON */}
        <button
          onClick={() => navigate("/applications")}
          className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-[14px] font-semibold hover:bg-primary/20 transition"
        >
          View All
        </button>
      </div>

      {/* TABLE HEADER */}
      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_2fr_auto] px-8 py-4 text-[13px] font-semibold text-gray-500 uppercase tracking-wide">
        <span>Applicant Name</span>
        <span>Date</span>
        <span>Level</span>
        <span>Applied Program</span>
        <span></span>
      </div>

      {/* ROWS */}
      <div className="space-y-3 px-4 pb-4 pt-2">
        {applications.map((app) => (
          <div
            key={app.applicationId}

onClick={() =>
  navigate(
    `/applications/${app.programId}/manage`
  )
}
            className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] items-center px-6 py-5 bg-white border rounded-2xl hover:shadow-md transition cursor-pointer"
          >
            {/* NAME */}
            <div className="flex items-center gap-4">
              <ProfileAvatar
                pictureUrl={app.applicantAvatar}
                name={app.applicantName}
                className="w-12 h-12 rounded-full object-cover"
              />

              <span className="font-semibold text-[16px] text-[#1F2432]">
                {app.applicantName}
              </span>
            </div>

            {/* DATE */}
            <span className="text-[15px] text-gray-500 font-medium">
              {new Date(app.appliedAt)
  .toLocaleDateString()}
            </span>

            {/* LEVEL */}
            <span
className={`text-[13px] px-3 py-1 rounded-full font-semibold w-fit ${
  levelStyles[
    app.level as keyof typeof levelStyles
  ]
}`}
            >
              {app.level}
            </span>

            {/* PROGRAM */}
            <span className="text-[15px] text-gray-700 font-medium">
              {app.programName}
            </span>

            {/* 🔥 BIGGER ARROW */}
            <div className="flex justify-end">
              <ChevronRight
                size={26}
                strokeWidth={2.5}
                className="text-gray-400"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
