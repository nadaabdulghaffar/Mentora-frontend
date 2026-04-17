import { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Circle, FileText, Search, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Feed, { type FeedPostProps } from '../components/Feed';
import authAPI from '../services/authService';
import Layout from '../shared/components/Layout';

type ClassroomTab = 'classroom' | 'schedule' | 'roadmap' | 'tasks' | 'students';

type TaskStatus = 'todo' | 'submitted' | 'reviewed';

type ClassroomTask = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: TaskStatus;
  badge: string;
  badgeTone: 'danger' | 'success' | 'neutral';
};

type SessionItem = {
  id: string;
  title: string;
  dateLabel: string;
  duration: string;
  live: boolean;
};

type RoadmapTask = {
  id: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'pending' | 'overdue';
};

type RoadmapModule = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  progressLabel?: string;
  tasks?: RoadmapTask[];
  expanded?: boolean;
};

const classroomFeedPosts: FeedPostProps[] = [
  {
    id: 'feed-1',
    authorId: 'mentor-1',
    authorName: 'Julian Voss',
    authorAvatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    content:
      "I just shared a new resource on the 'Cognitive Load' thread. Understanding how much information a user can process at once is crucial for the Module 4 task.",
    timestamp: '2 hours ago',
    attachments: [
      {
        id: 'feed-1-image',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1400&q=80',
      },
    ],
    likes: 24,
    comments: [
      {
        id: 'feed-1-comment-1',
        authorId: 'mentee-7',
        authorName: 'Sarah Chen',
        authorAvatar: 'https://randomuser.me/api/portraits/women/65.jpg',
        content: 'Great share, this really explains why my previous layout felt overwhelming.',
        timestamp: '58 min ago',
        likes: 8,
      },
    ],
    variant: 'classroom',
  },
  {
    id: 'feed-2',
    authorId: 'mentee-4',
    authorName: 'Sarah Chen',
    authorAvatar: 'https://randomuser.me/api/portraits/women/54.jpg',
    content:
      "Has anyone found a good case study on the 'Zeigarnik Effect' applied to ed-tech dashboards? I want references for this week's mission.",
    timestamp: '5 hours ago',
    likes: 12,
    comments: [
      {
        id: 'feed-2-comment-1',
        authorId: 'mentee-8',
        authorName: 'Marcelo Thome',
        authorAvatar: 'https://randomuser.me/api/portraits/men/48.jpg',
        content: 'Check the Duolingo teardown on growth design. It covers incomplete cycles really well.',
        timestamp: '2 hours ago',
        likes: 3,
      },
    ],
    variant: 'classroom',
  },
];

const sessions: SessionItem[] = [
  {
    id: 'session-1',
    title: 'Advanced Typography & Layout Systems',
    dateLabel: 'TODAY • 10:30 AM',
    duration: '60 mins',
    live: true,
  },
  {
    id: 'session-2',
    title: 'Color Theory in Digital Ecosystems',
    dateLabel: 'OCT 14 • 02:00 PM',
    duration: '1 hour',
    live: false,
  },
  {
    id: 'session-3',
    title: 'Brand Identity Construction',
    dateLabel: 'OCT 16 • 09:00 AM',
    duration: '1 hour',
    live: false,
  },
];

const tasks: ClassroomTask[] = [
  {
    id: 'task-1',
    title: 'User Journey Mapping',
    category: 'UX RESEARCH',
    description: 'Synthesize interview data into a comprehensive journey map.',
    status: 'todo',
    badge: '1 Overdue',
    badgeTone: 'danger',
  },
  {
    id: 'task-2',
    title: 'Typography Systems',
    category: 'VISUAL DESIGN',
    description: 'Define the dual-type scale system for the Atelier brand identity.',
    status: 'todo',
    badge: 'Due in 2 days',
    badgeTone: 'neutral',
  },
  {
    id: 'task-3',
    title: 'Sitemap & Information Architecture',
    category: 'ARCHITECTURE',
    description: 'Create structural map for the knowledge base resources.',
    status: 'submitted',
    badge: 'Under Review',
    badgeTone: 'success',
  },
  {
    id: 'task-4',
    title: 'The Digital Atelier Persona',
    category: 'BRANDING',
    description: 'Create persona narratives and behavior assumptions.',
    status: 'reviewed',
    badge: 'Completed',
    badgeTone: 'success',
  },
];

