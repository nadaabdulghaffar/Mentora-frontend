interface QuestionRendererProps {
  question: any;

  value: string;

  onChange: (value: string) => void;
}

const QuestionRenderer = ({
  question,
  value,
  onChange,
}: QuestionRendererProps) => {

  switch (question.answerType) {

    // TEXT QUESTION
    case "Text":
      return (
        <textarea
          rows={4}
          placeholder="Write your answer here..."
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="
            w-full rounded-2xl
            border border-[#D0D5DD]
            px-4 py-3 outline-none
            focus:ring-2 focus:ring-[#6D5DD3]
            resize-none
          "
        />
      );

    // SINGLE CHOICE
    case "SingleChoice":
      return (
        <div className="space-y-3">

          {question.options?.map(
            (option: string) => (

              <label
                key={option}
                className="
                  flex items-center gap-3
                  cursor-pointer
                "
              >
                <input
                  type="radio"
                  name={`question-${question.programQuestionId}`}
                  checked={value === option}
                  onChange={() =>
                    onChange(option)
                  }
                />

                <span>
                  {option}
                </span>

              </label>
            )
          )}

        </div>
      );

    // MULTIPLE CHOICE
    case "MultipleChoice":

      const selectedValues =
        value
          ? value.split(",")
          : [];

      return (
        <div className="space-y-3">

          {question.options?.map(
            (option: string) => {

              const isSelected =
                selectedValues.includes(option);

              return (
                <label
                  key={option}
                  className="
                    flex items-center gap-3
                    cursor-pointer
                  "
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {

                      let updated =
                        [...selectedValues];

                      if (e.target.checked) {

                        // respect max selections
                        if (
                          question.maxSelections &&
                          updated.length >=
                          question.maxSelections
                        ) {
                          return;
                        }

                        updated.push(option);

                      } else {

                        updated =
                          updated.filter(
                            (x) =>
                              x !== option
                          );
                      }

                      onChange(
                        updated.join(",")
                      );
                    }}
                  />

                  <span>
                    {option}
                  </span>

                </label>
              );
            }
          )}

          {question.maxSelections && (
            <p className="text-xs text-[#64748B]">
              Max selections:
              {" "}
              {question.maxSelections}
            </p>
          )}

        </div>
      );

    default:
      return (
        <textarea
          rows={4}
          placeholder="Write your answer here..."
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="
            w-full rounded-2xl
            border border-[#D0D5DD]
            px-4 py-3 outline-none
          "
        />
      );
  }
};

export default QuestionRenderer;