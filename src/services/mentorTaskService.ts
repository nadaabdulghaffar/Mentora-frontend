import apiClient from "../config/api";

export const mentorTaskService = {

  async getTaskRegistry(programId: number) {

    const response = await apiClient.get(
      `/tasksubmission/programs/${programId}/task-registry`
    );

    return response.data;
  },

 async getProgramSubmissions(
  programId: number,
  taskId?: number
) {

  const response = await apiClient.get(
    `/tasksubmission/programs/${programId}/submissions`,
    {
      params: {
        taskId,
      },
    }
  );

  return response.data;
},


  async reviewSubmission(
    submissionId: number,
    payload: {
      grade: number;
      feedback: string;
      requestRevision: boolean;
    }
  ) {

    const response = await apiClient.post(
      `/tasksubmission/${submissionId}/review`,
      payload
    );

    return response.data;
  },

};