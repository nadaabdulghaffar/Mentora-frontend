import QuestionRenderer from "./QuestionRenderer";
import { useEffect, useState } from "react";

interface ApplyQuestionsModalProps {
  open: boolean;

  onClose: () => void;

  questions: any[];

  answers: Record<number, string>;

  setAnswers: React.Dispatch<
    React.SetStateAction<
      Record<number, string>
    >
  >;

  onSubmit: () => void;

  submitting: boolean;
}

const ApplyQuestionsModal = ({
  open,
  onClose,
  questions,
  answers,
  setAnswers,
  onSubmit,
  submitting,
}: ApplyQuestionsModalProps) => {

  const [errors, setErrors] = useState<Record<number, string>>({});
  const [focusQuestionId, setFocusQuestionId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setErrors({});
      setFocusQuestionId(null);
    }
  }, [open]);

  // when focusQuestionId is set, scroll it into view and show a toast
  useEffect(() => {
    if (!focusQuestionId) return;

    try {
      const el = document.getElementById(`question-${focusQuestionId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {}

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const toast = require("react-hot-toast").toast;
      toast.error("Please answer the highlighted required question(s).");
    } catch {}
  }, [focusQuestionId]);

  if (!open) return null;

  const validateAnswers = () => {
    console.log("validateAnswers: questions count", questions.length, "answers", answers);
    const nextErrors: Record<number, string> = {};
    let firstInvalid: number | null = null;
    
    questions.forEach((question) => {
      console.log("question", question.programQuestionId, question.answerType);
      const id = question.programQuestionId;
      const raw = answers[id] || "";
      const val = String(raw).trim();
      console.log("answer for", id, "->", val);

      switch (question.answerType) {
        case "Text":
          if (!val) nextErrors[id] = "This question is required";
          break;
        case "SingleChoice":
          if (!val) nextErrors[id] = "Please choose an option";
          break;
        case "MultipleChoice":
          if (!val) nextErrors[id] = "Please select at least one option";
          break;
        default:
          if (!val) nextErrors[id] = "This question is required";
      }

      if (!firstInvalid && nextErrors[id]) {
        firstInvalid = id;
      }
    });

    setErrors(nextErrors);
    setFocusQuestionId(firstInvalid ?? null);

    return Object.keys(nextErrors).length === 0;
  };

  const handleLocalSubmit = () => {
    console.log("handleLocalSubmit called", { submitting });
    // prevent double submit while parent submitting
    if (submitting) return;
    console.log("running validateAnswers");
    const ok = validateAnswers();
    console.log("validate result", ok);
    if (!ok) return;

    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">

      <div className="bg-white w-full max-w-2xl rounded-[28px] p-6 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#64748B] text-2xl"
        >
          ×
        </button>

        {/* TITLE */}
        <h2 className="text-2xl font-bold text-[#1F2432] mb-2">
          Application Questions
        </h2>

        <p className="text-[#64748B] mb-8">
          Answer the following questions
          to apply for this mentorship
          program.
        </p>

        {/* QUESTIONS */}
        <div className="space-y-8">

          {questions.map(
            (question, index) => (

              <div
                key={question.programQuestionId}
                id={`question-${question.programQuestionId}`}
                className="space-y-4"
              >

                <label className="block text-[15px] font-semibold text-[#1F2432]">

                  {index + 1}.{" "}
                  {question.questionText}

                </label>

                <QuestionRenderer
                  question={question}
                  value={answers[question.programQuestionId] || ""}
                  error={errors[question.programQuestionId]}
                  autoFocus={focusQuestionId === question.programQuestionId}
                  onChange={(value) => {
                    setAnswers({
                      ...answers,
                      [question.programQuestionId]: value,
                    });
                    // clear error for this question on change
                    setErrors((prev) => {
                      if (!prev || !prev[question.programQuestionId]) return prev;
                      const copy = { ...prev };
                      delete copy[question.programQuestionId];
                      return copy;
                    });
                    if (focusQuestionId === question.programQuestionId) {
                      setFocusQuestionId(null);
                    }
                  }}
                />

              </div>
            )
          )}

        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 mt-10">

          <button
            onClick={onClose}
            className="
              px-6 py-3 rounded-2xl
              border border-[#D0D5DD]
              text-[#344054]
              hover:bg-gray-50
              transition
            "
          >
            Cancel
          </button>

          <button
            onClick={handleLocalSubmit}
            disabled={submitting}
            className="
              px-8 py-3 rounded-2xl
              bg-[#6D5DD3]
              text-white font-medium
              hover:opacity-90
              transition
              disabled:opacity-60
            "
          >
            {submitting
              ? "Submitting..."
              : "Submit Application"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default ApplyQuestionsModal;