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

function getAccessToken(): string {
  return localStorage.getItem("accessToken") ?? "";
}

function isNegotiationAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
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
    if (!getAccessToken()) {
      return;
    }

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
      .withUrl(getNotificationHubUrl(), {
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

    connection.onreconnected(() => {
      this.reconnectedHandlers.forEach((handler) => handler());
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
