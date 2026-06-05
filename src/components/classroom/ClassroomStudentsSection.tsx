import { AlertTriangle, Bell, FileDown, MessageSquare, Search, Trash2, UserPlus, Users } from 'lucide-react';
import { isValidUserGuid } from '../../services/messagingService';

type MentorStudentRow = {
  id: string;
  name: string;
  email: string;
  statusLabel: string;
  statusTone: 'feedback' | 'idle' | 'active';
  moduleLabel: string;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  lastActive: string;
};

type ClassroomStudentsSectionProps = {
  mentorStudents: MentorStudentRow[];
    dashboardStats: {
    studentsWaitingForReview: number;
    studentsAtRisk: number;
    averageRoadmapCompletion: number;
    activeStudents: number;
  };

  onOpenMentorSubmissionsForStudent: (studentId: string) => void;
  onMessageStudent: (studentId: string) => void;
  messagingStudentId: string | null;
  onRequestDeleteStudent: (student: MentorStudentRow) => void;
};

export default function ClassroomStudentsSection({
  mentorStudents,
  dashboardStats,
  onOpenMentorSubmissionsForStudent,
  onMessageStudent,
  messagingStudentId,
  onRequestDeleteStudent,
}: ClassroomStudentsSectionProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-[#DDF6F0] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#117C64]">Live Overview</span>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-[#1F2432]">Student Dashboard</h1>
          <p className="mt-1 text-base text-[#6F7689]">Academic Progress Tracker</p>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#D6DBE8] bg-white px-4 text-sm font-semibold text-[#4D5670]">
            <FileDown size={16} />
            Export Report
          </button>
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#6E56CF] px-4 text-sm font-semibold text-white">
            <UserPlus size={16} />
            Invite Student
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E7E2FF] bg-[#F7F4FF] p-4">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEE8FF] text-[#5A46BF]">
            <Bell size={18} />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A7FA0]">Needs Feedback</p>
          <p className="mt-2 text-4xl font-bold text-[#3E348D]">{dashboardStats.studentsWaitingForReview}</p>
          <p className="text-sm text-[#6F7689]">Students waiting for review</p>
        </div>

        <div className="rounded-2xl border border-[#F3E0E0] bg-[#FFF8F8] p-4">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFEAEA] text-[#BD3A3A]">
            <AlertTriangle size={18} />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A56767]">At Risk</p>
          <p className="mt-2 text-4xl font-bold text-[#B23232]">{dashboardStats.studentsAtRisk}</p>
          <p className="text-sm text-[#6F7689]">Inactive for &gt; 48 hours</p>
        </div>

        <div className="rounded-2xl border border-[#E6E9F2] bg-white p-4">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF8F4] text-[#127965]">
            <span className="text-base font-bold">%</span>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A8094]">Avg. Completion</p>
          <p className="mt-2 text-4xl font-bold text-[#1F2432]">{dashboardStats.averageRoadmapCompletion}%</p>
          <div className="mt-3 h-2 rounded-full bg-[#E8ECF5]">
<div
  className="h-2 rounded-full bg-gradient-to-r from-[#28A58A] to-[#6FCDBA]"
  style={{
    width: `${dashboardStats.averageRoadmapCompletion}%`,
  }}
/>          </div>
        </div>

        <div className="rounded-2xl border border-[#E6E9F2] bg-white p-4">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#F1F4FA] text-[#5E667D]">
            <Users size={18} />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A8094]">Active Students</p>
          <p className="mt-2 text-4xl font-bold text-[#1F2432]">{dashboardStats.activeStudents}</p>
          <p className="text-sm text-[#117C64]">+ 8% from last month</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E6E9F2] bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          <div className="relative w-full max-w-[260px]">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8891A7]" />
            <input
              className="h-10 w-full rounded-xl border border-[#E1E6F1] bg-[#FAFBFE] pl-9 pr-3 text-sm text-[#3B455B] outline-none"
              placeholder="Search students..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead>
              <tr className="border-b border-[#ECEFF6] text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A91A5]">
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Status / Module</th>
                <th className="px-3 py-3">Progress</th>
                <th className="px-3 py-3">Tasks</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mentorStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-sm font-medium text-[#7A8094]">
                    no student in this classroom yet
                  </td>
                </tr>
              ) : mentorStudents.map((student) => {
                const statusToneClasses =
                  student.statusTone === 'feedback'
                    ? 'bg-[#EFEAFF] text-[#5E49C3]'
                    : student.statusTone === 'idle'
                      ? 'bg-[#FFE9E9] text-[#B33A3A]'
                      : 'bg-[#DFF7F1] text-[#117C64]';

                return (
                  <tr key={student.id} className="border-b border-[#F1F3F8] last:border-b-0">
                    <td className="px-3 py-4">
                      <p className="font-semibold text-[#1F2432]">{student.name}</p>
                      <p className="text-xs text-[#8A91A5]">
  Last Activity:
  {` `}
  {student.email}
</p>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusToneClasses}`}>
                        {student.statusLabel}
                      </span>
                      <p className="mt-1 text-xs text-[#8A91A5]">{student.moduleLabel}</p>
                    </td>
                    <td className="px-3 py-4">
                      <p className="text-xs font-semibold text-[#505A73]">{student.progress}% Complete</p>
                      <div className="mt-2 h-2 w-36 rounded-full bg-[#E8ECF5]">
                        <div className="h-2 rounded-full bg-gradient-to-r from-[#6E56CF] to-[#33B5A2]" style={{ width: `${student.progress}%` }} />
                      </div>
                    </td>
                    <td className="px-3 py-4 font-semibold text-[#1F2432]">
                      {String(student.completedTasks).padStart(2, '0')} / {student.totalTasks}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        {student.statusTone === 'feedback' && (
                          <button type="button" onClick={() => onOpenMentorSubmissionsForStudent(student.id)} className="text-sm font-semibold text-[#5B45BE]">Review Task</button>
                        )}
                        <button
                          type="button"
                          disabled={
                            !isValidUserGuid(student.id) ||
                            messagingStudentId === student.id
                          }
                          onClick={() => onMessageStudent(student.id)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#D5CCFF] bg-white px-3 text-xs font-semibold text-[#503DB8] shadow-[0_1px_2px_rgba(91,69,190,0.12)] transition hover:bg-[#F7F4FF] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <MessageSquare size={14} strokeWidth={2.2} />
                          {messagingStudentId === student.id ? 'Opening...' : 'Message'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDeleteStudent(student)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#B33A3A] hover:bg-[#FFE9E9]"
                          aria-label={`Delete ${student.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#7A8094]">
          <p>Displaying {mentorStudents.length} records per page • {mentorStudents.length} total students</p>
          <div className="flex items-center gap-2">
            <button type="button" className="h-8 w-8 rounded-md border border-[#D9DEEA] text-[#7A8094]">&lt;</button>
            <button type="button" className="h-8 w-8 rounded-md bg-[#6E56CF] text-white">1</button>
            <button type="button" className="h-8 w-8 rounded-md border border-[#D9DEEA] text-[#7A8094]">2</button>
            <button type="button" className="h-8 w-8 rounded-md border border-[#D9DEEA] text-[#7A8094]">3</button>
            <button type="button" className="h-8 w-8 rounded-md border border-[#D9DEEA] text-[#7A8094]">&gt;</button>
          </div>
        </div>
      </div>
    </section>
  );
}