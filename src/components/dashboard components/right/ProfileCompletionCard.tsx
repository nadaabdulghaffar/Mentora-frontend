const ProfileCompletionCard = () => {
    const completion = 70;

    return (
        <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm">

            <h3 className="text-base md:text-lg lg:text-xl font-semibold text-slateInk">
                Profile Completion
            </h3>

            <div className="flex justify-between text-xs md:text-sm lg:text-base text-gray-500 mt-4">
                <span>Your profile</span>
                <span>{completion}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div
                    className="h-2 bg-primary rounded-full"
                    style={{ width: `${completion}%` }}
                />
            </div>

            <p className="text-xs md:text-sm lg:text-base text-gray-400 mt-4">
                Complete your profile for better mentor match
            </p>

            <button className="mt-4 w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 transition font-medium text-sm md:text-base lg:text-lg text-slateInk">
                Complete profile
            </button>
        </div>
    );
};

export default ProfileCompletionCard;
