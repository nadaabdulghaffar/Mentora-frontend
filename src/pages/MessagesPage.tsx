import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Paperclip,
  Search,
  SendHorizontal,
  Smile,
  X,
} from "lucide-react";
import Layout from "../shared/components/Layout";
import authAPI from "../services/authService";
import { chatHubService } from "../services/chatHubService";
import { messageKeys } from "../hooks/useUnreadMessageCount";
import {
  CHAT_ATTACHMENT_ACCEPT,
  fileNameFromAttachmentUrl,
  isImageAttachment,
  messagingService,
  resolveAttachmentDisplayUrl,
  toAbsoluteFileUrl,
} from "../services/messagingService";
import type {
  ChatAttachmentUpload,
  ConversationResponseDto,
  MessageResponseDto,
} from "../types/messaging";
import {
  useEffectRunDiagnostics,
  usePageLifecycleDiagnostics,
  withLoadingDiagnostics,
} from "../utils/pageDiagnosticLogger";

const PAGE_NAME = "MessagesPage";

type Contact = {
  id: string;
  otherUserId: string;
  name: string;
  role: string;
  avatar: string;
  preview: string;
  time: string;
  unread?: number;
};

type ChatMessageAttachment = {
  url: string;
  fileName: string;
  isImage: boolean;
};

type ChatMessage = {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  attachment?: ChatMessageAttachment;
};

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80";

