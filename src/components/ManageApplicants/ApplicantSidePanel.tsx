
import { X, CheckCircle, XCircle, Link2 } from "lucide-react";

export default function ApplicantSidePanel({
  applicant,
  isOpen,
  onClose,
  onAccept,
  onReject,
}: any) {
  if (!applicant) return null;

  const levelStyles = {
    Senior: "bg-blue-100 text-blue-600",
    "Mid-Level": "bg-purple-100 text-purple-600",
    Junior: "bg-green-100 text-green-600",
  };

  const statusStyles = {
    Accepted: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Rejected: "bg-red-100 text-red-600",
  };

  return (
    <>
      {/* OVERLAY */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/20 z-40"
        />
      )}

      {/* PANEL */}
      <div
        className={`fixed top-0 right-0 h-full w-[420px] bg-white border-l shadow-xl z-50 transform transition duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* CLOSE BUTTON */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-6 pb-6 overflow-y-auto h-full space-y-6">

          {/* PROFILE */}
          <div className="text-center">
            <img
              src={applicant.avatar}
              className="w-24 h-24 rounded-full mx-auto border-4 border-gray-100"
            />

            <h2 className="mt-4 text-[22px] font-semibold text-[#1F2432]">
              {applicant.name}
            </h2>

            <p className="text-[15px] text-primary font-medium">
              UX Design 2024
            </p>

            {/* BADGES */}
            <div className="flex justify-center gap-3 mt-3">
              {/* LEVEL */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  levelStyles[applicant.level as keyof typeof levelStyles] ||
                  "bg-gray-100 text-gray-600"
                }`}
              >
                {applicant.level}
              </span>

              {/* STATUS */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusStyles[applicant.status as keyof typeof statusStyles] ||
                  "bg-gray-100 text-gray-600"
                }`}
              >
                {applicant.status}
              </span>
            </div>

            <button className="mt-3 text-primary text-sm font-medium">
              View Full Profile →
            </button>
          </div>

          {/* INFO */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">
              Applicant Info
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Education</span>
                <span className="font-medium">
                  {applicant.education || "N/A"}
                </span>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Bio</p>
                <p className="text-gray-600 leading-relaxed">
                  {applicant.bio || "No bio"}
                </p>
              </div>
            </div>

            {/* LINKS */}
            <div className="flex gap-4 mt-4 text-primary text-sm">
              <span className="flex items-center gap-1 cursor-pointer">
                <Link2 size={14} /> LinkedIn
              </span>
              <span className="flex items-center gap-1 cursor-pointer">
                <Link2 size={14} /> Portfolio
              </span>
            </div>
          </div>

          <hr />

          {/* ANSWERS */}
          {applicant.answers && (
            <div>
              <h4 className="font-semibold text-[15px] mb-3">
                Application Answers
              </h4>

              {applicant.answers.map((a: any, i: number) => (
                <div key={i}>
                  <p className="font-medium text-[14px] mb-2">
                    {a.question}
                  </p>

                  <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 leading-relaxed">
                    {a.answer}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ACTIONS */}
          <div className="pt-4 space-y-3">

            {/* ACCEPT */}
            <button
              disabled={applicant.status === "Accepted"}
              onClick={() => onAccept(applicant.id)}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition
                ${
                  applicant.status === "Accepted"
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#1FA38A] text-white hover:opacity-90"
                }
              `}
            >
              <CheckCircle size={18} />
              Accept Application
            </button>

            {/* REJECT */}
            <button
              disabled={applicant.status === "Rejected"}
              onClick={() => onReject(applicant.id)}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition border
                ${
                  applicant.status === "Rejected"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <XCircle size={18} />
              Reject Application
            </button>

          </div>

        </div>
      </div>
    </>
  );
}
