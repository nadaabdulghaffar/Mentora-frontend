import { useQuery } from '@tanstack/react-query';
import { classroomService } from '../services/classroomService';
import { ApiResponse, ProgramSessionDto } from '../types/api';

export const useAllUpcomingSessions = () => {
  return useQuery<ApiResponse<ProgramSessionDto[]>>({
    queryKey: ['upcomingSessions', 'all'],
    queryFn: async () => {
      const response = await classroomService.getAllUpcomingSessions();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
