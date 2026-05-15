import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

type LevelKey = "Senior" | "Mid-level" | "Junior";

const LEVEL_STYLES: Record<LevelKey, string> = {
  Senior: "bg-sky-100 text-sky-800",
  "Mid-level": "bg-violet-100 text-violet-800",
  Junior: "bg-emerald-100 text-emerald-800",
};

const ROWS: {
  id: string;
  name: string;
  avatar: string;
  date: string;
  level: LevelKey;
  program: string;
}[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80",
    date: "Oct 12, 2023",
    level: "Senior",
    program: "Leadership Coaching",
  },
  {
    id: "2",
    name: "Emma Robinson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80",
    date: "Oct 11, 2023",
    level: "Mid-level",
    program: "Product Leadership",
  },
  {
    id: "3",
    name: "James Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80",
    date: "Oct 10, 2023",
    level: "Junior",
    program: "Project Management",
  },
];

const MentorActiveApplicationsSection = () => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6 lg:p-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-[#1F2533] md:text-lg lg:text-xl">
          Active Applications
        </h3>
        <Link
          to="/search-mentorship?tab=programs"
          className="shrink-0 text-xs font-medium text-gray-500 transition hover:text-primary md:text-sm"
        >
          view All
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E8EBF2]">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#E8EBF2] bg-[#F9FAFB]">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280] md:px-5">
                Applicant name
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280] md:px-5">
                Date
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280] md:px-5">
                Level
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280] md:px-5">
                Applied program
              </th>
              <th className="w-10 px-2 py-3" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.id} className="border-b border-[#EEF0F5] last:border-0">
                <td className="px-4 py-4 md:px-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={row.avatar}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <span className="font-semibold text-[#1F2533]">{row.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-[#5D657A] md:px-5">{row.date}</td>
                <td className="px-4 py-4 md:px-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${LEVEL_STYLES[row.level]}`}
                  >
                    {row.level}
                  </span>
                </td>
                <td className="px-4 py-4 font-medium text-[#1F2533] md:px-5">{row.program}</td>
                <td className="px-2 py-4 text-gray-400">
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MentorActiveApplicationsSection;