const roadmapModules: RoadmapModule[] = [
  {
    id: 'module-1',
    order: 1,
    title: 'Visual Foundations',
    subtitle: 'Current journey',
    progressLabel: '4 / 6 Tasks Completed',
    expanded: true,
    tasks: [
      {
        id: 'rm-1',
        title: 'Typography Scales & Vertical Rhythm',
        subtitle: 'Mastering the editorial layout system.',
        status: 'completed',
      },
      {
        id: 'rm-2',
        title: 'Color Theory in Interface Design',
        subtitle: 'Harmonizing teal and purple palettes.',
        status: 'completed',
      },
      {
        id: 'rm-3',
        title: 'Advanced Layout Logic',
        subtitle: 'The bento-box structural approach.',
        status: 'pending',
      },
      {
        id: 'rm-4',
        title: 'Component Atomic Structure',
        subtitle: 'Refining reusable UI anchors.',
        status: 'overdue',
      },
    ],
  },
  {
    id: 'module-2',
    order: 2,
    title: 'Systemic Design & Documentation',
    subtitle: 'Defining the rules of the Digital Atelier.',
    progressLabel: '8 Tasks Total',
  },
  {
    id: 'module-3',
    order: 3,
    title: 'Prototyping Motion & Emotion',
    subtitle: 'Interactive patterns for high-end SaaS.',
    progressLabel: '12 Tasks Total',
  },
];

const badgeToneClasses = {
  danger: 'bg-[#FFE7E7] text-[#B02D2D]',
  success: 'bg-[#D9F6EE] text-[#0E7A5F]',
  neutral: 'bg-[#EEE8FF] text-[#5E48C3]',
};

