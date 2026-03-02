import { Search } from "lucide-react";

const SearchSection = () => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm">

            {/* Title */}
            <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-800 mb-4">
                Share your Thoughts , find your mentor
            </h3>

            {/* Search Row */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 lg:gap-6">

                {/* Input Wrapper */}
                <div className="relative flex-1">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="How can Mentora help you today?"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                </div>

                {/* Button */}
                <button className="px-4 md:px-6 lg:px-8 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition font-medium text-gray-700 text-sm md:text-base flex-shrink-0">
                    Search
                </button>

            </div>
        </div>
    );
};

export default SearchSection;
