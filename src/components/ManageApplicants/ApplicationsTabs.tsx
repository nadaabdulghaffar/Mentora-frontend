import { tabs } from "./constants";

type Props = {
  statusFilter: string;
  setStatusFilter: (val: string) => void;
};

export default function ApplicationsTabs({ statusFilter, setStatusFilter }: Props) {
  return (
    <div className="flex gap-10 border-b border-gray-200 pb-3">
      {tabs.map((tab) => {
        const isActive = statusFilter === tab;

        return (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`relative text-[15px] font-medium ${
              isActive ? "text-primary" : "text-gray-500"
            }`}
          >
            {tab === "All" ? "All Applicants" : tab}

            {isActive && (
              <span className="absolute left-0 -bottom-3 w-full h-[2px] bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}