const TaskBadge = ({ label, tone }: { label: string; tone: 'danger' | 'success' | 'neutral' }) => (
  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeToneClasses[tone]}`}>{label}</span>
);

const ClassroomPage = () => {
  const location = useLocation();
  const user = authAPI.getCurrentUser();
  const role = user?.role?.toLowerCase();
  const isMentor = role === 'mentor';
  const programId = (location.state as { programId?: string } | null)?.programId;

  const [activeTab, setActiveTab] = useState<ClassroomTab>('classroom');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const tabs = useMemo(
    () =>
      isMentor
        ? [
            { id: 'classroom' as const, label: 'Classroom' },
            { id: 'schedule' as const, label: 'Schedule' },
            { id: 'roadmap' as const, label: 'Roadmap' },
            { id: 'tasks' as const, label: 'Tasks' },
            { id: 'students' as const, label: 'Students' },
          ]
        : [
            { id: 'classroom' as const, label: 'Classroom' },
            { id: 'schedule' as const, label: 'Schedule' },
            { id: 'roadmap' as const, label: 'Roadmap' },
            { id: 'tasks' as const, label: 'Tasks' },
          ],
    [isMentor]
  );

  const todoTasks = tasks.filter((task) => task.status === 'todo');
  const submittedTasks = tasks.filter((task) => task.status === 'submitted');
  const reviewedTasks = tasks.filter((task) => task.status === 'reviewed');

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6 pb-10">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[28px] font-bold leading-tight text-[#1F2432]">The Digital Atelier</p>
            </div>
            <div className="flex h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-[#E3E6EF] bg-white px-3">
              <Search size={16} className="text-[#8A91A3]" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#A0A7B8]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-5 border-b border-[#E6E9F2] pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-1 text-[15px] font-medium transition ${
                  activeTab === tab.id ? 'border-b-2 border-[#6E56CF] text-[#2A3142]' : 'text-[#7D8498] hover:text-[#2A3142]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {activeTab === 'classroom' && (
          <section className="space-y-5">
            <div>
              <h1 className="text-[34px] font-bold leading-tight text-[#1E2330]">Welcome back, Designer</h1>
              {programId && (
                <p className="mt-1 text-sm text-[#6F7688]">Program ID: {programId}</p>
              )}
              <p className="text-base text-[#6F7688]">Continue your mastery journey in User Experience.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#E6E9F2] bg-white p-4">
                <p className="text-xs font-semibold uppercase text-[#7A8194]">My Progress</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-[#586077]">85%</span>
                  <span className="text-sm font-semibold text-[#262D3D]">2 Tasks Left</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#ECEFF6]">
                  <div className="h-2 w-[85%] rounded-full bg-[#33B6B0]" />
                </div>
              </div>

              <div className="rounded-2xl border border-[#E6E9F2] bg-white p-4">
                <p className="text-xs font-semibold uppercase text-[#7A8194]">Upcoming Session</p>
                <p className="mt-2 text-sm font-semibold text-[#242B3B]">Tomorrow, 4:00 PM</p>
                <button type="button" className="mt-3 h-10 rounded-xl bg-[#6E56CF] px-4 text-sm font-semibold text-white">
                  Join Call
                </button>
              </div>

              <div className="rounded-2xl border border-[#E6E9F2] bg-white p-4">
                <p className="text-xs font-semibold uppercase text-[#7A8194]">Active Mission</p>
                <p className="mt-2 text-sm font-semibold text-[#242B3B]">Module 4: User Persona task</p>
                <button type="button" className="mt-3 h-10 rounded-xl bg-[#6E56CF] px-4 text-sm font-semibold text-white">
                  Submit Task
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E6E9F2] bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xl font-bold text-[#1F2432]">Program Feed</p>
                <div className="flex gap-4 text-sm">
                  <button type="button" className="font-semibold text-[#2A3042]">Latest</button>
                  <button type="button" className="text-[#7A8194]">Announcement</button>
                </div>
              </div>
              <div className="rounded-xl bg-[#F6F7FB] p-3">
                <input
                  type="text"
                  placeholder="Share a thought or ask the atelier..."
                  className="h-11 w-full rounded-xl border border-[#E3E6EF] bg-white px-3 text-sm outline-none"
                />
                <div className="mt-3 flex justify-end">
                  <button type="button" className="h-10 rounded-xl bg-[#6E56CF] px-5 text-sm font-semibold text-white">
                    Post Discussion
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {classroomFeedPosts.map((post) => (
                <Feed
                  key={post.id}
                  {...post}
                  onLike={() => console.log('like post:', post.id)}
                  onComment={() => console.log('comment post:', post.id)}
                  onReply={(commentId) => console.log('reply to comment:', commentId)}
                  onViewAllComments={() => console.log('view comments for:', post.id)}
                />
              ))}
            </div>
          </section>
        )}

        {activeTab === 'schedule' && (
          <section className="space-y-5">
            <div>
              <h1 className="text-[42px] font-bold leading-tight text-[#1F2432]">My Upcoming Sessions</h1>
              <p className="mt-1 text-lg text-[#5E48C3]">Active Phase: <span className="text-[#495164]">Editorial Design Mastery</span></p>
            </div>
            <div className="space-y-4 rounded-2xl border border-[#E6E9F2] bg-white p-5">
              {sessions.map((session) => (
                <div key={session.id} className="relative flex items-center justify-between rounded-2xl border border-[#E9ECF4] bg-[#FCFCFE] p-4 pl-8">
                  <span className={`absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ${session.live ? 'bg-[#6E56CF]' : 'bg-[#D5DAE8]'}`} />
                  <div className="flex items-center gap-3">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl ${session.live ? 'bg-[#E7F8F5]' : 'bg-[#F2F3F8]'}`}>
                      <Calendar size={16} className={session.live ? 'text-[#0E8B6F]' : 'text-[#8B91A4]'} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6E758A]">{session.dateLabel}</p>
                      <p className="text-[34px] font-semibold leading-tight text-[#202737]">{session.title}</p>
                      <p className="text-sm text-[#7D8497]">{session.duration}</p>
                    </div>
                  </div>
                  {session.live ? (
                    <button type="button" className="h-11 rounded-xl bg-[#6E56CF] px-6 text-sm font-semibold text-white">Join</button>
                  ) : (
                    <button type="button" className="h-11 rounded-xl border border-[#D4D9E5] bg-white px-6 text-sm font-semibold text-[#4D5670]">View Details</button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'tasks' && (
          <section className="space-y-5">
            <div>
              <h1 className="text-[42px] font-bold leading-tight text-[#1F2432]">Your Tasks</h1>
              <p className="text-lg text-[#697188]">Hone your skills with guided challenges and expert insights.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E6E9F2] bg-white p-2">
              <button type="button" className="rounded-xl border border-[#DFE3EE] bg-[#F8F9FD] px-4 py-2 text-sm font-semibold text-[#4A5470]">
                Module 1: Foundations
              </button>
              <button type="button" className="px-3 py-2 text-sm text-[#7D8498]">Module 2: Advanced UX</button>
              <button type="button" className="px-3 py-2 text-sm text-[#7D8498]">Module 3: Visual Identity</button>
              <button type="button" className="px-3 py-2 text-sm text-[#7D8498]">Module 4: Professional Kit</button>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-3 rounded-2xl border border-[#E6E9F2] bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-[#2A3142]">To Do <span className="ml-1 rounded-full bg-[#EEE8FF] px-2 py-0.5 text-xs text-[#5B45BE]">{todoTasks.length}</span></p>
                  <button type="button" className="text-[#8B92A5]">...</button>
                </div>
                {todoTasks.map((task) => (
                  <div key={task.id} className="rounded-xl border border-[#EAEDF5] bg-[#FCFCFE] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-full bg-[#F2F0FF] px-2 py-1 text-[10px] font-semibold text-[#6C5CCB]">{task.category}</span>
                      <TaskBadge label={task.badge} tone={task.badgeTone} />
                    </div>
                    <p className="text-3xl font-semibold leading-tight text-[#1F2433]">{task.title}</p>
                    <p className="mt-1 text-sm text-[#6E7589]">{task.description}</p>
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(true)}
                      className="mt-3 h-10 w-full rounded-xl bg-[#6E56CF] px-4 text-sm font-semibold text-white"
                    >
                      Submit Task
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-2xl border border-[#E6E9F2] bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-[#2A3142]">Submitted <span className="ml-1 rounded-full bg-[#DDF6F0] px-2 py-0.5 text-xs text-[#0F7E62]">{submittedTasks.length}</span></p>
                  <button type="button" className="text-[#8B92A5]">...</button>
                </div>
                {submittedTasks.map((task) => (
                  <div key={task.id} className="rounded-xl border border-[#EAEDF5] bg-[#FCFCFE] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-full bg-[#F4F5F9] px-2 py-1 text-[10px] font-semibold text-[#65708C]">{task.category}</span>
                      <TaskBadge label={task.badge} tone={task.badgeTone} />
                    </div>
                    <p className="text-3xl font-semibold leading-tight text-[#1F2433]">{task.title}</p>
                    <p className="mt-1 text-sm text-[#6E7589]">{task.description}</p>
                    <button
                      type="button"
                      onClick={() => setShowSubmissionModal(true)}
                      className="mt-3 text-sm font-semibold text-[#17856C]"
                    >
                      View Submission
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-2xl border border-[#E6E9F2] bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-[#2A3142]">Reviewed <span className="ml-1 rounded-full bg-[#EEF0F5] px-2 py-0.5 text-xs text-[#5A6276]">{reviewedTasks.length}</span></p>
                  <button type="button" className="text-[#8B92A5]">...</button>
                </div>
                {reviewedTasks.map((task) => (
                  <div key={task.id} className="rounded-xl border border-[#EAEDF5] bg-[#FCFCFE] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-full bg-[#E8FAF4] px-2 py-1 text-[10px] font-semibold text-[#0F876B]">{task.category}</span>
                      <TaskBadge label={task.badge} tone={task.badgeTone} />
                    </div>
                    <p className="text-3xl font-semibold leading-tight text-[#1F2433]">{task.title}</p>
                    <p className="mt-1 text-sm text-[#6E7589]">{task.description}</p>
                    <button
                      type="button"
                      onClick={() => setShowFeedbackModal(true)}
                      className="mt-3 h-10 w-full rounded-xl bg-[#6E56CF] px-4 text-sm font-semibold text-white"
                    >
                      View Feedback
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'roadmap' && (
          <section className="space-y-5">
            <div>
              <h1 className="text-[42px] font-bold leading-tight text-[#1F2432]">Your Roadmap</h1>
              <p className="text-lg text-[#697188]">Sharpen your skills through step-by-step challenges and expert tips.</p>
            </div>

            <div className="space-y-4">
              {roadmapModules.map((module) => (
                <div key={module.id} className="rounded-2xl border border-[#E6E9F2] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F2F4F9] text-sm font-bold text-[#59627B]">
                        {String(module.order).padStart(2, '0')}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7360C9]">Module {module.order}</p>
                        <p className="text-[44px] font-semibold leading-tight text-[#1F2432]">{module.title}</p>
                        <p className="text-sm text-[#6F7689]">{module.subtitle}</p>
                      </div>
                    </div>
                    {module.progressLabel && <p className="text-sm font-semibold text-[#626B81]">{module.progressLabel}</p>}
                  </div>

                  {module.expanded && module.tasks && (
                    <div className="mt-4 space-y-2">
                      {module.tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between rounded-xl bg-[#F7F8FC] p-3">
                          <div className="flex items-center gap-3">
                            {task.status === 'completed' ? (
                              <CheckCircle2 size={18} className="text-[#0B8A6D]" />
                            ) : task.status === 'pending' ? (
                              <Circle size={18} className="text-[#6E56CF]" />
                            ) : (
                              <Circle size={18} className="text-[#C03434]" />
                            )}
                            <div>
                              <p className="font-semibold text-[#202738]">{task.title}</p>
                              <p className="text-sm text-[#6E7589]">{task.subtitle}</p>
                            </div>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              task.status === 'completed'
                                ? 'bg-[#DDF6F0] text-[#0F7E62]'
                                : task.status === 'pending'
                                ? 'bg-[#EEE8FF] text-[#634CC5]'
                                : 'bg-[#FFE7E7] text-[#B02D2D]'
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'students' && isMentor && (
          <section className="rounded-2xl border border-[#E6E9F2] bg-white p-6">
            <h1 className="text-[42px] font-bold text-[#1F2432]">Students</h1>
            <p className="mt-2 text-[#6F7689]">Track classroom students, submissions, and progress from one place.</p>
          </section>
        )}
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[42px] font-bold leading-tight text-[#1F2432]">Submit Your Assignment</h2>
              <button type="button" onClick={() => setShowSubmitModal(false)}>
                <X size={18} className="text-[#6F7689]" />
              </button>
            </div>
            <div className="space-y-3">
              <input className="h-11 w-full rounded-xl border border-[#E1E4ED] px-3 text-sm" placeholder="Title" />
              <input className="h-11 w-full rounded-xl border border-[#E1E4ED] px-3 text-sm" placeholder="Project link" />
              <textarea className="min-h-24 w-full rounded-xl border border-[#E1E4ED] p-3 text-sm" placeholder="Notes for your mentor" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowSubmitModal(false)} className="h-10 rounded-xl border border-[#CBD1DE] px-4 text-sm font-semibold text-[#4F5872]">
                Cancel
              </button>
              <button type="button" className="h-10 rounded-xl bg-[#6E56CF] px-4 text-sm font-semibold text-white">
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-[#EEE8FF] px-3 py-1 text-xs font-semibold text-[#5D48BF]">Under Review</span>
              <button type="button" onClick={() => setShowSubmissionModal(false)}>
                <X size={18} className="text-[#6F7689]" />
              </button>
            </div>
            <h2 className="text-[42px] font-bold leading-tight text-[#1F2432]">Sitemap & Information Architecture</h2>
            <div className="mt-4 rounded-xl bg-[#F6F7FB] p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8EAFE]">
                  <FileText size={18} className="text-[#5B62CB]" />
                </div>
                <div>
                  <p className="font-semibold text-[#252C3B]">IA_Final_Sitemap_v2.pdf</p>
                  <p className="text-sm text-[#6E7589]">4.2 MB - PDF document</p>
                </div>
              </div>
              <div className="mt-3 flex justify-between text-sm text-[#5F6880]">
                <span>Submitted on</span>
                <span>Oct 24, 2023 • 2:14 PM</span>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-[#EEE8FF] p-3 text-sm text-[#4D4A6E]">
              Your mentor has been notified. You will receive an email once the feedback and grading are completed.
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" className="h-10 rounded-xl border border-[#CBD1DE] px-4 text-sm font-semibold text-[#4F5872]">
                Update Submissions
              </button>
            </div>
          </div>
        </div>
      )}

      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[42px] font-bold leading-tight text-[#1F2432]">Typography Systems</h2>
              <button type="button" onClick={() => setShowFeedbackModal(false)}>
                <X size={18} className="text-[#6F7689]" />
              </button>
            </div>
            <p className="text-sm text-[#697188]">Submitted 3 Oct, 2023</p>
            <div className="mt-5 grid place-items-center">
              <div className="grid h-32 w-32 place-items-center rounded-full border-4 border-[#D7CBFF] text-5xl font-bold text-[#624BC5]">70</div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#6E7589]">Final Grade</p>
            </div>
            <div className="mt-4 rounded-xl bg-[#F6F7FB] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6A63A4]">Mentor Feedback</p>
              <p className="mt-2 text-sm leading-6 text-[#495164]">
                Your exploration of vertical rhythm and scale contrast shows strong understanding of hierarchy. Next iteration:
                tighten heading tracking for larger titles to improve visual impact.
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setShowFeedbackModal(false)} className="h-10 rounded-xl border border-[#CBD1DE] px-4 text-sm font-semibold text-[#4F5872]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ClassroomPage;
