import {
  NOTIFICATION_NAVIGATION_FALLBACK_ROUTE,
  REFERENCE_TYPE_ROUTE_TEMPLATE,
} from "../constants";
import { ReferenceType, type NotificationDto, type ReferenceTypeValue } from "../types";

export type NotificationNavigationTarget = {
  pathname: string;
  search?: string;
  state?: Record<string, unknown>;
};

export type NotificationNavigationResolution =
  | {
      status: "resolved";
      target: NotificationNavigationTarget;
      referenceType: ReferenceTypeValue;
      /** True when navigating to a parent/list page instead of a deep link. */
      isFallback: boolean;
    }
  | {
      status: "missing-reference";
      reason: string;
    }
  | {
      status: "unsupported";
      referenceType: number | undefined;
      reason: string;
    };

const REFERENCE_TYPE_VALUES = new Set<number>(Object.values(ReferenceType));

function isReferenceTypeValue(value: number): value is ReferenceTypeValue {
  return REFERENCE_TYPE_VALUES.has(value);
}

function substituteRouteId(template: string, referenceId: string): string {
  return template.replace(":id", encodeURIComponent(referenceId));
}

/**
 * Adapts `REFERENCE_TYPE_ROUTE_TEMPLATE` entries to routes that exist in App.tsx.
 * Templates that already match a real route are used as-is after substitution.
 */
function resolveVerifiedRoute(
  referenceType: ReferenceTypeValue,
  referenceId: string,
  notification: NotificationDto
): NotificationNavigationTarget {
  switch (referenceType) {
    case ReferenceType.Program:
      return {
        pathname: substituteRouteId(
          REFERENCE_TYPE_ROUTE_TEMPLATE[ReferenceType.Application],
          referenceId
        ),
      };

    case ReferenceType.Application:
      return {
        pathname: substituteRouteId(
          REFERENCE_TYPE_ROUTE_TEMPLATE[ReferenceType.Application],
          referenceId
        ),
      };

    case ReferenceType.Submission:
      return { pathname: "/my-programs" };

    case ReferenceType.ClassroomPost:
      return { pathname: "/my-programs" };

    case ReferenceType.CommunityPost:
      return { pathname: "/my-communities" };

    case ReferenceType.Conversation:
      return {
        pathname: "/messages",
        search: `?conversationId=${encodeURIComponent(referenceId)}`,
        state: { conversationId: referenceId },
      };

    case ReferenceType.UserProfile:
      return {
        pathname: substituteRouteId(
          REFERENCE_TYPE_ROUTE_TEMPLATE[ReferenceType.UserProfile],
          referenceId
        ),
      };

    case ReferenceType.Feedback:
      if (notification.senderId) {
        return {
          pathname: substituteRouteId(
            REFERENCE_TYPE_ROUTE_TEMPLATE[ReferenceType.UserProfile],
            notification.senderId
          ),
          search: "?tab=reviews",
        };
      }

      return {
        pathname: "/profile",
        search: "?tab=reviews",
      };

    default: {
      const template = REFERENCE_TYPE_ROUTE_TEMPLATE[referenceType];
      return {
        pathname: substituteRouteId(template, referenceId),
      };
    }
  }
}

function isFallbackRoute(referenceType: ReferenceTypeValue): boolean {
  return (
    referenceType === ReferenceType.Submission ||
    referenceType === ReferenceType.ClassroomPost ||
    referenceType === ReferenceType.CommunityPost
  );
}

export function resolveNotificationRoute(
  notification: NotificationDto
): NotificationNavigationResolution {
  const { referenceType, referenceId } = notification;

  if (referenceType == null || !referenceId?.trim()) {
    return {
      status: "missing-reference",
      reason: "This notification has no linked destination.",
    };
  }

  if (!isReferenceTypeValue(referenceType)) {
    return {
      status: "unsupported",
      referenceType,
      reason: "This notification type is not supported yet.",
    };
  }

  const target = resolveVerifiedRoute(
    referenceType,
    referenceId.trim(),
    notification
  );

  if (!target.pathname) {
    return {
      status: "unsupported",
      referenceType,
      reason: "This notification cannot be opened yet.",
    };
  }

  return {
    status: "resolved",
    target,
    referenceType,
    isFallback: isFallbackRoute(referenceType),
  };
}

export function getNotificationNavigationFallbackRoute(): string {
  return NOTIFICATION_NAVIGATION_FALLBACK_ROUTE;
}
