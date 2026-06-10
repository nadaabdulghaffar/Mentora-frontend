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

  async getAllUpcomingSessions() {
    const response = await apiClient.get(
      `/classroom/sessions/upcoming/all`
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

async getClassroomDashboard(
  programId: number
) {
  const response =
    await apiClient.get(
      `/classroom/program/${programId}/dashboard`
    );

  return response.data;
},

async deleteStudent(
  programId: number,
  studentId: string
) {

  const response =
    await apiClient.delete(
      `/classroom/program/${programId}/dashboard/students/${studentId}`
    );

  return response.data;
},

async attachRoadmapToProgram(
  programId: number,
  roadmapId: number
) {
  const response = await api.patch(
    `/ProgramMentor/${programId}/update`,
    { roadmapId }
  );

  return response.data;
},

  async getClassroomRoadmapResource(programId: number) {
    const response = await apiClient.get(
      `/classroom/program/${programId}/roadmap-resource`
    );

    return response.data;
  },

  async upsertClassroomRoadmapResource(
    programId: number,
    payload: {
      resourceType: "Pdf" | "ExternalLink";
      fileUrl?: string;
      fileName?: string;
      externalUrl?: string;
    }
  ) {
    const response = await apiClient.put(
      `/classroom/program/${programId}/roadmap-resource`,
      payload
    );

    return response.data;
  },

  async deleteClassroomRoadmapResource(programId: number) {
    const response = await apiClient.delete(
      `/classroom/program/${programId}/roadmap-resource`
    );

    return response.data;
  },

  async getClassroomCompletion(programId: number) {
    const response = await apiClient.get(
      `/classroom/program/${programId}/dashboard/completion`
    );

    return response.data;
  },

};