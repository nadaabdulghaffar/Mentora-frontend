
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Layout from "../../shared/components/Layout";

import ProgramCard from "../../components/ProgramCard";

import {
  getMyCommunities,
} from "../../services/communityService";

import {
  mapCommunitiesResponse,
} from "./mappers/community.mapper";

import type {
  Community,
} from "./types";

const MyCommunitiesPage = () => {
  const navigate =
    useNavigate();

  const [
    communities,
    setCommunities,
  ] = useState<
    Community[]
  >([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  useEffect(() => {
    const fetchCommunities =
      async () => {
        try {
          setIsLoading(
            true
          );

          const response =
            await getMyCommunities();

          const mapped =
            mapCommunitiesResponse(
              response
            );

          setCommunities(
            mapped
          );
        } catch (error) {
          console.error(
            "Failed to fetch communities",
            error
          );
        } finally {
          setIsLoading(
            false
          );
        }
      };

    fetchCommunities();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[42px] font-bold leading-tight text-[#1F2432]">
            My Communities
          </h1>

          <p className="mt-2 max-w-4xl text-xl text-[#5B6474]">
            Connect with your joined communities and continue growing together.
          </p>
        </div>

        {communities.length ===
        0 ? (
          <div className="rounded-2xl border border-dashed border-[#C8CDD9] bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-[#2A3042]">
              No communities yet
            </h2>

            <p className="mt-2 text-[#7B869C]">
              Communities you join
              will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {communities.map(
              (
                community
              ) => (
                <ProgramCard
                  key={
                    community.id
                  }
                  variant="dual-buttons"
                  image={
                    community.cover
                  }
                  tag="COMMUNITY"
                  phases={`${community.memberCount.toLocaleString()} MEMBERS`}
                  title={
                    community.name
                  }
                  description={
                    community.description
                  }
                  author={{
                    avatar:
                      community.cover || community.avatar,
                    name: `Hosted community`,
                  }}
                  primaryButtonText="Open Community"
                  secondaryButtonText="Preview"
                  className="h-full"
                  onPrimaryClick={() =>
                    navigate(
                      `/community/${community.id}`
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyCommunitiesPage;

