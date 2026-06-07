import { ChevronRight, ChevronDown } from "lucide-react";
import type { Applicant } from "./types";
import { statusStyles, statusDot } from "./constants";

type Props = {
  app: Applicant;
  status: Applicant["status"];
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  onChangeStatus: (id: string, status: Applicant["status"]) => void;
};

export default function ApplicantRow({
  app,
  status,
  openDropdown,
  setOpenDropdown,
  onChangeStatus,
}: Props) {
  return (
    <div
      className="grid items-center bg-white rounded-2xl px-6 py-5 border hover:shadow-md transition"
      style={{
        gridTemplateColumns: "2.2fr 1.4fr 1.2fr 2fr 1.6fr auto",
      }}
    >
      <div className="flex items-center gap-4">
        <img src={app.avatar} className="w-12 h-12 rounded-full" />
        <span className="font-semibold text-[16px] text-[#1F2432]">
          {app.name}
        </span>
      </div>

      <span className="text-[14px] text-gray-500">{app.appliedDate}</span>

      <span className="text-[13px] px-3 py-1.5 rounded-full border w-fit bg-blue-50 text-blue-600">
        {app.level}
      </span>

      <span className="text-[14px] text-gray-700 font-medium">
        {app.program}
      </span>

      <div className="relative pr-6">
        <button
          onClick={() =>
            setOpenDropdown(openDropdown === app.id ? null : app.id)
          }
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-medium ${statusStyles[status]}`}
        >
          <span className={`w-2 h-2 rounded-full ${statusDot[status]}`} />
          {status}
          <ChevronDown size={14} />
        </button>

        {openDropdown === app.id && (
          <div className="absolute mt-2 w-36 bg-white border rounded-xl shadow-lg z-10">
            {["Accepted", "Pending", "Rejected"].map((s) => (
              <div
                key={s}
                onClick={() => onChangeStatus(app.id, s as Applicant["status"])}
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end text-gray-400">
        <ChevronRight size={20} />
      </div>
    </div>
  );
}