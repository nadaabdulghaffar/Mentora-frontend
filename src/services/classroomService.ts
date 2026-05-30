import apiClient from "../config/api";
import api from "./api";

export const classroomService = {
  async getSessions(programId: number) {
    const response = await apiClient.get(
      `/classroom/program/${programId}/sessions`
    );

    return response.data;
  },

  async getUpcomingSession(programId: number) {
    const response = await apiClient.get(
      `/classroom/program/${programId}/sessions/upcoming`
    );

    return response.data;
  },

   async getClassroom(programId: number) {
    const response = await apiClient.get(
      `/classroom/program/${programId}`
    );

    return response.data;
  },

  async createSession(
    programId: number,
    payload: {
      title: string;
      scheduledAt: string;
      meetingLink: string;
    }
  ) {
    const response = await apiClient.post(
      `/classroom/program/${programId}/sessions`,
      payload
    );

    return response.data;
  },

  async cancelSession(sessionId: number) {
const response = await apiClient.patch(
`/classroom/sessions/${sessionId}/cancel`
);

return response.data;
},


async updateSession(
  sessionId: number,
  payload: {
    title?: string;
    meetingLink?: string;
    scheduledAt?: string;
  }
) {
  const response = await apiClient.patch(
    `/classroom/sessions/${sessionId}`,
    payload
  );

  return response.data;
},




};