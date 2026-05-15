import Layout from "../shared/components/Layout";
import ProgramCard from "../components/ProgramCard";

interface SuggestedProgram {
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

const suggestedPrograms: SuggestedProgram[] = [
  {
    id: "program-1",
    title: "UX Research Fundamentals",
    description: "Master the art of user research with industry experts from top tech companies.",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80",
    tag: "DESIGN",
    phases: "8 PHASES",
    author: {
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Moraa",
      name: "Moraa Zaki",
    },
  },
  {
    id: "program-2",
    title: "Frontend Accelerator",
    description: "A practical mentorship track for React, TypeScript, and production UI delivery.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    tag: "DEVELOPMENT",
    phases: "6 PHASES",
    author: {
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Omar",
      name: "Omar Adel",
    },
  },
  {
    id: "program-3",
    title: "Product Management Mastery",
    description: "Learn product strategy, market research, and how to ship products that users love.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
    tag: "PRODUCT",
    phases: "7 PHASES",
    author: {
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Lina",
      name: "Lina Chen",
    },
  },
  {
    id: "program-4",
    title: "Advanced Data Science",
    description: "Master machine learning, data analysis, and statistical modeling from industry leaders.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    tag: "DATA SCIENCE",
    phases: "8 PHASES",
    author: {
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Ahmed",
      name: "Ahmed Karim",
    },
  },
];

const SuggestedProgramsPage = () => {
  return (
    <Layout>
      <section className="w-full pb-8 pt-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#191D2B] md:text-5xl">
            Recommended Programs for You
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#6D7386] md:text-base">
            Curated programs tailored to match your learning goals and interests.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {suggestedPrograms.map((program) => (
            <ProgramCard
              key={program.id}
              variant="dual-buttons"
              image={program.image}
              tag={program.tag}
              phases={program.phases}
              title={program.title}
              description={program.description}
              author={program.author}
              primaryButtonText="Apply"
              secondaryButtonText="Details"
              className="h-full"
            />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default SuggestedProgramsPage;
