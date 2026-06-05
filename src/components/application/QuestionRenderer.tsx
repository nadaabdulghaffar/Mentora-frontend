import { useEffect, useRef } from "react";

interface QuestionRendererProps {
  question: any;

  value: string;

  onChange: (value: string) => void;

  // optional validation error message to display
  error?: string;

  // if true, focus the input when mounted/updated
  autoFocus?: boolean;
}

const QuestionRenderer = ({
  question,
  value,
  onChange,
  error,
  autoFocus,
}: QuestionRendererProps) => {

  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      try { (inputRef.current as HTMLElement).focus(); } catch { }
    }
  }, [autoFocus]);

  switch (question.answerType) {

    // TEXT QUESTION
      case "Text":
      case "Paragraph":
      return (
        <div>
          <textarea
            ref={inputRef as any}
            rows={4}
            placeholder="Write your answer here..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`
              w-full rounded-2xl
              border px-4 py-3 outline-none
              focus:ring-2 focus:ring-[#6D5DD3]
              resize-none
              ${error ? "border-red-500" : "border-[#D0D5DD]"}
            `}
          />
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
      );

    // SINGLE CHOICE
    case "SingleChoice":
    case "TrueFalse":
      return (
        <div>
          <div className="space-y-3">

            {question.options?.map((option: string) => (

              <label
                key={option}
                className="
                  flex items-center gap-3
                  cursor-pointer
                "
              >
                <input
                  ref={inputRef as any}
                  type="radio"
                  name={`question-${question.programQuestionId}`}
                  checked={value === option}
                  onChange={() => onChange(option)}
                />

                <span>{option}</span>

              </label>
            ))}

          </div>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
      );

    // MULTIPLE CHOICE
    case "MultipleChoice":

      const selectedValues =
        value
          ? value.split(",")
          : [];

      return (
        <div>
          <div className="space-y-3">

            {question.options?.map((option: string) => {

              const isSelected = selectedValues.includes(option);

              return (
                <label
                  key={option}
                  className="
                    flex items-center gap-3
                    cursor-pointer
                  "
                >
                  <input
                    ref={inputRef as any}
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {

                      let updated = [...selectedValues];

                      if (e.target.checked) {

                        // respect max selections
                        if (
                          question.maxSelections &&
                          updated.length >= question.maxSelections
                        ) {
                          return;
                        }

                        updated.push(option);

                      } else {

                        updated = updated.filter((x) => x !== option);
                      }

                      onChange(updated.join(","));
                    }}
                  />

                  <span>{option}</span>

                </label>
              );
            })}

          </div>

          {question.maxSelections && (
            <p className="text-xs text-[#64748B]">
              Max selections: {question.maxSelections}
            </p>
          )}

          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
      );

    default:
      return (
        <div>
          <textarea
            ref={inputRef as any}
            rows={4}
            placeholder="Write your answer here..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`
              w-full rounded-2xl
              border px-4 py-3 outline-none
              focus:ring-2 focus:ring-[#6D5DD3]
              resize-none
              ${error ? "border-red-500" : "border-[#D0D5DD]"}
            `}
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
      );
  }
};

export default QuestionRenderer;