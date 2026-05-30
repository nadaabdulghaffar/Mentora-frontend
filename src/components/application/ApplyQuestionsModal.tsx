import QuestionRenderer from "./QuestionRenderer";

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

  if (!open) return null;

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
                key={
                  question.programQuestionId
                }
                className="space-y-4"
              >

                <label className="block text-[15px] font-semibold text-[#1F2432]">

                  {index + 1}.{" "}
                  {question.questionText}

                </label>

                <QuestionRenderer
                  question={question}
                  value={
                    answers[
                      question.programQuestionId
                    ] || ""
                  }
                  onChange={(value) =>
                    setAnswers({
                      ...answers,

                      [
                        question.programQuestionId
                      ]: value,
                    })
                  }
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
            onClick={onSubmit}
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