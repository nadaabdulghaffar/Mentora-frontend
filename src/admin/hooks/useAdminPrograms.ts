import { useQuery } from "@tanstack/react-query";
import { programsService, type ProgramFilterParams } from "../services/programsService";

export const adminProgramKeys = {
  all: ["adminPrograms"] as const,
  lists: () => [...adminProgramKeys.all, "list"] as const,
  list: (params: ProgramFilterParams) => [...adminProgramKeys.lists(), params] as const,
  details: () => [...adminProgramKeys.all, "detail"] as const,
  detail: (id: number) => [...adminProgramKeys.details(), id] as const,
};

export const useAdminPrograms = (params: ProgramFilterParams) => {
  return useQuery({
    queryKey: adminProgramKeys.list(params),
    queryFn: () => programsService.getPrograms(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdminProgramDetail = (id: number | null) => {
  return useQuery({
    queryKey: adminProgramKeys.detail(id!),
    queryFn: () => programsService.getProgramById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
