interface Props {
    title: string;
    mentorName: string;
    field: string;
    matchPercentage: number;
    imageUrl: string;
}

const ProgramCard = ({
    title,
    mentorName,
    field,
    matchPercentage,
    imageUrl,
}: Props) => {
    return (
        <div className="bg-[#F3F2F7] rounded-2xl p-4 flex flex-col justify-between shadow-sm">

            {/* Top Section */}
            <div className="flex gap-4">

                {/* Mentor Image */}
                <img
                    src={imageUrl}
                    alt={mentorName}
                    className="w-16 h-16 rounded-xl object-cover"
                />

                {/* Info */}
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                        {title}
                    </h4>

                    <p className="text-sm text-gray-600 mt-1">
                        Mentor: {mentorName}
                    </p>

                    <p className="text-sm text-gray-400">
                        {field}
                    </p>
                </div>

                {/* Match */}
                <div className="text-right">
                    <p className="text-primary
 font-semibold">
                        {matchPercentage}%
                    </p>
                    <p className="text-xs text-gray-500">
                        Match
                    </p>
                </div>

            </div>

            {/* Button */}
            <button className="mt-4 w-full py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition">
                Apply Now
            </button>
        </div>
    );
};

export default ProgramCard;
