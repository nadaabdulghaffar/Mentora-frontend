import apiClient from "../config/api";

export type ClassroomTaskApiResponse = {
  classroomTaskId: number;
  classroomId: number;
  createdByMentorId: string;
  title: string;
  description?: string;
  attachmentUrl?: string;
  deadline?: string;
  createdAt: string;
  isDeleted: boolean;
  taskType: "Classroom";
  mySubmission?: {
    submissionId: number;
    taskId: number;
    taskTitle: string;
    taskType: string;
    status: string;
    links: { url: string; label?: string }[];
    review?: {
      grade?: number;
      feedback?: string;
      isRevisionRequest?: boolean;
      reviewedAt?: string;
    };
    submittedAt?: string;
    notesForMentor?: string;
  } | null;
};

export type CreateClassroomTaskPayload = {
  title: string;
  description: string;
  attachmentUrl?: string;
  deadline: string;
};

export type UpdateClassroomTaskPayload = {
  title?: string;
  description?: string;
  attachmentUrl?: string;
  deadline?: string;
};

export const classroomTaskService = {
  async getClassroomTasks(classroomId: number) {
    const response = await apiClient.get(
      `/classroomtask/classrooms/${classroomId}/tasks`
    );
    return response.data;
  },

  async createTask(classroomId: number, payload: CreateClassroomTaskPayload) {
    const response = await apiClient.post(
      `/classroomtask/classrooms/${classroomId}/tasks`,
      payload
    );
    return response.data;
  },

  async updateTask(taskId: number, payload: UpdateClassroomTaskPayload) {
    const response = await apiClient.put(
      `/classroomtask/tasks/${taskId}`,
      payload
    );
    return response.data;
  },

  async deleteTask(taskId: number) {
    const response = await apiClient.delete(
      `/classroomtask/tasks/${taskId}`
    );
    return response.data;
  },
};
