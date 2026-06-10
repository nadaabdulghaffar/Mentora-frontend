import * as signalR from "@microsoft/signalr";
import { getChatHubUrl } from "./messagingService";
import type { MessageResponseDto } from "../types/messaging";

export type ReceiveMessageHandler = (message: MessageResponseDto) => void;

const LOG_PREFIX = "[SignalR][Chat]";
let connectCallCount = 0;

function getAccessToken(): string {
  return localStorage.getItem("accessToken") ?? "";
}

function logTokenPresence(context: string): void {
  const token = getAccessToken();
  console.log(
    `${LOG_PREFIX} ${context} tokenPresent=${Boolean(token)} tokenLength=${token.length}`
  );
}

function isNegotiationAbortError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === "AbortError" || error.message.includes("stopped during negotiation");
  }
  return false;
}

function formatSignalRError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

/** Normalize hub payload (camelCase or PascalCase) to MessageResponseDto. */
export function normalizeMessageResponseDto(
  raw: Record<string, unknown>
): MessageResponseDto {
  const rawSentAt = String(raw.sentAt ?? raw.SentAt ?? new Date().toISOString());

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
    sentAt: rawSentAt.endsWith("Z") ? rawSentAt : rawSentAt + "Z",
  };
}

class ChatHubService {
  private connection: signalR.HubConnection | null = null;
  private receiveHandlers = new Set<ReceiveMessageHandler>();
  private connectPromise: Promise<void> | null = null;
  /** Incremented on disconnect to invalidate in-flight start() attempts. */
  private connectionEpoch = 0;

  async connect(): Promise<void> {
    connectCallCount += 1;
    console.log(
      `${LOG_PREFIX} connect() called (#${connectCallCount}) state=${this.connection?.state ?? "none"} inFlight=${Boolean(this.connectPromise)}`
    );
    logTokenPresence("connect()");

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log(
        `${LOG_PREFIX} Already connected connectionId=${this.connection.connectionId ?? "unknown"}`
      );
      return;
    }

    if (this.connectPromise) {
      console.log(`${LOG_PREFIX} Reusing in-flight connect promise`);
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
    console.log(`${LOG_PREFIX} Creating connection epoch=${epoch}`);

    if (this.connection) {
      console.log(`${LOG_PREFIX} Stopping existing connection before recreate`);
      try {
        await this.connection.stop();
      } catch (error) {
        console.warn(`${LOG_PREFIX} Stop existing connection failed`, error);
      }
      this.connection = null;
    }

    if (epoch !== this.connectionEpoch) {
      console.log(`${LOG_PREFIX} Start aborted — epoch changed before build`);
      return;
    }

    const hubUrl = getChatHubUrl();
    console.log(`${LOG_PREFIX} Building connection url=${hubUrl}`);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: getAccessToken,
      })
      .withAutomaticReconnect()
      .build();

    this.connection = connection;

    connection.on("ReceiveMessage", (payload: Record<string, unknown>) => {
      console.log(`${LOG_PREFIX} ReceiveMessage fired`);
      const message = normalizeMessageResponseDto(payload);
      this.receiveHandlers.forEach((handler) => handler(message));
    });

    connection.on("Error", (errorMessage: string) => {
      console.error(`${LOG_PREFIX} Hub Error event:`, errorMessage);
    });

    connection.onreconnecting((error) => {
      console.warn(
        `${LOG_PREFIX} Reconnecting... reason=${error ? formatSignalRError(error) : "unknown"}`
      );
    });

    connection.onreconnected((connectionId) => {
      console.log(
        `${LOG_PREFIX} Reconnected connectionId=${connectionId ?? connection.connectionId ?? "unknown"}`
      );
    });

    connection.onclose((error) => {
      if (error) {
        console.error(`${LOG_PREFIX} Disconnected with error: ${formatSignalRError(error)}`);
      } else {
        console.log(`${LOG_PREFIX} Disconnected`);
      }
    });

    if (epoch !== this.connectionEpoch) {
      console.log(`${LOG_PREFIX} Start aborted — epoch changed after build`);
      await this.teardownConnection(connection);
      return;
    }

    console.log(`${LOG_PREFIX} Starting connection`);
    try {
      await connection.start();
      console.log(
        `${LOG_PREFIX} Connected connectionId=${connection.connectionId ?? "unknown"}`
      );
    } catch (error) {
      if (this.connection === connection) {
        this.connection = null;
      }

      if (isNegotiationAbortError(error)) {
        console.warn(
          `${LOG_PREFIX} Negotiation aborted (likely intentional teardown): ${formatSignalRError(error)}`
        );
        return;
      }

      if (epoch !== this.connectionEpoch) {
        console.warn(
          `${LOG_PREFIX} Start failed after epoch change: ${formatSignalRError(error)}`
        );
        return;
      }

      console.error(
        `${LOG_PREFIX} Failed: ${formatSignalRError(error)}`,
        error
      );
      throw error;
    }

    if (epoch !== this.connectionEpoch) {
      console.log(`${LOG_PREFIX} Teardown after successful start — epoch changed`);
      await this.teardownConnection(connection);
    }
  }

  private async teardownConnection(
    connection: signalR.HubConnection
  ): Promise<void> {
    try {
      await connection.stop();
    } catch (error) {
      console.warn(`${LOG_PREFIX} Teardown stop failed`, error);
    }

    if (this.connection === connection) {
      this.connection = null;
    }
  }

  async disconnect(): Promise<void> {
    this.connectionEpoch += 1;
    console.log(
      `${LOG_PREFIX} disconnect() called epoch=${this.connectionEpoch} connectionId=${this.connection?.connectionId ?? "none"}`
    );

    const inFlightConnect = this.connectPromise;
    const connection = this.connection;
    this.connection = null;
    this.connectPromise = null;

    if (connection) {
      try {
        await connection.stop();
      } catch (error) {
        console.warn(`${LOG_PREFIX} disconnect stop failed`, error);
      }
    }

    if (inFlightConnect) {
      try {
        await inFlightConnect;
      } catch (error) {
        console.warn(`${LOG_PREFIX} in-flight connect rejected during disconnect`, error);
      }
    }
  }

  onReceiveMessage(handler: ReceiveMessageHandler): () => void {
    this.receiveHandlers.add(handler);
    return () => {
      this.receiveHandlers.delete(handler);
    };
  }
}

export const chatHubService = new ChatHubService();
