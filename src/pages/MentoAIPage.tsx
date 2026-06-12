import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import mentoRobot from "../assets/images/Gemini_Generated_Image_oov0p2oov0p2oov0 1.png";
import Layout from "../shared/components/Layout";
import { authAPI } from "../services/authService";
import {
  sendMenteeChat,
  sendMentorChat,
  type ChatRequestDto,
  type ChatResponseDto,
  type ChatMaterialItem,
  type ChatStatItem,
  type ChatRecommendationItem,
  type ChatProgramRecommendationItem,
  type ChatCommunityRecommendationItem
} from "../services/chatService";

import { ChatBubble } from "../components/chat/ChatBubble";
import { ChatMaterialsWidget } from "../components/chat/ChatMaterialsWidget";
import { ChatStatsWidget } from "../components/chat/ChatStatsWidget";
import { ChatRecommendationsWidget } from "../components/chat/ChatRecommendationsWidget";
import { ChatMyProgramsWidget, type MyProgramItem } from "../components/chat/ChatMyProgramsWidget";
import { MENTEE_CHAT_CHIPS, MENTOR_CHAT_CHIPS } from "../constants/chatbotPrompts";
import { getMyPublishedPrograms } from "../services/programService";
import { classroomService } from "../services/classroomService";

const MAX_HISTORY_MESSAGES = 10;

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  time: string;
  responseType?: 'text' | 'materials' | 'recommendation' | 'roadmap' | 'my_programs';
  materials?: ChatMaterialItem[];
  stats?: ChatStatItem[];
  mentors?: ChatRecommendationItem[];
  programs?: ChatProgramRecommendationItem[];
  communities?: ChatCommunityRecommendationItem[];
  myPrograms?: MyProgramItem[];
};

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function detectLanguage(text: string): "ar" | "en" {
  // Simple Arabic character detection
  return /[\u0600-\u06FF]/.test(text) ? "ar" : "en";
}

