import Layout from "../shared/components/Layout";
import ProgramCard from "../components/ProgramCard";

interface RecommendedMentor {
  id: string;
  title: string;
  description: string;
  image?: string;
  tag?: string;
  phases?: string;
  author?: {
    avatar: string;
    name: string;
  };
}

const recommendedMentors: RecommendedMentor[] = [
  {
    id: "mentor-1",
    title: "Elena Rodriguez",
    description: "Senior Product Designer at Meta focused on UX research and systems thinking.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
    tag: "UX RESEARCH",
    phases: "128 REVIEWS",
    author: {
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Elena",
      name: "Senior Product Designer",
    },
  },
  {
    id: "mentor-2",
    title: "Amelia Shepherd",
    description: "Lead Designer at Klaviyo helping creators turn ideas into clear product journeys.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80",
    tag: "ACCESSIBILITY",
    phases: "314 RATINGS",
    author: {
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Amelia",
      name: "Lead Designer",
    },
  },
  {
    id: "mentor-3",
    title: "Marcus Thompson",
    description: "Full-Stack Engineer at Google with 10+ years building scalable systems.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
    tag: "BACKEND DEVELOPMENT",
    phases: "95 REVIEWS",
    author: {
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Marcus",
      name: "Senior Engineer",
    },
  },
  {
    id: "mentor-4",
    title: "Priya Sharma",
    description: "Data Science Lead at LinkedIn helping companies extract insights from data.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    tag: "DATA SCIENCE",
    phases: "203 RATINGS",
    author: {
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Priya",
      name: "Data Science Lead",
    },
  },
];

const RecommendedMentorsPage = () => {
  return (
    <Layout>
      <section className="w-full pb-8 pt-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#191D2B] md:text-5xl">
            Recommended Mentors for You
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#6D7386] md:text-base">
            Connect with expert mentors who can guide your journey and help you reach your goals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recommendedMentors.map((mentor) => (
            <ProgramCard
              key={mentor.id}
              variant="dual-buttons"
              image={mentor.image}
              tag={mentor.tag}
              phases={mentor.phases}
              title={mentor.title}
              description={mentor.description}
              author={mentor.author}
              primaryButtonText="See Full Profile"
              secondaryButtonText="Message"
              className="h-full"
            />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default RecommendedMentorsPage;
