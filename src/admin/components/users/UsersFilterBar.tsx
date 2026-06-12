import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface UsersFilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
}

export const UsersFilterBar = ({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
}: UsersFilterBarProps) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search users..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-slateInk"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-500 font-medium">Status:</label>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-slateInk bg-white cursor-pointer"
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
      </div>
    </div>
  );
};
