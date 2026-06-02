import { PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFormikContext, getIn } from "formik";

import type { CreateProgramFormData } from "./types";
import {
  fetchRoadmapBasicOptions,
  type RoadmapBasicOption,
} from "../../services/programService";

const answerHintStyle =
  "mt-1 text-xs text-[#64748B] leading-snug";

export default function ProgramQuestionsStep({ isEditMode = false }: { isEditMode?: boolean }) {
  const { values, setFieldValue, errors } = useFormikContext<CreateProgramFormData>();

  const subDomainId = values.subDomainId;

  const [roadmapOptions, setRoadmapOptions] = useState<RoadmapBasicOption[]>([]);
  const [roadmapsLoading, setRoadmapsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setRoadmapsLoading(true);
      try {
        const list = await fetchRoadmapBasicOptions();
        if (!cancelled) setRoadmapOptions(list);
      } catch {
        if (!cancelled) setRoadmapOptions([]);
      } finally {
        if (!cancelled) setRoadmapsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const roadmapsForSubdomain = useMemo(() => {
    if (!subDomainId || subDomainId < 1) return [];
    return roadmapOptions.filter((r) => r.subDomainId === subDomainId);
  }, [roadmapOptions, subDomainId]);

  const roadmapId = values.roadmapId;

  useEffect(() => {
    if (roadmapId == null) return;
    const stillValid = roadmapsForSubdomain.some((r) => r.roadmapId === roadmapId);
    if (!stillValid) setFieldValue("roadmapId", null);
  }, [roadmapsForSubdomain, roadmapId, setFieldValue]);

  const questions = values.questions ?? [];

  const addQuestion = () => {
    setFieldValue("questions", [
      ...questions,
      { programQuestionId: 0, questionText: "", answerType: "Paragraph", maxSelections: null, options: [] },
    ]);
  };

  return (
    <div className="space-y-5">
      {/* Roadmap */}
      <div className="rounded-2xl border border-[#E6E8F0] bg-[#FAFAFE] p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h3 className="text-base md:text-lg font-semibold text-primary">
            Learning Roadmap (Optional)
          </h3>

          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline text-left"
          >
            + Create New Roadmap
          </button>
        </div>

        {roadmapsLoading && (
          <p className="text-xs text-[#64748B] mb-2">
            Loading roadmaps…
          </p>
        )}

        {!roadmapsLoading &&
          subDomainId > 0 &&
          roadmapsForSubdomain.length ===
            0 && (
            <p className="text-xs text-[#64748B] mb-2">
              No published roadmaps match this sub-domain, or none are
              available. The program will be created without a linked roadmap.
            </p>
          )}

        <select
          value={roadmapId ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            setFieldValue("roadmapId", v ? Number(v) : null);
          }}
          className="w-full h-12 rounded-xl border border-[#D8DBE4] px-4 text-sm outline-none focus:border-primary"
        >
          <option value="">No Roadmap</option>
          {roadmapsForSubdomain.map((r) => (
            <option key={r.roadmapId} value={r.roadmapId}>
              {r.title}
            </option>
          ))}
        </select>
      </div>

      {/* Questions */}
      <div className="rounded-2xl border border-[#E6E8F0] bg-[#FBFBFD] p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-primary">
            Application Questions {isEditMode && "(Read-only)"}
          </h3>

          <button
            type="button"
            onClick={addQuestion}
            disabled={isEditMode}
            className={`flex items-center gap-2 text-primary font-medium hover:underline ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <PlusCircle size={18} />
            Add Question
          </button>
        </div>

        {isEditMode && questions.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            ⚠️ Questions cannot be edited after creation. To change questions, you can create a new program with the questions you need.
          </div>
        )}

        <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
          Question types match the server: free text (
          <span className="font-medium">Paragraph</span>
          ),{" "}
          <span className="font-medium">MultipleChoice</span> (needs answer
          options), or{" "}
          <span className="font-medium">TrueFalse</span> (yes/no).
        </p>

        {questions.length === 0 ? (
          <div className="text-center py-8 text-[#94A0B8] text-sm">
            No questions added yet.
            <br />
            Applicants can apply
            without answering custom
            questions.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => {
              const answerType = questions?.[index]?.answerType;
              const qErrors = getIn(errors, `questions.${index}`) as any;

              return (
                <div key={index} className="rounded-2xl border border-[#E6E8F0] bg-white p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold tracking-[0.15em] text-[#95A0B8] uppercase">Question {index + 1}</h4>

                    <button
                      type="button"
                      onClick={() => setFieldValue("questions", questions.filter((_, i) => i !== index))}
                      disabled={isEditMode}
                      className={`text-red-500 hover:text-red-600 ${isEditMode ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slateInk mb-2">Question text</label>

                      <input
                        id={`questions.${index}.questionText`}
                        value={questions?.[index]?.questionText ?? ""}
                        onChange={(e) => {
                          if (isEditMode) return;
                          const newQs = [...questions];
                          newQs[index] = { ...newQs[index], questionText: e.target.value };
                          setFieldValue("questions", newQs);
                        }}
                        placeholder="Why do you want to join this program?"
                        disabled={isEditMode}
                        className={`w-full h-12 rounded-xl border border-[#D8DBE4] px-4 text-sm outline-none focus:border-primary ${isEditMode ? 'bg-gray-100 text-gray-600' : ''}`}
                      />
                      {qErrors?.questionText && <p className="mt-1 text-xs text-red-500">{String(qErrors.questionText)}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slateInk mb-2">Answer type</label>

                      <select
                        value={questions?.[index]?.answerType ?? "Paragraph"}
                        onChange={(e) => {
                          if (isEditMode) return;
                          const newQs = [...questions];
                          newQs[index] = { ...newQs[index], answerType: e.target.value };
                          setFieldValue("questions", newQs);
                        }}
                        disabled={isEditMode}
                        className={`w-full h-12 rounded-xl border border-[#D8DBE4] px-4 text-sm outline-none focus:border-primary ${isEditMode ? 'bg-gray-100 text-gray-600' : ''}`}
                      >
                        <option value="Paragraph">Paragraph — free text</option>
                        <option value="MultipleChoice">Multiple choice (MCQ)</option>
                        <option value="TrueFalse">Yes / No (true or false)</option>
                      </select>

                      <p className={answerHintStyle}>
                        {answerType === "Paragraph" && "Open-ended responses."}
                        {answerType === "MultipleChoice" && "You must add at least one option before publishing."}
                        {answerType === "TrueFalse" && "Applicant picks yes or no."}
                      </p>
                      {qErrors?.answerType && <p className="mt-1 text-xs text-red-500">{String(qErrors.answerType)}</p>}
                    </div>
                  </div>

                  {answerType === "MultipleChoice" && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-slateInk">Answer options</label>

                        <button
                          type="button"
                          onClick={() => {
                            if (isEditMode) return;
                            const opts = questions?.[index]?.options ?? [];
                            const newOpts = [...opts, ""];
                            const newQs = [...questions];
                            newQs[index] = { ...newQs[index], options: newOpts };
                            setFieldValue("questions", newQs);
                          }}
                          disabled={isEditMode}
                          className={`text-xs font-medium text-primary hover:underline ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          + Add option
                        </button>
                      </div>

                      {(questions?.[index]?.options ?? ["", "", ""]).map((_, opt) => (
                        <div key={opt} className="flex gap-2 items-center">
                          <input
                            value={questions?.[index]?.options?.[opt] ?? ""}
                            onChange={(e) => {
                              if (isEditMode) return;
                              const opts = questions?.[index]?.options ?? [];
                              const newOpts = [...opts];
                              newOpts[opt] = e.target.value;
                              const newQs = [...questions];
                              newQs[index] = { ...newQs[index], options: newOpts };
                              setFieldValue("questions", newQs);
                            }}
                            placeholder={`Option ${opt + 1}`}
                            disabled={isEditMode}
                            className={`flex-1 h-11 rounded-xl border border-[#D8DBE4] px-4 text-sm outline-none focus:border-primary ${isEditMode ? 'bg-gray-100 text-gray-600' : ''}`}
                          />
                          {opt > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (isEditMode) return;
                                const opts = questions?.[index]?.options ?? [];
                                const newOpts = opts.filter((_, i) => i !== opt);
                                const newQs = [...questions];
                                newQs[index] = { ...newQs[index], options: newOpts };
                                setFieldValue("questions", newQs);
                              }}
                              disabled={isEditMode}
                              className={`text-red-500 hover:text-red-600 shrink-0 ${isEditMode ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}

                      <p className="text-xs text-[#64748B]">Add as many options as needed. Empty options will be ignored.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
