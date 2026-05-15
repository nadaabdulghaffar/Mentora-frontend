import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  Paperclip,
  Search,
  SendHorizontal,
  Smile,
  SquarePen,
} from "lucide-react";
import Layout from "../shared/components/Layout";

type Contact = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  preview: string;
  time: string;
  online: boolean;
  unread?: number;
};

type ChatMessage = {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
};

const contacts: Contact[] = [
  {
    id: "sarah",
    name: "Sarah Jenkins",
    role: "Senior UX Mentor",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    preview: "Can we review the UX flow?",
    time: "12:45 PM",
    online: true,
    unread: 2,
  },
  {
    id: "marcus",
    name: "Marcus Reed",
    role: "Product Mentor",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    preview: "Thanks for the feedback on the design system.",
    time: "Yesterday",
    online: true,
  },
  {
    id: "elena",
    name: "Elena Rodriguez",
    role: "Design Lead",
    avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=120&q=80",
    preview: "Session notes are now uploaded.",
    time: "Oct 24",
    online: false,
  },
  {
    id: "david",
    name: "David Chen",
    role: "Frontend Mentor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    preview: "See you on Friday!",
    time: "Oct 22",
    online: true,
  },
];

const conversationByContact: Record<string, ChatMessage[]> = {
  sarah: [
    {
      id: "m1",
      sender: "them",
      text: "Hi there! I've had a look at the latest wireframes you shared. The user flow for the checkout process is much smoother now.",
      time: "12:40 PM",
    },
    {
      id: "m2",
      sender: "me",
      text: "That's great to hear! I was worried about the friction in the address input stage. Did you find the progressive disclosure approach helpful there?",
      time: "12:42 PM",
    },
    {
      id: "m3",
      sender: "them",
      text: "Yes, it simplifies the initial view significantly. Can we review the mobile flow during our next call?",
      time: "12:45 PM",
    },
  ],
  marcus: [
    {
      id: "m4",
      sender: "them",
      text: "I pushed updates to the component library and documented variants.",
      time: "Yesterday",
    },
  ],
  elena: [
    {
      id: "m5",
      sender: "them",
      text: "I left comments on your portfolio case study.",
      time: "Oct 24",
    },
  ],
  david: [
    {
      id: "m6",
      sender: "them",
      text: "Let's pair on the dashboard refactor next session.",
      time: "Oct 22",
    },
  ],
};

const MessagesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeContactId, setActiveContactId] = useState<string | null>("sarah");
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>(conversationByContact);
  const [messageInput, setMessageInput] = useState("");

  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return contacts;
    }

    return contacts.filter((contact) => {
      return `${contact.name} ${contact.role} ${contact.preview}`.toLowerCase().includes(query);
    });
  }, [searchQuery]);

  const activeContact = contacts.find((contact) => contact.id === activeContactId) ?? null;
  const activeConversation = activeContact ? conversations[activeContact.id] ?? [] : [];

  const sendMessage = () => {
    if (!activeContact) {
      return;
    }

    const text = messageInput.trim();
    if (!text) {
      return;
    }

    const now = new Date();
    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "me",
      text,
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setConversations((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] ?? []), newMessage],
    }));
    setMessageInput("");
  };

  return (
    <Layout showTopBar={false}>
      <section className="h-[calc(100dvh-2rem)] md:h-[calc(100dvh-3rem)] lg:h-[calc(100dvh-4rem)] min-h-[640px] overflow-hidden rounded-3xl border border-[#DEE2EC] bg-[#F7F8FC] shadow-[0_10px_30px_rgba(27,35,56,0.05)]">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[340px_1fr]">
          <aside className="flex h-full flex-col border-r border-[#E2E5EE] bg-white">
            <div className="border-b border-[#E2E5EE] px-5 py-5">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-3xl font-bold leading-none text-[#222A3A]">Messages</h1>
                <div className="flex items-center gap-1 text-[#788097]">
                
                </div>
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
              {filteredContacts.map((contact) => {
                const isActive = contact.id === activeContactId;
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setActiveContactId(contact.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      isActive ? "bg-[#EEF0F8]" : "hover:bg-[#F2F4FA]"
                    }`}
                  >
                    <div className="relative">
                      <img src={contact.avatar} alt={contact.name} className="h-11 w-11 rounded-full object-cover" />
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          contact.online ? "bg-[#20C19F]" : "bg-[#C7CDDC]"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center justify-between gap-2">
                        <p className="truncate text-lg font-semibold text-[#222A3B]">{contact.name}</p>
                        <span className="shrink-0 text-xs font-semibold text-[#828AA0]">{contact.time}</span>
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
              })}
            </div>
          </aside>

          <section className="flex min-w-0 flex-col">
            {activeContact ? (
              <>
                <header className="flex items-center border-b border-[#E2E5EE] bg-[#F8F9FD] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={activeContact.avatar} alt={activeContact.name} className="h-11 w-11 rounded-full object-cover" />
                    <div>
                      <p className="text-2xl font-bold leading-none text-[#222A3B]">{activeContact.name}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#7E869C]">{activeContact.role}</p>
                    </div>
                  </div>
                </header>

                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-7">
                  <p className="text-center text-xs font-bold tracking-[0.16em] text-[#878EA2]">TODAY</p>

                  {activeConversation.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[74%] ${message.sender === "me" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div
                          className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                            message.sender === "me" ? "bg-primary text-white" : "bg-white text-[#2F3749]"
                          }`}
                        >
                          {message.text}
                        </div>
                        <span className="text-xs text-[#8890A5]">{message.time}</span>
                      </div>
                    </div>
                  ))}

                  <p className="text-sm font-medium text-[#8A92A8]">Sarah is typing...</p>
                </div>

                <footer className="border-t border-[#E2E5EE] bg-[#F8F9FD] p-5">
                  <div className="flex items-center gap-3 rounded-2xl border border-[#DEE2EC] bg-white px-4 py-2.5">
                    <button type="button" className="text-[#7A8298] transition hover:text-[#5B647A]">
                      <Paperclip size={19} />
                    </button>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(event) => setMessageInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Message your mentor..."
                      className="flex-1 bg-transparent text-sm text-[#2A3346] outline-none placeholder:text-[#9CA4B8]"
                    />
                    <button type="button" className="text-[#7A8298] transition hover:text-[#5B647A]">
                      <Smile size={19} />
                    </button>
                    <button
                      type="button"
                      onClick={sendMessage}
                      className="rounded-xl bg-primary p-2.5 text-white transition hover:bg-primary-dark"
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
                  Select a contact from the list to start chatting, or search for a member and send your first message.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveContactId("sarah")}
                  className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  Write message
                </button>
              </div>
            )}
          </section>
        </div>
      </section>
    </Layout>
  );
};

export default MessagesPage;
