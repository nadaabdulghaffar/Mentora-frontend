
import {
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export default function ApplicantsTable({
  data,
  statusState,
  setStatusState,
  openDropdown,
  setOpenDropdown,
  onRowClick,
  onChangeStatus,
}: any) {
  const statusStyles = {
    Accepted: "bg-green-50 text-green-700",
    Pending: "bg-purple-50 text-purple-700",
    Rejected: "bg-gray-100 text-gray-500",
  };

  const statusDot = {
    Accepted: "bg-green-500",
    Pending: "bg-purple-500",
    Rejected: "bg-gray-400",
  };

  return (
    <>
      {/* HEADER */}
      <div className="hidden md:grid grid-cols-[2fr_1.2fr_1fr_2fr_1.5fr_auto] px-8 py-4 text-[14px] font-semibold text-gray-500 uppercase">
        <span>Name</span>
        <span>Applied</span>
        <span>Level</span>
        <span>Program</span>
        <span>Status</span>
        <span></span>
      </div>

      {/* ROWS */}
      <div className="space-y-4">
        {data.map((app: any) => {
          const currentStatus = statusState[app.id];

          return (
            <div
              key={app.id}
              onClick={() => onRowClick(app)}
              className="cursor-pointer bg-white rounded-2xl border px-8 py-5 shadow-sm hover:shadow-md transition"
            >
              <div className="grid grid-cols-[2fr_1.2fr_1fr_2fr_1.5fr_auto] gap-6 items-center">

                {/* NAME */}
                <div className="flex items-center gap-4">
                  <img src={app.avatar} className="w-14 h-14 rounded-full" />
                  <span className="font-semibold text-[17px]">
                    {app.name}
                  </span>
                </div>

                {/* DATE */}
                <span className="text-[15px] text-gray-500">
                  {app.appliedDate}
                </span>

                {/* LEVEL */}
                <span className="text-[14px] px-4 py-2 rounded-full border bg-gray-50 w-fit">
                  {app.level}
                </span>

                {/* PROGRAM */}
                <span className="text-[15px] text-gray-700">
                  {app.program}
                </span>

                {/* STATUS */}
                <div
                  className="flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()} // مهم 👈
                >
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === app.id ? null : app.id
                        )
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] ${statusStyles[currentStatus]}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${statusDot[currentStatus]}`}
                      />
                      {currentStatus}
                      <ChevronDown size={16} />
                    </button>

                    {openDropdown === app.id && (
                      <div className="absolute mt-2 w-36 bg-white border rounded-xl shadow-lg z-10">
                        {["Accepted", "Pending", "Cancelled"].map((s) => (
                          <div
                            key={s}
                            onClick={() => {
                              setStatusState((prev: any) => ({
                                ...prev,
                                [app.id]: s,
                              }));
                              onChangeStatus?.(app.id, s);
                              setOpenDropdown(null);
                            }}
                            className="px-4 py-3 text-[14px] hover:bg-gray-100 cursor-pointer"
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <ChevronRight size={22} className="text-gray-400" />
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
