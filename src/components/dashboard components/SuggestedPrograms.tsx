import ProgramCard from "./ProgramCard";

const SuggestedPrograms = () => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm">

            {/* Header */}
            <div className="flex justify-between items-start mb-6">

                <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        Programs Suggested for you
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                        AI-matched based on your goals
                    </p>
                </div>

                <button className="text-sm text-gray-500 hover:text-primary
 transition">
                    View all
                </button>
            </div>

            {/* Cards Wrapper */}
            <div className="overflow-x-auto no-scrollbar">
                <div className="flex gap-6 min-w-max">

                    <div className="w-[380px] flex-shrink-0">
                        <ProgramCard
                            title="Career Acceleration Program"
                            mentorName="Sarah Chen"
                            field="Product Management"
                            matchPercentage={92}
                            imageUrl="https://randomuser.me/api/portraits/women/44.jpg"
                        />
                    </div>

                    <div className="w-[380px] flex-shrink-0">
                        <ProgramCard
                            title="Career Acceleration Program"
                            mentorName="Sarah Chen"
                            field="Product Management"
                            matchPercentage={88}
                            imageUrl="https://randomuser.me/api/portraits/women/45.jpg"
                        />
                    </div>

                    <div className="w-[380px] flex-shrink-0">
                        <ProgramCard
                            title="Career Acceleration Program"
                            mentorName="Sarah Chen"
                            field="Product Management"
                            matchPercentage={88}
                            imageUrl="https://randomuser.me/api/portraits/women/45.jpg"
                        />
                    </div>

                </div>
            </div>
            {/* Slider Indicators */}
            <div className="flex justify-center items-center gap-3 mt-6">
                <div className="w-12 h-2 bg-gray-400/70 rounded-full"></div>
                <div className="w-5 h-2 bg-gray-300/60 rounded-full"></div>
            </div>


        </div>
    );
};

export default SuggestedPrograms;