function formatListTime(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const utcValue = value.endsWith("Z") ? value : value + "Z";
  const date = new Date(utcValue);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatMessageTime(value: string): string {
  if (!value) return "";
  const utcValue = value.endsWith("Z") ? value : value + "Z";
  return new Date(utcValue).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapConversationToContact(
  conversation: ConversationResponseDto
): Contact {
  const name = `${conversation.otherUserFirstName} ${conversation.otherUserLastName}`.trim();
  const preview =
    conversation.lastMessageContent?.trim() ||
    (conversation.lastMessageAttachmentUrl ? "Attachment" : "No messages yet");

  return {
    id: conversation.conversationId,
    otherUserId: conversation.otherUserId,
    name,
    role: "Student",
    avatar: conversation.otherUserProfilePicture
      ? toAbsoluteFileUrl(conversation.otherUserProfilePicture)
      : DEFAULT_AVATAR,
    preview,
    time: formatListTime(conversation.lastMessageSentAt),
    unread: conversation.unreadCount > 0 ? conversation.unreadCount : undefined,
  };
}

function mapMessageToChatMessage(
  message: MessageResponseDto,
  currentUserId: string
): ChatMessage {
  const attachmentUrl = resolveAttachmentDisplayUrl(message.attachmentUrl);
  const attachment = attachmentUrl
    ? {
        url: attachmentUrl,
        fileName: fileNameFromAttachmentUrl(attachmentUrl),
        isImage: isImageAttachment(undefined, attachmentUrl),
      }
    : undefined;

  return {
    id: message.messageId,
    sender: message.senderId === currentUserId ? "me" : "them",
    text: message.content?.trim() ?? "",
    time: formatMessageTime(message.sentAt),
    attachment,
  };
}

function MessageAttachmentContent({
  attachment,
  isOwnMessage,
}: {
  attachment: ChatMessageAttachment;
  isOwnMessage: boolean;
}) {
  if (attachment.isImage) {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
        <img
          src={attachment.url}
          alt={attachment.fileName}
          className="max-h-48 max-w-full rounded-lg object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-sm font-semibold underline ${
        isOwnMessage ? "text-white" : "text-primary"
      }`}
    >
      {attachment.fileName}
    </a>
  );
}

type MessagesLocationState = {
  conversationId?: string;
  otherUserId?: string;
};

const MessagesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as MessagesLocationState | null;
  const queryClient = useQueryClient();

  const currentUserId = authAPI.getCurrentUser()?.userId ?? "";

  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [pendingAttachment, setPendingAttachment] =
    useState<ChatAttachmentUpload | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef =
  useRef<HTMLDivElement>(null);
  const activeContactIdRef = useRef<string | null>(null);
  const currentUserIdRef = useRef(currentUserId);
  const contactsRef = useRef<Contact[]>([]);
  const handleIncomingMessageRef = useRef<
    (message: MessageResponseDto) => Promise<void>
  >(async () => {});

  usePageLifecycleDiagnostics(PAGE_NAME);
  useEffectRunDiagnostics(PAGE_NAME, "connectHub", []);

  useEffect(() => {
    activeContactIdRef.current = activeContactId;
  }, [activeContactId]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  useEffect(() => {
  const container =
    messagesContainerRef.current;

  if (!container) return;

  container.scrollTo({
    top: container.scrollHeight,
    behavior: "smooth",
  });
}, [activeMessages]);

  const loadActiveMessages = useCallback(
    async (conversationId: string, options?: { showLoading?: boolean }) => {
      const showLoading = options?.showLoading ?? true;

      if (showLoading) {
        setIsLoadingMessages(true);
        setActiveMessages([]);
      }

      try {
        const messages = await withLoadingDiagnostics(
          PAGE_NAME,
          `messages for ${conversationId}`,
          () => messagingService.getMessages(conversationId)
        );
        
        if (activeContactIdRef.current !== conversationId) {
          return;
        }

        setActiveMessages((prev) => {
          const fetchedMessages = messages.map((message) =>
            mapMessageToChatMessage(message, currentUserId)
          );
          const fetchedIds = new Set(fetchedMessages.map((m) => m.id));
          const extra = prev.filter((m) => !fetchedIds.has(m.id));
          return [...fetchedMessages, ...extra];
        });
      } catch (error) {
        console.error(`[${PAGE_NAME}] Failed to load messages`, error);
        setActiveMessages([]);
      } finally {
        if (showLoading) {
          setIsLoadingMessages(false);
        }
      }
    },
    [currentUserId]
  );

  const loadConversations = useCallback(
    async (options?: { showLoading?: boolean }) => {
      const showLoading = options?.showLoading ?? true;

      if (showLoading) {
        setIsLoadingConversations(true);
      }

      setLoadError(null);

      try {
        const list = await withLoadingDiagnostics(
          PAGE_NAME,
          "conversations",
          () => messagingService.getConversations()
        );
        const mappedContacts = list.map(mapConversationToContact);
        setContacts(mappedContacts);
        return mappedContacts;
      } catch (error) {
        console.error(`[${PAGE_NAME}] Failed to load conversations`, error);
        setLoadError("Unable to load conversations.");
        return [];
      } finally {
        if (showLoading) {
          setIsLoadingConversations(false);
        }
      }
    },
    []
  );

  const handleIncomingMessage = useCallback(
    async (message: MessageResponseDto) => {
      if (!message.messageId || !message.conversationId) {
        return;
      }

      const conversationId = message.conversationId;
      const isActive = activeContactIdRef.current === conversationId;
      const isFromMe =
        message.senderId === currentUserIdRef.current;

      const preview =
        message.content?.trim() ||
        (message.attachmentUrl ? "Attachment" : "No messages yet");

      const isMissing = !contactsRef.current.some((c) => c.id === conversationId);

      if (isMissing) {
        console.log(`[${PAGE_NAME}] Refresh trigger — incoming message for unknown conversation`);
        await loadConversations({ showLoading: false });
        return;
      }

      setContacts((prev) => {
        const index = prev.findIndex((contact) => contact.id === conversationId);
        if (index === -1) return prev;

        const contact = prev[index];
        const updatedContact: Contact = {
          ...contact,
          preview,
          time: formatListTime(message.sentAt),
          unread:
            isActive || isFromMe
              ? undefined
              : (contact.unread ?? 0) + 1,
        };

        const next = [...prev];
        next.splice(index, 1);
        next.unshift(updatedContact);
        return next;
      });

      if (isActive) {
        setActiveMessages((prev) => {
          if (prev.some((item) => item.id === message.messageId)) {
            return prev;
          }

          return [
            ...prev,
            mapMessageToChatMessage(message, currentUserIdRef.current),
          ];
        });

        if (!isFromMe) {
          try {
            const readCount = await messagingService.markAsRead(conversationId);
            queryClient.setQueryData<number>(messageKeys.unreadCount(), (old) => {
              console.log("[UnreadBadge] Count before decrement", old);
              const newCount = Math.max(0, (old ?? 0) - readCount);
              console.log("[UnreadBadge] Count after decrement", newCount);
              return newCount;
            });
          } catch (error) {
            console.error(`[${PAGE_NAME}] Failed to mark conversation as read`, error);
          }
        }
      }
    },
    [loadConversations]
  );

  useEffectRunDiagnostics(PAGE_NAME, "loadConversations", [loadConversations]);
  useEffectRunDiagnostics(PAGE_NAME, "loadActiveMessages", [
    activeContactId,
    isLoadingConversations,
  ]);

  handleIncomingMessageRef.current = handleIncomingMessage;

  useEffect(() => {
    let mounted = true;

    const unsubscribe = chatHubService.onReceiveMessage((message) => {
      if (mounted) {
        void handleIncomingMessageRef.current(message);
      }
    });

    // chatHubService.connect() is now handled globally by useUnreadMessageCount hook

    return () => {
      mounted = false;
      unsubscribe();
      // chatHubService.disconnect() is handled globally
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    console.log(`[${PAGE_NAME}] Refresh trigger — initial loadConversations`);
    
    void loadConversations().then((mappedContacts) => {
      if (!mounted) return;

      const routeId = searchParams.get("conversationId") ?? locationState?.conversationId;
      const preferredId = routeId ?? mappedContacts[0]?.id ?? null;

      setActiveContactId(preferredId);

      if (preferredId && !routeId) {
        setSearchParams({ conversationId: preferredId }, { replace: true });
      }
    });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadConversations]);

  useEffect(() => {
    const routeId = searchParams.get("conversationId") ?? locationState?.conversationId;
    if (routeId && routeId !== activeContactId) {
      setActiveContactId(routeId);
    }
  }, [searchParams, locationState, activeContactId]);

  useEffect(() => {
    if (!activeContactId) {
      setActiveMessages([]);
      return;
    }

    if (isLoadingConversations) {
      return;
    }

    console.log(
      `[${PAGE_NAME}] Refresh trigger — loadActiveMessages conversationId=${activeContactId}`
    );
    void loadActiveMessages(activeContactId);

    let cancelled = false;

    const markActiveConversationAsRead = async () => {
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === activeContactId
            ? { ...contact, unread: undefined }
            : contact
        )
      );

      try {
        const readCount = await messagingService.markAsRead(activeContactId);
        queryClient.setQueryData<number>(messageKeys.unreadCount(), (old) => {
          console.log("[UnreadBadge] Count before decrement", old);
          const newCount = Math.max(0, (old ?? 0) - readCount);
          console.log("[UnreadBadge] Count after decrement", newCount);
          return newCount;
        });
      } catch (error) {
        console.error(`[${PAGE_NAME}] Failed to mark conversation as read`, error);
      }
    };

    void markActiveConversationAsRead();

    return () => {
      cancelled = true;
    };
  }, [
    activeContactId,
    isLoadingConversations,
    loadActiveMessages,
    loadConversations,
  ]);

  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return contacts;
    }

    return contacts.filter((contact) => {
      return `${contact.name} ${contact.role} ${contact.preview}`
        .toLowerCase()
        .includes(query);
    });
  }, [contacts, searchQuery]);

  const activeContact =
    contacts.find((contact) => contact.id === activeContactId) ?? null;

  const clearPendingAttachment = () => {
    setPendingAttachment(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSendError(null);
    clearPendingAttachment();
    setActiveContactId(conversationId);
    setSearchParams({ conversationId }, { replace: true });
  };

  const handleAttachmentButtonClick = () => {
    if (isUploadingAttachment || isSending) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleAttachmentSelected = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || isUploadingAttachment) {
      return;
    }

    try {
      setIsUploadingAttachment(true);
      setUploadError(null);
      setSendError(null);

      const uploaded = await messagingService.uploadAttachment(file);
      setPendingAttachment(uploaded);
    } catch (error) {
      console.error("Failed to upload attachment", error);
      setUploadError("Unable to upload file. Please try again.");
      setPendingAttachment(null);
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const sendMessage = async () => {
    if (!activeContactId || isSending || isUploadingAttachment) {
      return;
    }

    const text = messageInput.trim();
    const attachmentUrl = pendingAttachment?.fileUrl;

    if (!text && !attachmentUrl) {
      return;
    }

    try {
      setIsSending(true);
      setSendError(null);

      const sent = await messagingService.sendMessage(activeContactId, {
        ...(text ? { content: text } : {}),
        ...(attachmentUrl ? { attachmentUrl } : {}),
      });

      setMessageInput("");
      clearPendingAttachment();

      setActiveMessages((prev) => {
        if (prev.some((item) => item.id === sent.messageId)) {
          return prev;
        }

        return [...prev, mapMessageToChatMessage(sent, currentUserId)];
      });
    } catch (error) {
      console.error("Failed to send message", error);
      setSendError("Unable to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const canSend =
    Boolean(messageInput.trim()) || Boolean(pendingAttachment);

  return (
    <Layout showTopBar={false}>
      <section className="h-[calc(100dvh-2rem)] md:h-[calc(100dvh-3rem)] lg:h-[calc(100dvh-4rem)] min-h-[640px] overflow-hidden rounded-3xl border border-[#DEE2EC] bg-[#F7F8FC] shadow-[0_10px_30px_rgba(27,35,56,0.05)]">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[340px_1fr]">
          <aside className="flex h-full flex-col border-r border-[#E2E5EE] bg-white">
            <div className="border-b border-[#E2E5EE] px-5 py-5">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-3xl font-bold leading-none text-[#222A3A]">Messages</h1>
              </div>

              <div className="flex items-center rounded-xl border border-[#DEE2EC] bg-[#FBFCFF] px-3 py-2.5">
                <Search size={16} className="text-[#9DA5B9]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search members"
                  className="w-full bg-transparent px-2 text-sm text-[#31384B] outline-none placeholder:text-[#A7AEC1]"
                />
              </div>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto p-3">
              {isLoadingConversations ? (
                <p className="px-3 py-2 text-sm text-[#6F768B]">Loading conversations...</p>
              ) : loadError ? (
                <p className="px-3 py-2 text-sm text-[#B33A3A]">{loadError}</p>
              ) : filteredContacts.length === 0 ? (
                <p className="px-3 py-2 text-sm text-[#6F768B]">No conversations yet.</p>
              ) : (
                filteredContacts.map((contact) => {
                  const isActive = contact.id === activeContactId;
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => handleSelectConversation(contact.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                        isActive ? "bg-[#EEF0F8]" : "hover:bg-[#F2F4FA]"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="h-11 w-11 rounded-full object-cover"
                          onError={(event) => {
                            const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}`;
                            if (event.currentTarget.src !== fallback) {
                              event.currentTarget.src = fallback;
                            }
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center justify-between gap-2">
                          <p className="truncate text-lg font-semibold text-[#222A3B]">
                            {contact.name}
                          </p>
                          <span className="shrink-0 text-xs font-semibold text-[#828AA0]">
                            {contact.time}
                          </span>
                        </div>
                        <p className="truncate text-sm text-[#6F768B]">{contact.preview}</p>
                      </div>

                      {contact.unread ? (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white">
                          {contact.unread}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="flex min-w-0 min-h-0 flex-col">
            {activeContact ? (
              <>
                <header className="flex items-center border-b border-[#E2E5EE] bg-[#F8F9FD] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeContact.avatar}
                      alt={activeContact.name}
                      className="h-11 w-11 rounded-full object-cover"
                      onError={(event) => {
                        const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeContact.name)}`;
                        if (event.currentTarget.src !== fallback) {
                          event.currentTarget.src = fallback;
                        }
                      }}
                    />
                    <div>
                      <button
                        type="button"
                        onClick={() => navigate(`/profile/${activeContact.otherUserId}`)}
                        className="text-left text-2xl font-bold leading-none text-[#222A3B] hover:text-primary transition"
                      >
                        {activeContact.name}
                      </button>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#7E869C]">
                        {activeContact.role}
                      </p>
                    </div>
                  </div>
                </header>

                <div
  ref={messagesContainerRef}
  className="
    flex-1
    space-y-4
    overflow-y-auto
    px-6 py-7
  "
>
                  {isLoadingMessages ? (
                    <p className="text-center text-sm text-[#878EA2]">Loading messages...</p>
                  ) : activeMessages.length === 0 ? (
                    <p className="text-center text-sm text-[#878EA2]">
                      No messages yet. Say hello to start the conversation.
                    </p>
                  ) : (
                    activeMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[74%] ${message.sender === "me" ? "items-end" : "items-start"} flex flex-col gap-1`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                              message.sender === "me"
                                ? "bg-primary text-white"
                                : "bg-white text-[#2F3749]"
                            }`}
                          >                            {message.text ? (
                              <p className={message.attachment ? "mb-2" : ""}>
                                {message.text}
                              </p>
                            ) : null}
                            {message.attachment ? (
                              <MessageAttachmentContent
                                attachment={message.attachment}
                                isOwnMessage={message.sender === "me"}
                              />
                            ) : null}
                            {!message.text && !message.attachment ? (
                              <p>[Empty message]</p>
                            ) : null}
                          </div>
                          <span className="text-xs text-[#8890A5]">{message.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <footer className="border-t border-[#E2E5EE] bg-[#F8F9FD] p-5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={CHAT_ATTACHMENT_ACCEPT}
                    className="hidden"
                    onChange={(event) => void handleAttachmentSelected(event)}
                  />
                  {uploadError ? (
                    <p className="mb-3 text-sm text-[#B33A3A]">{uploadError}</p>
                  ) : null}
                  {sendError ? (
                    <p className="mb-3 text-sm text-[#B33A3A]">{sendError}</p>
                  ) : null}
                  {pendingAttachment ? (
                    <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#DEE2EC] bg-white px-3 py-2 text-sm text-[#3B455B]">
                      <Paperclip size={14} className="shrink-0 text-[#7A8298]" />
                      <span className="min-w-0 flex-1 truncate">
                        {pendingAttachment.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={clearPendingAttachment}
                        disabled={isSending || isUploadingAttachment}
                        className="text-[#7A8298] transition hover:text-[#5B647A] disabled:opacity-50"
                        aria-label="Remove attachment"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-3 rounded-2xl border border-[#DEE2EC] bg-white px-4 py-2.5">
                    <button
                      type="button"
                      onClick={handleAttachmentButtonClick}
                      disabled={isSending || isUploadingAttachment}
                      className="text-[#7A8298] transition hover:text-[#5B647A] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Attach file"
                    >
                      <Paperclip size={19} />
                    </button>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(event) => setMessageInput(event.target.value)}
                      disabled={isSending || isUploadingAttachment}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void sendMessage();
                        }
                      }}
                      placeholder={
                        isUploadingAttachment
                          ? "Uploading attachment..."
                          : "Message your mentor..."
                      }
                      className="flex-1 bg-transparent text-sm text-[#2A3346] outline-none placeholder:text-[#9CA4B8]"
                    />
                    <button type="button" className="text-[#7A8298] transition hover:text-[#5B647A]">
                      <Smile size={19} />
                    </button>
                    <button
                      type="button"
                      disabled={isSending || isUploadingAttachment || !canSend}
                      onClick={() => void sendMessage()}
                      className="rounded-xl bg-primary p-2.5 text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <SendHorizontal size={17} />
                    </button>
                  </div>
                </footer>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
                  <SendHorizontal size={32} className="text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-[#242C3D]">Start new message</h2>
                <p className="mt-3 max-w-md text-base leading-relaxed text-[#747C92]">
                  Select a contact from the list to start chatting, or open a conversation from the classroom.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </Layout>
  );
};

export default MessagesPage;
