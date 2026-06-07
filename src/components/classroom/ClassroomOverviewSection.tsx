
import { Calendar } from 'lucide-react';
import Feed, { type FeedPostProps } from '../Feed';
import { ClassroomUserLink } from './common/ClassroomUserLink';

type ClassroomUpcomingSessionCard = {
  title: string;
  dateLabel: string;
  timeLabel: string;
  meetingLink?: string;
  isJoinable?: boolean;
};

type ClassroomOverviewSectionProps = {
  isMentor?: boolean;
  currentUserName?: string;
  currentUserAvatarUrl?: string;
  progressPercent?: number;
  upcomingSession?: ClassroomUpcomingSessionCard | null;
  activeMissionTitle?: string | null;
  onSubmitTask: () => void;
  onAddPost: () => void;
  onReviewNow?: () => void;
  pendingReviewCount?: number;
  feedPosts: FeedPostProps[];
  currentUserId?: string;
  onPostUpdate?: (postId: string, content: string) => void;
  /** Opens the same Add Post modal prefilled for editing */
  onRequestPostEdit?: (postId: string) => void;
  onPostDelete?: (postId: string) => void;
  onToggleLikePost?: (
    postId: string
  ) => void;

onOpenPostDetails?: (
  post: FeedPostProps
) => void;

};


const ClassroomOverviewSection = ({
  isMentor = false,
  currentUserName = 'Designer',
  currentUserAvatarUrl,
  progressPercent = 0,
  upcomingSession = null,
  activeMissionTitle = null,
  onSubmitTask,
  onAddPost,
  onReviewNow,
  pendingReviewCount = 0,
  feedPosts,
  currentUserId = 'current-user',
  onPostUpdate,
  onRequestPostEdit,
  onPostDelete,
  onToggleLikePost,
  onOpenPostDetails,
}: ClassroomOverviewSectionProps) => {
  const progressValue = Number.isFinite(progressPercent)
    ? Math.max(0, Math.min(100, Math.round(progressPercent)))
    : 0;

  const avatarUrl =
    currentUserAvatarUrl?.trim() ||
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUserName)}`;

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold leading-tight text-[#1E2330]">
          Welcome back,{' '}
          <ClassroomUserLink
            userId={currentUserId}
            name={currentUserName}
            className="text-3xl font-bold leading-tight text-[#1E2330]"
          />
        </h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#E6E9F2] bg-white px-4 py-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#2C3243]">My Progress</p>
            <span className="text-sm font-bold text-[#5A49C8]">{progressValue}%</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-[#DDE1EB]">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#6250CB] to-[#21C0BC]"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>

        <div className="flex min-h-[140px] items-center rounded-2xl border border-[#E6E9F2] bg-white px-4 py-5">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="grid h-10 w-10 min-h-10 min-w-10 shrink-0 place-items-center rounded-xl border border-[#E4DDFB] bg-[#F1EDFF]">
                <Calendar size={16} strokeWidth={2} className="text-[#5C4BC7]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A8092]">Upcoming Session</p>
                <p className="text-lg font-semibold leading-none text-[#242B3B]">
                  {upcomingSession ? `${upcomingSession.dateLabel}, ${upcomingSession.timeLabel}` : 'No upcoming session'}
                </p>
                <p className="mt-1 text-[13px] text-[#7A8092]">
                  {upcomingSession?.title || 'A new session will appear here once it is scheduled.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={!upcomingSession?.isJoinable || !upcomingSession?.meetingLink}
              onClick={() => {
                if (upcomingSession?.meetingLink) {
                  window.open(upcomingSession.meetingLink, '_blank', 'noopener,noreferrer');
                }
              }}
              className="h-10 whitespace-nowrap rounded-xl bg-[#5E4BC5] px-5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              Join Call
            </button>
          </div>
        </div>

        <div className="flex min-h-[140px] items-center rounded-2xl border border-[#E6E9F2] bg-white px-4 py-5">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="grid h-10 w-10 min-h-10 min-w-10 shrink-0 place-items-center rounded-xl border border-[#E4DDFB] bg-[#F1EDFF]">
                <Calendar size={16} strokeWidth={2} className="text-[#5C4BC7]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A8092]">
                  {isMentor ? 'Pending Review' : 'Active Mission'}
                </p>
                <p className="text-lg font-semibold leading-none text-[#242B3B]">
                  {isMentor ? `${pendingReviewCount} submissions` : activeMissionTitle || 'No tasks for now'}
                </p>
              </div>
            </div>
            {isMentor ? (
              <button
                type="button"
                onClick={onReviewNow}
                className="h-10 whitespace-nowrap rounded-xl bg-[#5E4BC5] px-5 text-sm font-semibold text-white shadow-sm"
              >
                Review Now
              </button>
            ) : (
              <button
                type="button"
                disabled={!activeMissionTitle}
                onClick={onSubmitTask}
                className="h-10 whitespace-nowrap rounded-xl bg-[#5E4BC5] px-5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                Submit Task
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold leading-none text-[#1F2432]">Program Feed</p>
        </div>

        <div className="rounded-2xl border border-[#E6E9F2] bg-white px-6 pt-8 pb-6">
          <button
            type="button"
            onClick={onAddPost}
            className="flex w-full items-center gap-4 rounded-2xl bg-[#EFF1F5] px-4 py-3 text-left transition hover:bg-[#E9ECF2]"
          >
            <img
              src={avatarUrl}
              alt={`${currentUserName} avatar`}
              className="h-10 w-10 rounded-full"
            />
            <span className="text-sm text-[#9AA1B1]">Share a thought or ask the atelier...</span>
          </button>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onAddPost}
              className="h-10 rounded-xl bg-[#5E4BC5] px-5 text-sm font-semibold text-white"
            >
              Add Post
            </button>
          </div>
        </div>

      </div>

      <div className="space-y-4">
        {feedPosts.map((post) => (
          <Feed
            key={post.id}
            {...post}
            currentUserId={currentUserId}
            onPostUpdate={onPostUpdate}
            onRequestPostEdit={onRequestPostEdit}
            onPostDelete={onPostDelete}
onLike={() =>
  onToggleLikePost?.(
    post.id
  )
}            
onComment={() =>
  onOpenPostDetails?.(post)
}

            onReply={(commentId) => console.log('reply to comment:', commentId)}
onViewAllComments={() =>
  onOpenPostDetails?.(post)
}          />
        ))}
      </div>
    </section>
  );
};

export default ClassroomOverviewSection;
