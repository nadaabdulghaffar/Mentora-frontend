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
  taskId?: number,
  status?: string
) {

  const response = await apiClient.get(
    `/tasksubmission/programs/${programId}/submissions`,
    {
      params: {
        taskId,
        status,
      },
    }
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