import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { messagingService } from "../services/messagingService";
import { chatHubService } from "../services/chatHubService";
import authAPI from "../services/authService";

export const messageKeys = {
  all: ["messages"] as const,
  unreadCount: () => [...messageKeys.all, "unreadCount"] as const,
};

export function useUnreadMessageCount() {
  const queryClient = useQueryClient();
  
  const isAuthenticated = authAPI.isAuthenticated();
  const user = authAPI.getCurrentUser();

  const query = useQuery({
    queryKey: messageKeys.unreadCount(),
    queryFn: () => messagingService.getUnreadCount(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    console.log("[UnreadBadge] Hook mounted", { isAuthenticated, userId: user?.userId });
    if (!isAuthenticated || !user?.userId) return;

    // Connect globally so messages are received even outside MessagesPage
    void chatHubService.connect();

    const unsubscribe = chatHubService.onReceiveMessage((message) => {
      console.log("[UnreadBadge] SignalR message received", message);
      if (message.senderId !== user.userId) {
        // Prevent incrementing the badge if the user is actively viewing this conversation
        const isViewingConversation =
          window.location.pathname.startsWith("/messages") &&
          new URLSearchParams(window.location.search).get("conversationId") === message.conversationId;

        console.log("[UnreadBadge] isViewingConversation:", isViewingConversation);

        if (!isViewingConversation) {
          queryClient.setQueryData<number>(messageKeys.unreadCount(), (old) => {
            console.log("[UnreadBadge] Count before increment", old);
            const newCount = (old ?? 0) + 1;
            console.log("[UnreadBadge] Count after increment", newCount);
            return newCount;
          });
        }
      }
    });

    return () => {
      console.log("[UnreadBadge] Hook unmounted");
      unsubscribe();
      // Disconnect if the user logs out or the app unmounts
      void chatHubService.disconnect();
    };
  }, [isAuthenticated, user?.userId, queryClient]);

  return query;
}
