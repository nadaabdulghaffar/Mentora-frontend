import {
  Users,
  Calendar,
  Clock,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
} from "lucide-react";

import Layout from "../shared/components/Layout";

const ApplicationDetailsPage = () => {
  return (
    <Layout>
      <div className="bg-[#F6F7FB] min-h-screen pt-6 pb-10">

        {/* CONTENT (ALIGNED WITH SIDEBAR) */}
        <div
  className="
  flex flex-col lg:flex-row gap-10
  pl-4 sm:pl-6 lg:pl-6
  pr-4 sm:pr-6 lg:pr-12
"
>

          {/* LEFT */}
          <div className="flex-1 space-y-8">

            {/* TOP CARD */}
            <div className="bg-white border border-[#E6E9F0] rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col sm:flex-row gap-6">

              <img
                src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39"
                className="w-24 h-24 rounded-2xl object-cover"
              />

              <div className="flex-1">

                <h2 className="text-[24px] sm:text-[28px] lg:text-[30px] font-semibold text-[#1F2432] leading-snug">
                  Advanced Frontend Mentorship:
                  <br />
                  Mastering React & TypeScript
                </h2>

                <p className="mt-2 text-[15px] text-[#6B7280]">
                  by{" "}
                  <span className="text-[#6D5DD3] font-medium cursor-pointer">
                    Alex Rivera
                  </span>
                </p>

                {/* TAGS */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 text-sm rounded-full bg-[#EEF2FF] text-[#6D5DD3] font-medium">
                    FRONTEND DEVELOPMENT
                  </span>
                  <span className="px-3 py-1 text-sm rounded-full bg-[#F1F5F9] text-[#64748B] font-medium">
                    ENGINEERING
                  </span>
                  <span className="px-3 py-1 text-sm rounded-full bg-[#FEF3C7] text-[#B45309] font-medium">
                    ADVANCED
                  </span>
                </div>

                {/* META */}
                <div className="flex flex-wrap gap-6 mt-6 text-[15px] text-[#64748B]">

                  <div className="flex items-center gap-2">
                    <Users size={20} />
                    <span>12 Mentees</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={20} />
                    <span>6 Months</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={20} />
                    <span>Deadline: 11 Dec 2025</span>
                  </div>

                </div>

                {/* DIVIDER */}
                <div className="h-[1px] bg-[#EEF1F6] my-6" />

                {/* ACTIONS */}
                <div className="flex flex-wrap items-center gap-8 text-[15px] text-[#64748B]">

                  <div className="flex items-center gap-2 cursor-pointer hover:text-red-500">
                    <Heart size={20} />
                    42
                  </div>

                  <div className="flex items-center gap-2 cursor-pointer hover:text-[#6D5DD3]">
                    <MessageSquare size={20} />
                    18
                  </div>

                  <div className="flex items-center gap-2 cursor-pointer hover:text-[#6D5DD3]">
                    <Bookmark size={20} />
                    Save
                  </div>

                  <div className="flex items-center gap-2 cursor-pointer hover:text-[#6D5DD3]">
                    <Share2 size={20} />
                    Share
                  </div>

                </div>
              </div>

              {/* BUTTON */}
              <button className="bg-[#6D5DD3] text-white px-8 py-3 rounded-2xl font-medium text-[15px] h-fit self-start sm:self-center hover:opacity-90">
                Apply to Program
              </button>
            </div>

            {/* ABOUT */}
            <div className="bg-white border border-[#E6E9F0] rounded-3xl p-8 sm:p-10 shadow-sm">
              <h3 className="text-xl font-semibold text-[#1F2432] mb-4">
                About This Mentorship
              </h3>

              <p className="text-[15px] text-[#64748B] leading-7">
                This program is designed for mid-level designers looking to
                transition into leadership roles. We focus on strategic thinking,
                cross-functional collaboration, and building high-performing
                design teams. You'll gain practical experience in stakeholder
                management and design systems at scale.
              </p>
            </div>

            {/* ROADMAP */}
            <div className="bg-white border border-[#E6E9F0] rounded-3xl p-8 sm:p-10 shadow-sm">

              <div className="flex justify-between mb-6">
                <h3 className="text-xl font-semibold text-[#1F2432]">
                  Program Roadmap
                </h3>

                <span className="text-[15px] text-[#6D5DD3] cursor-pointer">
                  View Full Roadmap →
                </span>
              </div>

              <div className="space-y-6">
                {[
                  {
                    title: "Week 1: Foundations of Leadership",
                    desc: "Understanding the shift from individual contributor to design manager.",
                  },
                  {
                    title: "Week 2: Strategic Product Design",
                    desc: "Mastering business objectives and aligning design vision with KPIs.",
                  },
                  {
                    title: "Week 3: Team Dynamics & Culture",
                    desc: "Creating a culture of feedback and psychological safety.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">

                    <div className="w-9 h-9 rounded-full bg-[#EEF2FF] text-[#6D5DD3] text-sm flex items-center justify-center font-semibold">
                      {i + 1}
                    </div>

                    <div>
                      <p className="text-[15px] font-medium text-[#1F2432]">
                        {item.title}
                      </p>
                      <p className="text-sm text-[#64748B]">
                        {item.desc}
                      </p>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="w-full lg:w-[400px] xl:w-[420px] space-y-6 lg:sticky lg:top-6 h-fit">

            {/* MENTOR */}
            <div className="bg-white border border-[#E6E9F0] rounded-3xl p-6 shadow-sm">
              <h4 className="font-semibold text-[#1F2432] mb-4">
                Meet the Mentor
              </h4>

              <div className="flex gap-4 items-center">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  className="w-14 h-14 rounded-full"
                />

                <div>
                  <p className="font-semibold text-[#1F2432]">
                    Alex Rivera
                  </p>
                  <p className="text-sm text-[#64748B]">
                    Senior Engineer at Vercel
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#64748B] mt-4 leading-6">
                Helping developers master modern web architecture since 2015.
              </p>

              <p className="text-sm text-[#6D5DD3] mt-4 cursor-pointer">
                View Profile →
              </p>
            </div>

            {/* COMMENTS */}
            <div className="bg-white border border-[#E6E9F0] rounded-3xl p-5 shadow-sm">

              <div className="flex justify-between mb-4">
                <h4 className="font-semibold">Comments</h4>
                <span className="text-xs bg-gray-100 px-2 rounded-full">
                  12
                </span>
              </div>

              <div className="space-y-4">

                <div>
                  <p className="text-sm font-medium">Sarah Jenkins</p>
                  <p className="text-sm text-[#64748B]">
                    Is this program suitable for someone moving from Vue to React?
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Markus T.</p>
                  <p className="text-sm text-[#64748B]">
                    Highly recommended!
                  </p>
                </div>

              </div>

              <input
                placeholder="Write a comment..."
                className="mt-4 w-full border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5DD3]/20"
              />
            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
};

export default ApplicationDetailsPage;