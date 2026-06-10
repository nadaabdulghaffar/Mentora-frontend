import * as signalR from "@microsoft/signalr";
import { getBackendOrigin } from "../../services/messagingService";
import {
  NOTIFICATION_HUB_PATH,
  NOTIFICATION_SIGNALR_EVENT,
} from "../constants";
import type { NotificationDto } from "../types";
import type {
  NotificationTypeValue,
  ReferenceTypeValue,
} from "../types/notification.enums";

export type ReceiveNotificationHandler = (notification: NotificationDto) => void;
export type NotificationHubReconnectedHandler = () => void;

const LOG_PREFIX = "[SignalR][Notifications]";
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

export function getNotificationHubUrl(): string {
  return `${getBackendOrigin()}${NOTIFICATION_HUB_PATH}`;
}

/** Normalize hub payload (camelCase or PascalCase) to `NotificationDto`. */
export function normalizeNotificationDto(
  raw: Record<string, unknown>
): NotificationDto {
  const referenceTypeRaw = raw.referenceType ?? raw.ReferenceType;
  const senderIdRaw = raw.senderId ?? raw.SenderId;
  const referenceIdRaw = raw.referenceId ?? raw.ReferenceId;

  return {
    notificationId: String(raw.notificationId ?? raw.NotificationId ?? ""),
    senderId: senderIdRaw != null ? String(senderIdRaw) : undefined,
    senderName:
      (raw.senderName ?? raw.SenderName ?? undefined) as string | undefined,
    senderAvatar:
      (raw.senderAvatar ?? raw.SenderAvatar ?? undefined) as string | undefined,
    type: Number(raw.type ?? raw.Type) as NotificationTypeValue,
    title: String(raw.title ?? raw.Title ?? ""),
    message: String(raw.message ?? raw.Message ?? ""),
    referenceType:
      referenceTypeRaw != null
        ? (Number(referenceTypeRaw) as ReferenceTypeValue)
        : undefined,
    referenceId:
      referenceIdRaw != null ? String(referenceIdRaw) : undefined,
    isRead: Boolean(raw.isRead ?? raw.IsRead ?? false),
    createdAt: String(
      raw.createdAt ?? raw.CreatedAt ?? new Date().toISOString()
    ),
  };
}

class NotificationSignalRService {
  private connection: signalR.HubConnection | null = null;
  private receiveHandlers = new Set<ReceiveNotificationHandler>();
  private reconnectedHandlers = new Set<NotificationHubReconnectedHandler>();
  private connectPromise: Promise<void> | null = null;
  private connectionEpoch = 0;

  async connect(): Promise<void> {
    connectCallCount += 1;
    console.log(
      `${LOG_PREFIX} connect() called (#${connectCallCount}) state=${this.connection?.state ?? "none"} inFlight=${Boolean(this.connectPromise)}`
    );
    logTokenPresence("connect()");

    if (!getAccessToken()) {
      console.warn(`${LOG_PREFIX} Skipping connect — no access token`);
      return;
    }

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

    const hubUrl = getNotificationHubUrl();
    console.log(`${LOG_PREFIX} Building connection url=${hubUrl}`);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: getAccessToken,
      })
      .withAutomaticReconnect()
      .build();

    this.connection = connection;

    connection.on(
      NOTIFICATION_SIGNALR_EVENT,
      (payload: Record<string, unknown>) => {
        const notification = normalizeNotificationDto(payload);
        if (!notification.notificationId) {
          return;
        }

        this.receiveHandlers.forEach((handler) => handler(notification));
      }
    );

    connection.onreconnecting((error) => {
      console.warn(
        `${LOG_PREFIX} Reconnecting... reason=${error ? formatSignalRError(error) : "unknown"}`
      );
    });

    connection.onreconnected((connectionId) => {
      console.log(
        `${LOG_PREFIX} Reconnected connectionId=${connectionId ?? connection.connectionId ?? "unknown"}`
      );
      this.reconnectedHandlers.forEach((handler) => handler());
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

  onReceiveNotification(handler: ReceiveNotificationHandler): () => void {
    this.receiveHandlers.add(handler);
    return () => {
      this.receiveHandlers.delete(handler);
    };
  }

  onReconnected(handler: NotificationHubReconnectedHandler): () => void {
    this.reconnectedHandlers.add(handler);
    return () => {
      this.reconnectedHandlers.delete(handler);
    };
  }
}

export const notificationSignalR = new NotificationSignalRService();
