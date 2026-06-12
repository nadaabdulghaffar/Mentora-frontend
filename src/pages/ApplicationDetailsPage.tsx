import {
  Users,
  Calendar,
  Clock,
  Heart,
  Share2,
  Link,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";

import Layout from "../shared/components/Layout";
import ApplyQuestionsModal
  from "../components/application/ApplyQuestionsModal";
import { ProfileAvatar } from "../components/profile/ProfileAvatar";
import { formatTargetLevel } from "../utils/roadmapDisplayUtils";
import lookupAPI from "../services/lookupService";

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getProgramView,
  toggleProgramLike,
  getProgramQuestions,
  applyToProgram,
  withdrawApplication,
  getProgramComments,
  addProgramComment,
  canApply,
} from "../services/programService";

import { toast } from 'react-hot-toast';

import type { ProgramViewDto } from "../services/programService";


const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();


  const [shareOpen, setShareOpen] =
    useState(false);


  const [comments, setComments] =
    useState<any[]>([]);

  const [commentText, setCommentText] =
    useState("");

  const [addingComment, setAddingComment] =
    useState(false);

  const [technologyNames, setTechnologyNames] = useState<Record<number, string>>({});

  const [program, setProgram] =
    useState<ProgramViewDto | null>(null);

  const [loading, setLoading] =
    useState(true);



  const resolveImageUrl = (url?: string | null) => {
    if (!url) return undefined;
    // already absolute
    if (/^https?:\/\//i.test(url)) return url;
    // derive host base from axios instance
    try {
      const base = String(api.defaults.baseURL || "").replace(/\/api\/?$/, "");
      if (!base) return url;
      return url.startsWith("/") ? base + url : base + "/" + url;
    } catch {
      return url;
    }
  };

  const [error, setError] =
    useState<string | null>(null);

  const [showApplyModal, setShowApplyModal] =
    useState(false);

  const [questions, setQuestions] =
    useState<any[]>([]);

  const [answers, setAnswers] =
    useState<Record<number, string>>({});

  const [submittingApplication, setSubmittingApplication] =
    useState(false);
  const [showLevelMismatchModal, setShowLevelMismatchModal] =
    useState(false);
  const [isCheckingCanApply, setIsCheckingCanApply] =
    useState(false);
  const canApplyRequestRef = useRef(0);
  const openFlowRequestRef = useRef(0);
  const [eligibilityGate, setEligibilityGate] = useState<{
    programId: number | null;
    approved: boolean;
    checkedAt: number;
  }>({
    programId: null,
    approved: false,
    checkedAt: 0,
  });
  const ELIGIBILITY_CACHE_TTL_MS = 15_000;



  useEffect(() => {



    const loadProgram = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError("Program ID is missing");
          return;
        }

        const data = await getProgramView(
          Number(id)
        );

        setProgram(data);

        const commentsData =
          await getProgramComments(
            Number(id)
          );

        setComments(commentsData);

        console.log(data.roadmap);
      } catch (err) {
        console.error(err);

        setError(
          "Failed to load program details"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [id]);

  useEffect(() => {
    // Invalidate stale modal/gate state on program route changes.
    setShowApplyModal(false);
    setQuestions([]);
    setAnswers({});
    setEligibilityGate({ programId: null, approved: false, checkedAt: 0 });
    canApplyRequestRef.current += 1;
    openFlowRequestRef.current += 1;
  }, [id]);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const roleStr = user?.role || user?.Role || "";
  const userRoles = Array.isArray(user?.roles) ? user.roles : (Array.isArray(user?.Roles) ? user.Roles : [roleStr]);
  const isMentorRole = userRoles.some((r: string) => r.toLowerCase() === "mentor");

  const hasDeadlinePassed = program ? new Date(program.deadline) < new Date() : false;

  const handleToggleLike = async () => {
    if (!program) return;

    const previousLiked =
      program.isLiked;

    const previousCount =
      program.likesCount;

    setProgram({
      ...program,

      isLiked: !program.isLiked,

      likesCount:
        program.isLiked
          ? program.likesCount - 1
          : program.likesCount + 1,
    });

    try {
      await toggleProgramLike(
        program.programId
      );
    } catch (error) {
      console.error(error);

      // rollback
      setProgram({
        ...program,
        isLiked: previousLiked,
        likesCount: previousCount,
      });
    }
  };

  const handleDirectApply = async () => {
    if (!program) return;

    const approved = await verifyCanApplyStrict(program.programId, { allowCache: true });
    if (!approved) {
      setShowApplyModal(false);
      return;
    }

    try {
      setSubmittingApplication(true);

      const res: any = await applyToProgram(
        program.programId,
        {
          answers: [],
        }
      );

      // Backend may return { success: false, data: false } with 200 OK.
      if (res && res.success === false && (res.data === false || res.data === null)) {
        console.debug("applyToProgram response (not qualified):", res);
        // show toast in addition to modal for visibility
        try {
          const msg = typeof res.message === 'string' && res.message.length > 0 ? res.message : "You are not qualified for this program.";
          toast.error(msg);
        } catch (e) {
          /* ignore */
        }
        setShowLevelMismatchModal(true);
        return;
      }

      setProgram({
        ...program,
        isApplied: true,
      });

      try {
        // show success toast (user requested exact wording)
        const msg = 'your application has sent sucessfuly';
        console.log('about to call toast.success', msg);
        toast.success(msg);
        console.log('called toast.success');
      } catch (e) { console.warn('toast failed', e); }

    } catch (error: any) {
      console.error(error);

      if (
        error?.response?.data?.message ===
        "This program may not fit your current skills and experience"
      ) {
        setShowLevelMismatchModal(true);
        return;
      }
    } finally {
      setSubmittingApplication(false);
    }
  };

  // Helper to handle API bodies that indicate non-qualification
  const handleNotQualifiedBody = (body: any) => {
    if (!body) return false;
    const msg = typeof body.message === 'string' && body.message.length > 0 ? body.message : "You are not qualified for this program.";
    const indicatesLevelMismatch = /not\s+qualified|fit\s+your\s+level|fit\s+your\s+current\s+skills/i.test(msg);
    if (body.data === false || body.data === null || indicatesLevelMismatch) {
      try {
        toast.error(msg);
      } catch (e) {
        // fallback: avoid showing raw HTML from server in an alert
        console.warn("Could not show toast, message:", msg);
      }
      setShowLevelMismatchModal(true);
      return true;
    }
    return false;
  };

  const verifyCanApplyStrict = async (
    programId: number,
    options?: { allowCache?: boolean }
  ): Promise<boolean> => {
    const allowCache = options?.allowCache ?? false;
    const now = Date.now();

    if (
      allowCache &&
      eligibilityGate.programId === programId &&
      eligibilityGate.approved &&
      now - eligibilityGate.checkedAt <= ELIGIBILITY_CACHE_TTL_MS
    ) {
      return true;
    }

    const requestId = ++canApplyRequestRef.current;
    setIsCheckingCanApply(true);

    try {
      const can = await canApply(programId);

      if (requestId !== canApplyRequestRef.current) {
        return false;
      }

      const approved = !!can && can.success === true && can.data === true;
      if (!approved) {
        setEligibilityGate({ programId, approved: false, checkedAt: Date.now() });
        handleNotQualifiedBody(can);
        return false;
      }

      setEligibilityGate({ programId, approved: true, checkedAt: Date.now() });
      return true;
    } catch (error: any) {
      if (requestId !== canApplyRequestRef.current) {
        return false;
      }
      setEligibilityGate({ programId, approved: false, checkedAt: Date.now() });
      // Build a more detailed error message for debugging
      const status = error?.response?.status;
      const body = error?.response?.data;
      const shortMessage = String(
        body?.message ||
        error?.message ||
        "Could not verify eligibility right now. Please try again."
      );

      let detailMsg = `Eligibility check failed${status ? ` (status ${status})` : ""}: ${shortMessage}` + (body ? ` | body: ${JSON.stringify(body)}` : "");

      // Friendly message for 403 Forbidden (user not in Mentee role)
      if (status === 403) {
        detailMsg = "You are not allowed to apply to programs. Please make sure your account is registered as a Mentee and you have completed your mentee profile.";
      }

      // log full error to console for developer debugging
      console.error("verifyCanApplyStrict error:", error);
      try {
        toast.error(detailMsg);
      } catch {
        console.warn('Error showing toast', detailMsg);
      }

      return false;
    } finally {
      if (requestId === canApplyRequestRef.current) {
        setIsCheckingCanApply(false);
      }
    }
  };

  const handleSubmitApplication = async () => {
    if (!program) return;

    const approved = await verifyCanApplyStrict(program.programId, { allowCache: true });
    if (!approved) {
      setShowApplyModal(false);
      return;
    }

    try {
      setSubmittingApplication(true);

      const formattedAnswers = questions.map((question) => ({
        questionId: question.programQuestionId,
        questionAnswer: answers[question.programQuestionId] || "",
      }));

      const res: any = await applyToProgram(program.programId, { answers: formattedAnswers });

      if (res && res.success === false && (res.data === false || res.data === null)) {
        console.debug("applyToProgram (questions) response (not qualified):", res);
        try {
          const msg = typeof res.message === 'string' && res.message.length > 0 ? res.message : "You are not qualified for this program.";
          toast.error(msg);
        } catch (e) {
          console.warn('Error showing toast', e);
        }
        setShowLevelMismatchModal(true);
        return;
      }

      setProgram({ ...program, isApplied: true });
      setShowApplyModal(false);

      try {
        toast.success('your application has sent sucessfuly');
      } catch (e) {
        console.warn('toast failed', e);
      }

    } catch (error: any) {
      console.error(error);
      if (handleNotQualifiedBody(error?.response?.data)) return;
      if (error?.response?.data?.message) {
        try {
          toast.error(String(error.response.data.message));
        } catch (e) {
          console.warn('Error showing toast, message:', String(error?.response?.data?.message));
        }
      }
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handleWithdrawApplication =
    async () => {

      if (!program) return;

      try {
        setSubmittingApplication(true);

        await withdrawApplication(
          program.programId
        );

        setProgram({
          ...program,
          isApplied: false,
        });

        try {
          const msg = 'Application withdrawn successfully';
          console.log('about to call toast.success (withdraw)', msg);
          toast.success(msg);
          console.log('called toast.success (withdraw)');
        } catch (e) { console.warn('toast failed', e); }

      } catch (error) {
        console.error(error);
      } finally {
        setSubmittingApplication(false);
      }
    };

  const handleOpenApplyModal = async () => {
    if (!program || submittingApplication || isCheckingCanApply) return;

    // Strict gate: close/reset modal state before any new eligibility attempt.
    setShowApplyModal(false);
    setQuestions([]);
    setAnswers({});

    const flowId = ++openFlowRequestRef.current;

    try {
      // Single source of truth gate: must pass before any modal/open action.
      const approved = await verifyCanApplyStrict(program.programId, { allowCache: false });
      if (flowId !== openFlowRequestRef.current) return;
      if (!approved) {
        return;
      }

      const data = await getProgramQuestions(program.programId);
      if (flowId !== openFlowRequestRef.current) return;

      if (!data || data.length === 0) {
        await handleDirectApply();
        return;
      }

      setQuestions(data);
      setShowApplyModal(true);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (!program || !program.technologies || program.technologies.length === 0) return;

    const fetchTechNames = async () => {
      try {
        const domainsRes = await lookupAPI.getDomains();
        if (!domainsRes.success || !domainsRes.data) return;
        const domain = domainsRes.data.find(d => d.name === program.domainName);
        if (!domain) return;

        const subDomainsRes = await lookupAPI.getSubDomains(domain.id);
        if (!subDomainsRes.success || !subDomainsRes.data) return;
        const subDomain = subDomainsRes.data.find(s => s.name === program.subDomainName);
        if (!subDomain) return;

        const techRes = await lookupAPI.getTechnologies(subDomain.id);
        if (!techRes.success || !techRes.data) return;

        const namesMap: Record<number, string> = {};
        techRes.data.forEach(tech => {
          namesMap[Number(tech.id)] = tech.name;
        });
        setTechnologyNames(namesMap);
      } catch (e) {
        console.error("Failed to map technology names:", e);
      }
    };

    fetchTechNames();
  }, [program]);
  const handleAddComment =
    async () => {

      if (
        !commentText.trim() ||
        !program
      )
        return;

      try {

        setAddingComment(true);

        await addProgramComment(
          program.programId,
          commentText
        );

        const updatedComments =
          await getProgramComments(
            program.programId
          );

        setComments(updatedComments);

        setCommentText("");

        setProgram({
          ...program,
          commentsCount:
            program.commentsCount + 1,
        });

      } catch (error) {

        console.error(error);

      } finally {

        setAddingComment(false);
      }
    };


  const shareLink =
    `${window.location.origin}/program/${program?.programId}`;

  const handleCopyLink =
    async () => {

      try {

        await navigator.clipboard.writeText(
          shareLink
        );

        setShareOpen(false);

      } catch (error) {

        console.error(error);
      }
    };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>

      </Layout>

    );
  }

  if (error || !program) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center text-red-500">
          {error || "Program not found"}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-[#F6F7FB] min-h-screen pt-6 pb-10">

        {/* CONTENT (ALIGNED WITH SIDEBAR) */}
        <div
          className="
  flex flex-col lg:flex-row gap-10
  pl-4 sm:pl-6 lg:pl-6
  pr-4 sm:pr-6 lg:pr-12
"
        >

          {/* LEFT */}
          <div className="flex-1 space-y-8">

            {/* TOP CARD */}
            <div className="bg-white border border-[#E6E9F0] rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col sm:flex-row gap-6">

              <ProfileAvatar
                pictureUrl={program.profilePictureUrl}
                name={program.title}
                className="w-24 h-24 rounded-2xl object-cover"
              />

              <div className="flex-1">

                <h2 className="text-[24px] sm:text-[28px] lg:text-[30px] font-semibold text-[#1F2432] leading-snug">
                  {program.title}
                  <br />
                </h2>

                <p className="mt-2 text-[15px] text-[#6B7280]">
                  by{" "}
                  <span className="text-[#6D5DD3] font-medium cursor-pointer">
                    {program.mentorName}
                  </span>
                </p>

                {/* TAGS */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 text-sm rounded-full bg-[#EEF2FF] text-[#6D5DD3] font-medium">
                    {program.domainName}

                  </span>
                  <span className="px-3 py-1 text-sm rounded-full bg-[#F1F5F9] text-[#64748B] font-medium">
                    {program.subDomainName}
                  </span>
                  <span className="px-3 py-1 text-sm rounded-full bg-[#FEF3C7] text-[#B45309] font-medium">
                    {program.targetLevel}
                  </span>
                  {program.educationLevel && (
                    <span className="px-3 py-1 text-sm rounded-full bg-[#ECFCCB] text-[#4D7C0F] font-medium">
                      {program.educationLevel}
                    </span>
                  )}
                </div>

                {/* META */}
                <div className="flex flex-wrap gap-6 mt-6 text-[15px] text-[#64748B]">

                  <div className="flex items-center gap-2">
                    <Users size={20} />
                    <span>{program.menteesCount} {program.capacity ? `/ ${program.capacity}` : ''} Mentees</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={20} />
                    <span>{program.duration}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={20} />
                    <span>Deadline:{" "}
                      {new Date(
                        program.deadline
                      ).toLocaleDateString()}</span>
                  </div>

                </div>

                {/* DIVIDER */}
                <div className="h-[1px] bg-[#EEF1F6] my-6" />

                {program.technologies && program.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {program.technologies.map((tech: any) => {
                      const displayName = tech.technologyName || tech.name || tech.title || (tech.technology && tech.technology.name) || technologyNames[tech.technologyId] || `Tech ${tech.technologyId}`;
                      const levelName = tech.levelName || formatTargetLevel(tech.requiredExperienceLevel) || `Lvl ${tech.requiredExperienceLevel}`;
                      return (
                        <span key={tech.technologyId} className="px-3 py-1 text-sm rounded-full bg-[#F3F4F6] text-[#374151] font-medium border border-[#E5E7EB] flex items-center gap-1">
                          {displayName}
                          <span className="text-xs text-[#6B7280] font-normal border-l border-[#D1D5DB] pl-1 ml-1">{levelName}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex flex-wrap items-center gap-8 text-[15px]">

                  {/* LIKE */}
                  <button
                    type="button"
                    onClick={handleToggleLike}
                    className={`flex items-center gap-2 cursor-pointer transition ${program.isLiked ? 'text-red-500 hover:text-red-600' : 'text-[#64748B] hover:text-[#6D5DD3]'
                      }`}
                  >
                    <Heart size={20} fill={program.isLiked ? "currentColor" : "none"} />
                    <span>{program.likesCount} Likes</span>
                  </button>
                  {/* SAVE */}
                  {/* Save removed per request */}
                  {/* SHARE */}
                  <div className="relative">

                    <button
                      type="button"
                      onClick={() =>
                        setShareOpen((prev) => !prev)
                      }
                      className="
      flex items-center gap-2
      cursor-pointer text-[#64748B]
      hover:text-[#6D5DD3]
      transition
    "
                    >

                      <Share2 size={20} />

                      Share

                    </button>


                    {shareOpen ? (

                      <div
                        className="
      absolute right-0 top-full
      z-30 mt-3 w-80
      rounded-2xl border
      border-white/15
      bg-white p-4
      text-slate-900 shadow-2xl
      shadow-black/20
    "
                      >

                        <p className="text-sm font-semibold text-[#1F2533]">

                          Share program

                        </p>

                        <p className="mt-1 text-xs text-[#6B7289]">

                          Copy this program link
                          and send it to anyone.

                        </p>

                        <div
                          className="
        mt-4 flex items-center gap-2
        rounded-xl border
        border-[#D8DCE8]
        bg-[#F8F9FD]
        px-3 py-2
      "
                        >

                          <Link
                            size={16}
                            className="
          shrink-0 text-primary
        "
                          />

                          <input
                            readOnly
                            value={shareLink}
                            className="
          min-w-0 flex-1
          bg-transparent text-xs
          text-[#1F2533]
          outline-none
        "
                          />

                        </div>

                        <div className="mt-4 flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setShareOpen(false)
                            }
                            className="
          rounded-xl border
          border-[#D8DCE8]
          px-4 py-2 text-sm
          font-semibold text-[#6B7289]
          transition hover:bg-[#F8F9FD]
        "
                          >

                            Close

                          </button>

                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className="
          rounded-xl bg-primary
          px-4 py-2 text-sm
          font-semibold text-white
          transition hover:bg-primary-dark
        "
                          >

                            Copy Link

                          </button>

                        </div>

                      </div>

                    ) : null}

                  </div>

                </div>
              </div>

              {!isMentorRole && (
                <button
                  onClick={() => {
                    if (program.isApplied) {
                      handleWithdrawApplication();
                    } else {
                      handleOpenApplyModal();
                    }
                  }}
                  disabled={submittingApplication || isCheckingCanApply || (program.applicationStatus !== 'Pending' && program.isApplied) || (!program.isApplied && hasDeadlinePassed)}
                  className={`
                  px-8 py-3 rounded-2xl font-medium text-[15px]
                  h-fit self-start sm:self-center transition

                  ${program.isApplied
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-[#6D5DD3] text-white hover:opacity-90"
                    }

                  ${submittingApplication || isCheckingCanApply || (program.applicationStatus !== 'Pending' && program.isApplied) || (!program.isApplied && hasDeadlinePassed)
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                    }
                `}
                >
                  {submittingApplication || isCheckingCanApply
                    ? (program.isApplied ? "Cancelling..." : isCheckingCanApply ? "Checking..." : "Applying...")
                    : program.applicationStatus === 'Accepted'
                      ? "Already Accepted"
                      : program.applicationStatus === 'Rejected'
                        ? "Already Rejected"
                        : program.isApplied
                          ? "Withdraw Application"
                          : hasDeadlinePassed
                            ? "Applications Closed"
                            : "Apply to Program"}
                </button>
              )}
            </div>

            {/* ABOUT */}
            <div className="bg-white border border-[#E6E9F0] rounded-3xl p-8 sm:p-10 shadow-sm">
              <h3 className="text-xl font-semibold text-[#1F2432] mb-4">
                About This Mentorship
              </h3>

              <p className="text-[15px] text-[#64748B] leading-7">
                {program.description}
              </p>

              {program.availability && (
                <>
                  <h4 className="text-lg font-semibold text-[#1F2432] mt-6 mb-2">Availability</h4>
                  <p className="text-[15px] text-[#64748B] leading-7">{program.availability}</p>
                </>
              )}
            </div>

            {/* ROADMAP */}
            <div className="bg-white border border-[#E6E9F0] rounded-3xl p-8 sm:p-10 shadow-sm">

              <div className="flex justify-between mb-6">
                <h3 className="text-xl font-semibold text-[#1F2432]">
                  Program Roadmap
                </h3>

                <button

                  onClick={() => {
                    if (program.roadmap?.roadmapId) {
                      navigate(
                        `/roadmap/${program.roadmap.roadmapId}`
                      );
                    }
                  }}
                  className="text-[15px] text-[#6D5DD3] cursor-pointer hover:underline"
                >
                  View Full Roadmap →
                </button>
              </div>

              <div className="space-y-6">
                {program.roadmap?.phases?.map(
                  (phase, i) => (
                    <div
                      key={phase.phaseId}
                      className="flex gap-4"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#EEF2FF] text-[#6D5DD3] text-sm flex items-center justify-center font-semibold">
                        {i + 1}
                      </div>

                      <div>
                        <p className="text-[15px] font-medium text-[#1F2432]">
                          {phase.title}
                        </p>

                        <p className="text-sm text-[#64748B]">
                          {phase.description}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="w-full lg:w-[400px] xl:w-[420px] space-y-6 lg:sticky lg:top-6 h-fit">

            {/* MENTOR */}
            <div className="bg-white border border-[#E6E9F0] rounded-3xl p-6 shadow-sm overflow-hidden">

              <h4 className="font-semibold text-[#1F2432] mb-4">
                Meet the Mentor
              </h4>

              <div className="flex gap-4 items-center min-w-0">

                <ProfileAvatar
                  pictureUrl={program.profilePictureUrl}
                  name={program.mentorName}
                  className="w-14 h-14 rounded-full object-cover shrink-0"
                />

                <div className="min-w-0">

                  <p className="font-semibold text-[#1F2432] break-words">
                    {program.mentorName}
                  </p>

                  <p className="text-sm text-[#64748B] break-words">
                    {program.domainName} Mentor
                  </p>

                </div>
              </div>

              <p className="text-sm text-[#64748B] mt-4 leading-6 break-words max-h-24 overflow-y-auto pr-1">
                {program.bio || "No bio available."}
              </p>

              <button
                onClick={() => {
                  navigate(
                    `/profile/${program.mentorProfileId}`
                  );
                }}
                className="text-sm text-[#6D5DD3] mt-4 cursor-pointer hover:underline"
              >
                View Profile →
              </button>

            </div>

            {/* COMMENTS */}
            <div className="bg-white border border-[#E6E9F0] rounded-3xl p-5 shadow-sm">

              <div className="flex justify-between mb-4">

                <h4 className="font-semibold">
                  Comments
                </h4>

                <span className="text-xs bg-gray-100 px-2 rounded-full">

                  {comments.length}

                </span>

              </div>

              {/* COMMENTS LIST */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">

                {comments.length === 0 ? (

                  <p className="text-sm text-[#94A3B8]">
                    No comments yet.
                  </p>

                ) : (

                  comments.map(
                    (comment: any) => (

                      <div
                        key={comment.commentId}
                        className="border-b pb-3"
                      >

                        <p className="text-sm font-medium text-[#1F2432]">

                          {comment.userName ||
                            comment.fullName ||
                            "User"}

                        </p>

                        <p className="text-sm text-[#64748B] leading-6 break-words">

                          {comment.commentText ||
                            comment.content}

                        </p>

                      </div>
                    )
                  )
                )}

              </div>

              {/* INPUT */}
              <div className="mt-4 flex gap-2">

                <input
                  value={commentText}
                  onChange={(e) =>
                    setCommentText(
                      e.target.value
                    )
                  }
                  placeholder="Write a comment..."
                  className="
        flex-1 border border-[#E2E8F0]
        rounded-xl px-4 py-2 text-sm
        focus:outline-none
        focus:ring-2
        focus:ring-[#6D5DD3]/20
      "
                />

                <button
                  onClick={handleAddComment}
                  disabled={
                    addingComment ||
                    !commentText.trim()
                  }
                  className="
        px-4 py-2 rounded-xl
        bg-[#6D5DD3]
        text-white text-sm
        hover:opacity-90
        disabled:opacity-50
      "
                >

                  {addingComment
                    ? "..."
                    : "Post"}

                </button>

              </div>

            </div>

          </div>

        </div>
      </div>

      {showLevelMismatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">

          <div className="bg-white w-full max-w-[500px] rounded-[28px] p-6 sm:p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">

            {/* CLOSE */}
            <button
              onClick={() =>
                setShowLevelMismatchModal(false)
              }
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#64748B] text-2xl"
            >
              ×
            </button>

            {/* ICON */}
            <div className="flex justify-center">

              <div className="w-20 h-20 rounded-full bg-[#E7F6F2] flex items-center justify-center">

                <div className="w-14 h-14 rounded-full border-4 border-[#1F9D8B] flex items-center justify-center text-[28px]">
                  😟
                </div>

              </div>

            </div>

            {/* TITLE */}
            <h2 className="text-center text-[28px] font-bold text-[#0F172A] mt-6 leading-tight">
              This program may not fit your level
            </h2>

            {/* DESCRIPTION */}
            <p className="text-center text-[18px] text-[#64748B] mt-4 leading-8">
              We recommend looking for programs
              designed for your current path.
            </p>

            {/* BUTTON */}
            <button
              onClick={() => {
                setShowLevelMismatchModal(false);

                navigate("/search-mentorship?tab=programs");
              }}
              className="w-full mt-8 bg-[#6254B8] hover:opacity-90 transition text-white text-[18px] font-semibold py-4 rounded-[18px] shadow-lg"
            >
              Browse Other Programs
            </button>

          </div>

        </div>
      )}

      {/* APPLY MODAL */}
      <ApplyQuestionsModal
        open={
          showApplyModal &&
          !!program &&
          eligibilityGate.programId === program.programId &&
          eligibilityGate.approved &&
          !isCheckingCanApply
        }
        onClose={() =>
          setShowApplyModal(false)
        }
        questions={questions}
        answers={answers}
        setAnswers={setAnswers}
        onSubmit={handleSubmitApplication}
        submitting={submittingApplication || isCheckingCanApply}
      />

    </Layout>
  );
};

export default ApplicationDetailsPage;