const MentoAvatar = ({ size = "sm" }: { size?: "sm" | "lg" }) => {
  const isLg = size === "lg";
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#A8E6CF] ${
        isLg ? "h-28 w-28 md:h-36 md:w-36" : "h-10 w-10"
      }`}
      aria-hidden
    >
      <img
        src={mentoRobot}
        alt=""
        className={
          isLg
            ? "h-[85%] w-[85%] object-contain"
            : "h-[78%] w-[78%] object-contain"
        }
      />
    </div>
  );
};

const MentoAIPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const currentUser = authAPI.getCurrentUser();
  const userRole = currentUser?.role?.toLowerCase() || '';
  const isBoth = userRole === 'both';
  const [activeRoleMode, setActiveRoleMode] = useState<'mentee' | 'mentor'>(userRole === 'mentor' ? 'mentor' : 'mentee');

  const location = useLocation();
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const pushAssistantMessage = useCallback((response: ChatResponseDto) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: response.answer || "",
        time: formatTime(new Date()),
        responseType: response.response_type as "text" | "materials" | "recommendation" | "roadmap" | "my_programs" | undefined,
        materials: response.materials,
        stats: response.stats,
        mentors: response.recommendations,
        programs: response.program_recommendations,
        communities: response.community_recommendations,
        myPrograms: (response as any).myPrograms
      },
    ]);
  }, []);

  const pushErrorBubble = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: `err-${Date.now()}`,
        role: "assistant",
        text: "I'm currently experiencing high traffic or offline. Please try again in a moment.",
        time: formatTime(new Date()),
        responseType: "text"
      },
    ]);
  }, []);

  const sendText = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || pending) return;

      // Add user message to UI immediately
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", text, time: formatTime(new Date()) },
      ]);
      setInput("");
      setPending(true);

      try {
        // Trim history for payload based on the messages state PRIOR to adding the new user message
        // This is okay because the new message is passed in the "message" field.
        const historyPayload = messages.slice(-MAX_HISTORY_MESSAGES).map(m => ({
          role: m.role,
          content: m.text
        }));

        const language = detectLanguage(text);

        const dto: ChatRequestDto = {
          message: text,
          language,
          history: historyPayload
        };

        let response: ChatResponseDto;
        if (activeRoleMode === 'mentor') {
          response = await sendMentorChat(dto);
        } else {
          response = await sendMenteeChat(dto);
        }

        // Intercept my_programs intent to fetch and render mentor programs natively in the chat
        if (response.intent === "my_programs" && activeRoleMode === 'mentor') {
          try {
            const programsRes = await getMyPublishedPrograms();
            if (programsRes.success && programsRes.data && programsRes.data.items.length > 0) {
              const mappedPrograms = await Promise.all(
                programsRes.data.items.map(async (p: any) => {
                  const programId = String(p.programId ?? p.ProgramId);
                  let progress = 0;
                  try {
                    const dashboardRes = await classroomService.getClassroomDashboard(Number(programId));
                    if (dashboardRes?.success && dashboardRes.data) {
                      progress = dashboardRes.data.averageRoadmapCompletion || 0;
                    }
                  } catch {}

                  const resolveImageUrl = (url?: string) => url ? (url.startsWith("http") ? url : `${(import.meta.env.VITE_API_URL ?? "http://localhost:5069/api").replace(/\/api\/?$/, "")}${url.startsWith("/") ? url : `/${url}`}`) : undefined;

                  return {
                    id: programId,
                    title: p.title,
                    description: p.description,
                    tag: p.domainName?.toUpperCase?.() ?? "PROGRAM",
                    phases: p.subDomainName ?? p.SubDomainName ?? p.subdomainName ?? "SUB-DOMAIN",
                    subDomainName: p.subDomainName ?? p.SubDomainName ?? p.subdomainName,
                    image: resolveImageUrl(p.programImageUrl),
                    progress,
                  };
                })
              );

              (response as any).response_type = "my_programs";
              (response as any).myPrograms = mappedPrograms;
              response.answer = language === "ar" ? `إليك قائمة برامجك (${mappedPrograms.length}):` : `Here are your programs (${mappedPrograms.length}):`;
            } else {
              response.answer = language === "ar" ? "ليس لديك برامج حتى الآن 📭" : "You don't have any programs yet 📭";
              response.response_type = "text";
            }
          } catch (e) {
            console.error("Failed to fetch native mentor programs:", e);
          }
        }

        pushAssistantMessage(response);
      } catch (err) {
        console.error("Chat API Error:", err);
        pushErrorBubble();
      } finally {
        setPending(false);
      }
    },
    [pending, messages, activeRoleMode, pushAssistantMessage, pushErrorBubble]
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleChipClick = useCallback((promptText: string) => {
    if (isTyping || pending) return;
    setIsTyping(true);
    setInput("");
    let i = 0;
    const interval = setInterval(() => {
      setInput(promptText.slice(0, i + 1));
      i++;
      if (i >= promptText.length) {
        clearInterval(interval);
        setIsTyping(false);
        sendText(promptText);
      }
    }, 15);
  }, [isTyping, pending, sendText]);

  const autoSendExecuted = useRef(false);

  useEffect(() => {
    if (location.state?.autoSendPrompt && !autoSendExecuted.current) {
      autoSendExecuted.current = true;
      const prompt = location.state.autoSendPrompt;
      navigate(location.pathname, { replace: true, state: {} });
      sendText(prompt);
    }
  }, [location.state?.autoSendPrompt, location.pathname, navigate, sendText]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendText(input);
  };

  const showWelcome = messages.length === 0;

  return (
    <Layout showTopBar={false}>
      <div className="flex h-[calc(100dvh-4.5rem)] w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:h-[calc(100dvh-5rem)] lg:h-[calc(100dvh-5.5rem)]">
        <header className="shrink-0 flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <MentoAvatar />
            <div>
              <h1 className="text-lg font-bold text-[#2E2A47]">Mento AI</h1>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Your AI assistant
              </p>
            </div>
          </div>
          {isBoth && (
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setActiveRoleMode('mentee')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  activeRoleMode === 'mentee' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Mentee Mode
              </button>
              <button
                type="button"
                onClick={() => setActiveRoleMode('mentor')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  activeRoleMode === 'mentor' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Mentor Mode
              </button>
            </div>
          )}
        </header>

        <div
          ref={listRef}
          className={`flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#F7F8FA] px-4 py-6 md:px-6 ${
            showWelcome ? "items-stretch" : ""
          }`}
        >
          {showWelcome ? (
            <div className="flex flex-1 flex-col justify-center gap-8 py-2 md:py-4">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-center md:gap-10">
                <div className="relative">
                  <MentoAvatar size="lg" />
                  <span
                    className="absolute bottom-3 right-3 h-4 w-4 rounded-full bg-pink-300 ring-2 ring-white"
                    aria-hidden
                  />
                </div>
                <div className="max-w-md text-center md:text-left">
                  <p className="text-2xl font-bold text-primary md:text-3xl">Hi there!</p>
                  <p className="mt-2 text-base font-medium text-gray-600 md:text-lg">
                    Tell me what you need and I&apos;ll handle the rest
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {(activeRoleMode === 'mentor' ? MENTOR_CHAT_CHIPS : MENTEE_CHAT_CHIPS).map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    disabled={pending || isTyping}
                    onClick={() => handleChipClick(p.label)}
                    className={`rounded-full px-4 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 disabled:opacity-50 ${p.className}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Today
              </p>
              <div className="flex flex-col gap-6 min-w-0">
                {messages.map((m) => (
                  <div key={m.id} className="flex flex-col w-full min-w-0 gap-1">
                    <ChatBubble role={m.role} text={m.text} time={m.time} isMarkdown={m.role === 'assistant'} />
                    {m.role === 'assistant' && m.stats && m.stats.length > 0 && (
                      <ChatStatsWidget stats={m.stats} />
                    )}
                    {m.role === 'assistant' && m.materials && m.materials.length > 0 && (
                      <ChatMaterialsWidget materials={m.materials} />
                    )}
                    {m.role === 'assistant' && (m.mentors || m.programs || m.communities) && m.responseType !== "my_programs" && (
                      <ChatRecommendationsWidget 
                        mentors={m.mentors} 
                        programs={m.programs} 
                        communities={m.communities} 
                      />
                    )}
                    {m.role === 'assistant' && m.responseType === "my_programs" && m.myPrograms && (
                      <ChatMyProgramsWidget
                        programs={m.myPrograms}
                        isMentor={true}
                      />
                    )}
                  </div>
                ))}
                
                {pending && (
                  <div className="flex gap-3">
                    <MentoAvatar />
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-4 shadow-sm h-[46px]">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <footer className="shrink-0 border-t border-gray-200 bg-[#EEEFF2] p-4">
          <form onSubmit={onSubmit} className="relative w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How can I help you today?"
              disabled={pending}
              className="w-full rounded-full border border-gray-200 bg-white py-3.5 pl-5 pr-14 text-base text-gray-800 shadow-inner outline-none ring-primary/30 placeholder:text-gray-400 focus:ring-2 disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-md transition hover:bg-primary-dark disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </footer>
      </div>
    </Layout>
  );
};

export default MentoAIPage;
