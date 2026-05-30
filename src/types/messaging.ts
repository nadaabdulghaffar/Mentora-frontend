export interface ConversationResponseDto {
  conversationId: string;
  otherUserId: string;
  otherUserFirstName: string;
  otherUserLastName: string;
  otherUserProfilePicture: string | null;
  lastMessageContent: string | null;
  lastMessageAttachmentUrl: string | null;
  lastMessageSentAt: string | null;
  lastMessageSenderId: string | null;
  unreadCount: number;
}

export interface MessageResponseDto {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderFirstName: string;
  senderLastName: string;
  senderProfilePicture: string | null;
  content: string | null;
  attachmentUrl: string | null;
  isRead: boolean;
  sentAt: string;
}

export interface CreateConversationDto {
  otherUserId: string;
}

export interface CreateMessageDto {
  content?: string | null;
  attachmentUrl?: string | null;
}

/** Uploaded chat file ready to attach to a message (absolute URL for API). */
export interface ChatAttachmentUpload {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}
