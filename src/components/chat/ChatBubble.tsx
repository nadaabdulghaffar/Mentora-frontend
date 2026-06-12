import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { CheckCheck } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  text: string;
  time: string;
  isMarkdown?: boolean;
}

export const ChatBubble = memo(function ChatBubble({ role, text, time, isMarkdown = false }: ChatBubbleProps) {
  if (role === 'user') {
    return (
      <div className="flex flex-col items-end gap-1">
        <div
          dir="auto"
          className="whitespace-pre-wrap max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 text-base leading-relaxed text-white shadow-sm"
          style={{ backgroundColor: '#5B5091' }}
        >
          {text}
        </div>
        <div className="flex items-center gap-1.5 pr-1 text-xs text-gray-400">
          <span>{time}</span>
          <CheckCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
        </div>
      </div>
    );
  }

  const processedText = isMarkdown ? text.replace(/(^|\n)\s*[•]\s+/g, '$1- ') : text;

  return (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
      <div dir="auto" className="whitespace-pre-wrap max-w-[85%] w-fit rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-base leading-relaxed text-gray-800 shadow-sm">
        {isMarkdown ? (
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium" />
              ),
              p: ({ node, ...props }) => <p dir="auto" className="mb-2 last:mb-0" {...props} />,
              ul: ({ node, ...props }) => <ul dir="auto" className="list-disc mb-2 last:mb-0 space-y-1" style={{ paddingInlineStart: '1.25rem' }} {...props} />,
              ol: ({ node, ...props }) => <ol dir="auto" className="list-decimal mb-2 last:mb-0 space-y-1" style={{ paddingInlineStart: '1.25rem' }} {...props} />,
              li: ({ node, ...props }) => <li dir="auto" className="" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
              h1: ({ node, ...props }) => <h1 dir="auto" className="text-xl font-bold mb-2 mt-4 first:mt-0" {...props} />,
              h2: ({ node, ...props }) => <h2 dir="auto" className="text-lg font-bold mb-2 mt-4 first:mt-0" {...props} />,
              h3: ({ node, ...props }) => <h3 dir="auto" className="text-base font-bold mb-2 mt-3 first:mt-0" {...props} />,
            }}
          >
            {processedText}
          </ReactMarkdown>
        ) : (
          processedText
        )}
      </div>
      <span className="pl-1 text-xs text-gray-400">{time}</span>
    </div>
  );
});
