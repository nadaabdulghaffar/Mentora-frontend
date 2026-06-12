import { useAdminProgramDetail } from "../../hooks/useAdminPrograms";
import { AlertCircle, Clock, Users, Calendar, MapPin, Loader2, ShieldCheck } from "lucide-react";
import { ProfileAvatar } from "../../../components/profile";

interface ProgramDetailPanelProps {
  programId: number;
}

const ProgramDetailPanel = ({ programId }: ProgramDetailPanelProps) => {
  const { data, isLoading, isError } = useAdminProgramDetail(programId);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p>Loading program details...</p>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="h-full flex items-center justify-center flex-col text-red-500 gap-2 p-8 text-center">
        <AlertCircle size={48} />
        <p className="font-medium text-lg mt-2">Program Not Found</p>
        <p className="text-sm text-gray-500">The program details could not be loaded or the program has been deleted.</p>
      </div>
    );
  }

  const detail = data.data;

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header Info */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex-shrink-0">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold font-poppins text-slateInk">{detail.programTitle}</h2>
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {detail.domainName}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          {detail.programDescription || "No description provided."}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Duration</p>
              <p className="font-medium text-slateInk">{detail.duration || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
            <Users className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Capacity</p>
              <p className="font-medium text-slateInk">{detail.capacity} Spots</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Created On</p>
              <p className="font-medium text-slateInk">{new Date(detail.createdDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
            <AlertCircle className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Deadline</p>
              <p className="font-medium text-slateInk">{new Date(detail.deadline).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {/* Mentor Section */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Program Mentor
          </h3>
          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 flex items-center gap-4">
            <ProfileAvatar 
              pictureUrl={detail.mentorProfilePictureUrl} 
              name={detail.mentorName} 
              alt={detail.mentorName} 
              className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-200"
            />
            <div>
              <p className="font-medium text-lg text-slateInk">{detail.mentorName}</p>
              <p className="text-sm text-gray-500">{detail.mentorEmail}</p>
            </div>
          </div>
        </div>

        {/* Mentee Section */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Mentee Statistics
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-green-700">{detail.acceptedMenteesCount}</p>
              <p className="text-xs font-medium text-green-600 uppercase mt-1">Accepted</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-yellow-700">{detail.pendingMenteesCount}</p>
              <p className="text-xs font-medium text-yellow-600 uppercase mt-1">Pending</p>
            </div>
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-red-700">{detail.rejectedMenteesCount}</p>
              <p className="text-xs font-medium text-red-600 uppercase mt-1">Rejected</p>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
              <h4 className="font-medium text-sm text-slateInk">Accepted Mentees List</h4>
            </div>
            {detail.mentees && detail.mentees.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {detail.mentees.map(mentee => (
                  <li key={mentee.menteeId} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div>
                      <p className="font-medium text-slateInk text-sm">{mentee.fullName}</p>
                      <p className="text-xs text-gray-500">{mentee.email}</p>
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      Accepted: {new Date(mentee.acceptanceDate).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                No mentees have been accepted yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetailPanel;
