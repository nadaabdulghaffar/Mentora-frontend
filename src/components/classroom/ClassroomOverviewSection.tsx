import { Image, Paperclip, Smile, Calendar } from 'lucide-react';
import Feed, { type FeedPostProps } from '../Feed';

type ClassroomOverviewSectionProps = {
  isMentor?: boolean;
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
};

const ClassroomOverviewSection = ({
  isMentor = false,
  onSubmitTask,
  onAddPost,
  onReviewNow,
  pendingReviewCount = 0,
  feedPosts,
  currentUserId = 'current-user',
  onPostUpdate,
  onRequestPostEdit,
  onPostDelete,
}: ClassroomOverviewSectionProps) => {
  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold leading-tight text-[#1E2330]">Welcome back, Designer</h1>
        <p className="text-base text-[#555D71]">Continue your mastery journey in User Experience.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#E6E9F2] bg-white px-4 py-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#2C3243]">My Progress</p>
            <span className="text-sm font-bold text-[#5A49C8]">85%</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-[#DDE1EB]">
            <div className="h-2 w-[85%] rounded-full bg-gradient-to-r from-[#6250CB] to-[#21C0BC]" />
          </div>
          <p className="mt-5 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6A7286]">Remaining Tasks</p>
          <p className="text-xl font-semibold leading-none text-[#1E2330]">2 Left</p>
        </div>

        <div className="flex min-h-[140px] items-center rounded-2xl border border-[#E6E9F2] bg-white px-4 py-5">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="grid h-10 w-10 min-h-10 min-w-10 shrink-0 place-items-center rounded-xl border border-[#E4DDFB] bg-[#F1EDFF]">
                <Calendar size={16} strokeWidth={2} className="text-[#5C4BC7]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A8092]">Upcoming Session</p>
                <p className="text-lg font-semibold leading-none text-[#242B3B]">Tomorrow, 4:00 PM</p>
                <p className="mt-1 text-[13px] text-[#7A8092]">Mentorship Circle</p>
              </div>
            </div>
            <button type="button" className="h-10 whitespace-nowrap rounded-xl bg-[#5E4BC5] px-5 text-sm font-semibold text-white shadow-sm">
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
                  {isMentor ? `${pendingReviewCount} submissions` : 'Module 4: User Journey Mapping'}
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
                onClick={onSubmitTask}
                className="h-10 whitespace-nowrap rounded-xl bg-[#5E4BC5] px-5 text-sm font-semibold text-white shadow-sm"
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
          <div className="flex items-center gap-5 text-base">
            <button type="button" className="border-b-2 border-[#5E4BC5] pb-1 font-semibold text-[#5E4BC5]">Latest</button>
            <button type="button" className="pb-1 text-[#4A546A]">Announcement</button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E6E9F2] bg-white px-6 pt-8 pb-6">
          <div className="flex items-center gap-4">
            <img
              src="https://api.dicebear.com/7.x/adventurer/svg?seed=Designer"
              alt="Designer avatar"
              className="h-10 w-10 rounded-full"
            />
            <input
              type="text"
              placeholder="Share a thought or ask the atelier..."
              className="h-12 w-full rounded-xl bg-[#EFF1F5] px-4 text-sm text-[#4F5668] outline-none placeholder:text-[#9AA1B1]"
            />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[#5B647A]">
              <button type="button" className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-[#F2F4F8]">
                <Image size={17} />
              </button>
              <button type="button" className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-[#F2F4F8]">
                <Paperclip size={17} />
              </button>
              <button type="button" className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-[#F2F4F8]">
                <Smile size={17} />
              </button>
            </div>
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
            onLike={() => console.log('like post:', post.id)}
            onComment={() => console.log('comment post:', post.id)}
            onReply={(commentId) => console.log('reply to comment:', commentId)}
            onViewAllComments={() => console.log('view comments for:', post.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default ClassroomOverviewSection;
