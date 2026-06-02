import type { AiFeedbackInsights } from './types';

/**
 * Frontend-only mock for the AI insights block.
 * Swap `MOCK_AI_FEEDBACK_INSIGHTS` with API data when analytics is wired.
 */
export const MOCK_AI_FEEDBACK_INSIGHTS: AiFeedbackInsights = {
  satisfactionPercentage: 92,
  sentimentCounts: {
    positive: 58,
    neutral: 11,
    negative: 5,
  },
  summary:
    'Mentees consistently highlight clear communication, structured sessions, and actionable portfolio feedback. Most reviews mention measurable progress within the first few weeks of the program.',
  positiveSummary:
    'Strengths include patient explanations, well-paced milestones, honest critique, and follow-up between sessions. Several mentees noted improved interview readiness and stronger case-study presentations.',
  negativeSummary:
    'A small number of reviews asked for tighter scheduling around deadlines and more advanced topics earlier in the program. Occasional feedback mentioned wanting additional async resources between live sessions.',
};
