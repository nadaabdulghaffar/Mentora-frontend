import { useEffect, useMemo, useState } from "react";

import {
  fetchRoadmapBasicOptions,
  type RoadmapBasicOption,
} from "../../services/programService";

export function useRoadmapOptionsForSubdomain(subDomainId: number) {
  const [roadmapOptions, setRoadmapOptions] = useState<RoadmapBasicOption[]>([]);
  const [roadmapsLoading, setRoadmapsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setRoadmapsLoading(true);
      try {
        const list = await fetchRoadmapBasicOptions();
        if (!cancelled) {
          setRoadmapOptions(list);
        }
      } catch {
        if (!cancelled) {
          setRoadmapOptions([]);
        }
      } finally {
        if (!cancelled) {
          setRoadmapsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const roadmapsForSubdomain = useMemo(() => {
    if (!subDomainId || subDomainId < 1) {
      return [];
    }

    return roadmapOptions.filter((roadmap) => roadmap.subDomainId === subDomainId);
  }, [roadmapOptions, subDomainId]);

  return {
    roadmapOptions,
    roadmapsForSubdomain,
    roadmapsLoading,
  };
}
