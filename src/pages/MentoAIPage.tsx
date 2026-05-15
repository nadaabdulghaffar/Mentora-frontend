import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCheck, Send } from "lucide-react";
import mentoRobot from "../assets/images/Gemini_Generated_Image_oov0p2oov0p2oov0 1.png";
import Layout from "../shared/components/Layout";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  time: string;
};

const QUICK_PROMPTS: { label: string; className: string }[] = [
  { label: "How to use Mentora", className: "bg-[#FFF9DB] text-gray-800" },
  { label: "Recommend Mentorship program", className: "bg-[#E8F5E9] text-gray-800" },
  { label: "Recommend Mentor", className: "bg-[#FFE8D6] text-gray-800" },
  { label: "ٌRecommend materials", className: "bg-[#FCE4EC] text-gray-800" },
  { label: "Explain a topic", className: "bg-[#E0F7FA] text-gray-800" },
];

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
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
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const pushAssistant = useCallback(
    (text: string) => {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", text, time: formatTime(new Date()) },
      ]);
      setPending(false);
    },
    []
  );

  const sendText = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || pending) return;

      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", text, time: formatTime(new Date()) },
      ]);
      setInput("");
      setPending(true);

      window.setTimeout(() => {
        pushAssistant(
          "I can walk you through Mentora, suggest programs or mentors, outline a roadmap, or explain a topic. Tell me what you want to focus on next."
        );
      }, 700);
    },
    [pending, pushAssistant]
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendText(input);
  };

  const showWelcome = messages.length === 0;

  return (
    <Layout showTopBar={false}>
      <div className="flex h-[calc(100dvh-4.5rem)] w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:h-[calc(100dvh-5rem)] lg:h-[calc(100dvh-5.5rem)]">
        <header className="shrink-0 flex items-center gap-3 border-b border-gray-200 px-5 py-4">
          <MentoAvatar />
          <div>
            <h1 className="text-lg font-bold text-[#2E2A47]">Mento AI</h1>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Your AI assistant
            </p>
          </div>
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
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    disabled={pending}
                    onClick={() => sendText(p.label)}
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
              <div className="flex flex-col gap-6">
                {messages.map((m) =>
                  m.role === "user" ? (
                    <div key={m.id} className="flex flex-col items-end gap-1">
                      <div
                        className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed text-white shadow-sm"
                        style={{ backgroundColor: "#5B5091" }}
                      >
                        {m.text}
                      </div>
                      <div className="flex items-center gap-1.5 pr-1 text-xs text-gray-400">
                        <span>{m.time}</span>
                        <CheckCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="flex gap-3">
                      <MentoAvatar />
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                        <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-800 shadow-sm">
                          {m.text}
                        </div>
                        <span className="pl-1 text-xs text-gray-400">{m.time}</span>
                      </div>
                    </div>
                  )
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
              className="w-full rounded-full border border-gray-200 bg-white py-3.5 pl-5 pr-14 text-sm text-gray-800 shadow-inner outline-none ring-primary/30 placeholder:text-gray-400 focus:ring-2 disabled:bg-gray-50"
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
