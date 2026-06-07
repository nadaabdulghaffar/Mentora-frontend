import apiClient from "./api";
import type { ApiResponse } from "../types/api";

type FileUploadResponse = {
  fileUrl: string;
};

export async function uploadProgramImage(
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<
    ApiResponse<FileUploadResponse>
  >("/File/upload-program-image", formData, {
    headers: {
      "Content-Type": undefined,
    },
  });

  if (
    !response.data?.success ||
    !response.data?.data?.fileUrl
  ) {
    throw new Error(
      response.data?.message ||
        "Failed to upload image."
    );
  }

  return response.data.data.fileUrl;
}

/** Reuse program-image upload endpoint for community cover images. */
export async function uploadCommunityCoverImage(
  file: File
): Promise<string> {
  return uploadProgramImage(file);
}

export async function uploadChatAttachment(
  file: File
): Promise<{ fileUrl: string; fileName: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<
    ApiResponse<{ fileUrl: string; fileName: string }>
  >("/File/upload-chat-attachment", formData, {
    headers: {
      "Content-Type": undefined,
    },
  });

  if (
    !response.data?.success ||
    !response.data?.data?.fileUrl
  ) {
    throw new Error(
      response.data?.message ||
        "Failed to upload file."
    );
  }

  return response.data.data;
}
