import * as signalR from "@microsoft/signalr";
import { getChatHubUrl } from "./messagingService";
import type { MessageResponseDto } from "../types/messaging";

export type ReceiveMessageHandler = (message: MessageResponseDto) => void;

function getAccessToken(): string {
  return localStorage.getItem("accessToken") ?? "";
}

function isNegotiationAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

/** Normalize hub payload (camelCase or PascalCase) to MessageResponseDto. */
export function normalizeMessageResponseDto(
  raw: Record<string, unknown>
): MessageResponseDto {
  return {
    messageId: String(raw.messageId ?? raw.MessageId ?? ""),
    conversationId: String(raw.conversationId ?? raw.ConversationId ?? ""),
    senderId: String(raw.senderId ?? raw.SenderId ?? ""),
    senderFirstName: String(raw.senderFirstName ?? raw.SenderFirstName ?? ""),
    senderLastName: String(raw.senderLastName ?? raw.SenderLastName ?? ""),
    senderProfilePicture:
      (raw.senderProfilePicture ?? raw.SenderProfilePicture ?? null) as
        | string
        | null,
    content: (raw.content ?? raw.Content ?? null) as string | null,
    attachmentUrl: (raw.attachmentUrl ?? raw.AttachmentUrl ?? null) as
      | string
      | null,
    isRead: Boolean(raw.isRead ?? raw.IsRead ?? false),
    sentAt: String(raw.sentAt ?? raw.SentAt ?? new Date().toISOString()),
  };
}

class ChatHubService {
  private connection: signalR.HubConnection | null = null;
  private receiveHandlers = new Set<ReceiveMessageHandler>();
  private connectPromise: Promise<void> | null = null;
  /** Incremented on disconnect to invalidate in-flight start() attempts. */
  private connectionEpoch = 0;

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = this.startConnection();

    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  private async startConnection(): Promise<void> {
    const epoch = this.connectionEpoch;

    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // ignore stop errors while replacing connection
      }
      this.connection = null;
    }

    if (epoch !== this.connectionEpoch) {
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(getChatHubUrl(), {
        accessTokenFactory: getAccessToken,
      })
      .withAutomaticReconnect()
      .build();

    this.connection = connection;

    connection.on("ReceiveMessage", (payload: Record<string, unknown>) => {
      const message = normalizeMessageResponseDto(payload);
      this.receiveHandlers.forEach((handler) => handler(message));
    });

    connection.on("Error", (errorMessage: string) => {
      console.error("[ChatHub] Error:", errorMessage);
    });

    if (epoch !== this.connectionEpoch) {
      await this.teardownConnection(connection);
      return;
    }

    try {
      await connection.start();
    } catch (error) {
      if (this.connection === connection) {
        this.connection = null;
      }

      if (isNegotiationAbortError(error) || epoch !== this.connectionEpoch) {
        return;
      }

      throw error;
    }

    if (epoch !== this.connectionEpoch) {
      await this.teardownConnection(connection);
    }
  }

  private async teardownConnection(
    connection: signalR.HubConnection
  ): Promise<void> {
    try {
      await connection.stop();
    } catch {
      // ignore negotiation abort during intentional teardown
    }

    if (this.connection === connection) {
      this.connection = null;
    }
  }

  async disconnect(): Promise<void> {
    this.connectionEpoch += 1;

    const inFlightConnect = this.connectPromise;
    const connection = this.connection;
    this.connection = null;

    if (connection) {
      try {
        await connection.stop();
      } catch {
        // ignore abort while stopping during negotiation
      }
    }

    if (inFlightConnect) {
      try {
        await inFlightConnect;
      } catch {
        // ignore aborted connect promise
      }
    }

    this.connectPromise = null;
  }

  onReceiveMessage(handler: ReceiveMessageHandler): () => void {
    this.receiveHandlers.add(handler);
    return () => {
      this.receiveHandlers.delete(handler);
    };
  }
}

export const chatHubService = new ChatHubService();
