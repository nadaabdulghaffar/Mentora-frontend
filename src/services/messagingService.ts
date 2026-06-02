import apiClient from "./api";
import type { ApiResponse, FileUploadResponse } from "../types/api";
import type {
  ChatAttachmentUpload,
  ConversationResponseDto,
  CreateConversationDto,
  CreateMessageDto,
  MessageResponseDto,
} from "../types/messaging";

const CHAT_ATTACHMENT_ACCEPT =
  ".jpg,.jpeg,.png,.pdf,.doc,.docx,.zip,image/jpeg,image/png,application/pdf";

export { CHAT_ATTACHMENT_ACCEPT };

export function getBackendOrigin(): string {
  const apiBase =
    import.meta.env.VITE_API_URL || "http://localhost:5069/api";

  return apiBase.replace(/\/+$/, "").replace(/\/api$/i, "");
}

export function getChatHubUrl(): string {
  return `${getBackendOrigin()}/hubs/chat`;
}

/** Backend returns relative paths like `/uploads/chat-attachments/...`; messages API requires absolute HTTP(S) URLs. */
export function toAbsoluteFileUrl(fileUrl: string): string {
  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  const origin = getBackendOrigin();
  const path = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
  return `${origin}${path}`;
}

export function resolveAttachmentDisplayUrl(
  attachmentUrl: string | null | undefined
): string | null {
  if (!attachmentUrl?.trim()) {
    return null;
  }

  return toAbsoluteFileUrl(attachmentUrl.trim());
}

export function isImageAttachment(
  contentType: string | undefined,
  fileNameOrUrl: string
): boolean {
  if (contentType?.toLowerCase().startsWith("image/")) {
    return true;
  }

  return /\.(jpe?g|png|gif|webp)$/i.test(fileNameOrUrl);
}

export function fileNameFromAttachmentUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const base = path.split("/").pop() || "Attachment";
    return decodeURIComponent(base);
  } catch {
    const segment = url.split("/").pop() || "Attachment";
    return decodeURIComponent(segment.split("?")[0] || "Attachment");
  }
}

const GUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUserGuid(id: string): boolean {
  return GUID_REGEX.test(id);
}

function unwrapMessagingEnvelope<T>(body: ApiResponse<T> | undefined): T {
  if (
    !body ||
    body.success !== true ||
    body.data === undefined ||
    body.data === null
  ) {
    const err = new Error(
      body?.message || "Messaging request failed"
    ) as Error & { response?: { data: unknown } };
    err.response = { data: body };
    throw err;
  }

  return body.data;
}

export const messagingService = {
  async createOrGetConversation(
    otherUserId: string
  ): Promise<ConversationResponseDto> {
    const payload: CreateConversationDto = { otherUserId };
    const response = await apiClient.post<ApiResponse<ConversationResponseDto>>(
      "/conversations",
      payload
    );

    return unwrapMessagingEnvelope(response.data);
  },

  async getConversations(): Promise<ConversationResponseDto[]> {
    const response = await apiClient.get<
      ApiResponse<ConversationResponseDto[]>
    >("/conversations");

    return unwrapMessagingEnvelope(response.data);
  },

  async getMessages(conversationId: string): Promise<MessageResponseDto[]> {
    const response = await apiClient.get<ApiResponse<MessageResponseDto[]>>(
      `/conversations/${conversationId}/messages`
    );

    return unwrapMessagingEnvelope(response.data);
  },

  async sendMessage(
    conversationId: string,
    payload: CreateMessageDto
  ): Promise<MessageResponseDto> {
    const response = await apiClient.post<ApiResponse<MessageResponseDto>>(
      `/conversations/${conversationId}/messages`,
      payload
    );

    return unwrapMessagingEnvelope(response.data);
  },

  async markAsRead(conversationId: string): Promise<number> {
    const response = await apiClient.patch<ApiResponse<number>>(
      `/conversations/${conversationId}/read`
    );

    return unwrapMessagingEnvelope(response.data);
  },

  async uploadAttachment(file: File): Promise<ChatAttachmentUpload> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<FileUploadResponse>>(
      "/File/upload-chat-attachment",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    );

    const data = unwrapMessagingEnvelope(response.data);
    const absoluteFileUrl = toAbsoluteFileUrl(data.fileUrl);

    return {
      fileUrl: absoluteFileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      contentType: data.contentType,
    };
  },
};
