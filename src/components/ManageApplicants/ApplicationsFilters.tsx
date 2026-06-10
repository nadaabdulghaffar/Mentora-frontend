import { Search, Filter } from "lucide-react";

type Props = {
  search: string;
  setSearch: (val: string) => void;
  levelFilter: string;
  setLevelFilter: (val: string) => void;
};

export default function ApplicationsFilters({
  search,
  setSearch,
  levelFilter,
  setLevelFilter,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border px-5 py-3 flex items-center gap-3 shadow-sm">
      <div className="flex items-center gap-2 flex-1 bg-gray-100 rounded-lg px-3 py-2">
        <Search size={16} className="text-gray-400" />
        <input
          placeholder="Search..."
          className="bg-transparent outline-none text-[13px] w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-[13px]">
        <Filter size={14} />
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="bg-transparent outline-none"
        >
          <option value="All">All</option>
          <option value="Beginner">Beginner</option>
          <option value="Junior">Junior</option>
          <option value="Mid">Mid</option>
          <option value="Senior">Senior</option>
        </select>
      </div>
    </div>
  );
}