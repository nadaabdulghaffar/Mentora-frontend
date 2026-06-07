import apiClient from "../config/api";

export const taskSubmissionService = {

  async getPhaseTasks(
    phaseId: number,
    status?: string
  ) {

    const response =
      await apiClient.get(
        `/tasksubmission/phases/${phaseId}/tasks`,
        {
       params: status
  ? { status }
  : undefined,
        }
      );

    return response.data;
  },

  async createSubmission(
    taskId: number,
    payload: {
      title: string;
      notesForMentor?: string;
      publish: boolean;
      links: {
        url: string;
        label: string;
      }[];
      classroomTaskId?: number;
      topicTaskId?: number;
    }
  ) {

    const response =
      await apiClient.post(
        `/tasksubmission/tasks/${taskId}`,
        payload
      );

    return response.data;
  },

  async updateSubmission(
    submissionId: number,
    payload: {
      title?: string;
      notesForMentor?: string;
      publish?: boolean;
      links?: {
        url: string;
        label: string;
      }[];
    }
  ) {

    const response =
      await apiClient.patch(
        `/tasksubmission/${submissionId}`,
        payload
      );

    return response.data;
  },

  async getMySubmission(
    taskId: number
  ) {

    const response =
      await apiClient.get(
        `/tasksubmission/tasks/${taskId}/my`
      );

    return response.data;
  },

  async deleteSubmission(
    submissionId: number
  ) {

    const response =
      await apiClient.delete(
        `/tasksubmission/${submissionId}`
      );

    return response.data;
  },

};