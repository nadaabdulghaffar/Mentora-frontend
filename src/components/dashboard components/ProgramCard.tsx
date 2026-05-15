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
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EEF1F7] flex flex-col">
            <div className="relative">
                <img src={imageUrl} alt={mentorName} className="w-full h-40 object-cover" />
                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary">{field}</div>
                <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs text-gray-600">{matchPercentage}%</div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
                    <p className="text-sm text-gray-600 mt-2">Mentor: {mentorName}</p>
                </div>

                <div className="mt-4 flex justify-end">
                    <button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition">Apply</button>
                </div>
            </div>
        </div>
    );
};

export default ProgramCard;
