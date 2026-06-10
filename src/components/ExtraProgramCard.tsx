import React from "react";

export interface AuthorInfo {
  avatar: string;
  name: string;
}

export interface ExtraProgramCardProps {
  variant?:
    | "simple-button"
    | "dual-buttons"
    | "progress"
    | "main"
    | "mentor-application-card"
    | "mentor-profile-program-card"
    | "mentee-application-card";

  image?: string;

  tag?: string;
  subDomains?: string[];

  title: string;
  description: string;

  progress?: number;
  author?: AuthorInfo;

  primaryButtonText?: string;
  secondaryButtonText?: string;

  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;

  className?: string;

  applicantsCount?: number;
  deadline?: string;
  status?: "Open" | "Closed" | "Accepted" | "Under Review" | "Rejected";

  // ✅ NEW (mentor only)
  onViewApplicants?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCancelApplying?: () => void;
}

export const ExtraProgramCard: React.FC<
  ExtraProgramCardProps
> = ({
  variant = "simple-button",
  image,
  tag,
  subDomains = [],
  title,
  description,
  progress,
  author,
  primaryButtonText = "Apply",
  secondaryButtonText = "Details",
  onPrimaryClick,
  onSecondaryClick,
  className = "",
  applicantsCount = 0,
  deadline = "",
  status = "Open",

  // ✅ NEW
  onViewApplicants,
  onEdit,
  onDelete,
  onCancelApplying,
}) => {
  const progressValue =
    Math.max(
      0,
      Math.min(
        100,
        progress ?? 0
      )
    );

  const isMain =
    variant === "main";

  const isMentor =
    variant ===
    "mentor-application-card";

  const isProfileMentor =
    variant ===
    "mentor-profile-program-card";

  const isMenteeApplication =
    variant ===
    "mentee-application-card";

  const shownSubs =
    subDomains.slice(0, 2);

  const [menuOpen, setMenuOpen] =
    React.useState(false);

  React.useEffect(() => {
    const close = () =>
      setMenuOpen(false);
    window.addEventListener(
      "click",
      close
    );
    return () =>
      window.removeEventListener(
        "click",
        close
      );
  }, []);

  /* ======================
     PROGRESS CARD
  ====================== */
  if (
    variant ===
    "progress"
  ) {
    return (
      <article
        className={`rounded-2xl border border-[#D8DBE4] bg-white shadow-sm p-5 ${className}`}
      >
        {(tag ||
          shownSubs.length >
            0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tag && (
              <span className="rounded-md bg-[#F0ECFB] px-2 py-1 text-[10px] font-semibold uppercase text-[#6B57B5]">
                {tag}
              </span>
            )}

            {shownSubs.map(
              (
                item,
                i
              ) => (
                <span
                  key={i}
                  className="rounded-md bg-[#EAF9F7] px-2 py-1 text-[10px] font-semibold uppercase text-[#2EA594]"
                >
                  {item}
                </span>
              )
            )}
          </div>
        )}

        <h3 className="text-[26px] font-bold leading-tight text-[#1F2432] line-clamp-2">
          {title}
        </h3>

        <p className="mt-3 text-[15px] leading-6 text-[#5D6A85] line-clamp-3 break-words">
          {description}
        </p>

        <div className="mt-5">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-semibold text-[#6C7285]">
              PROGRESS
            </span>

            <span className="text-xl font-bold text-[#6757B1]">
              {progressValue}%
            </span>
          </div>

          <div className="h-2.5 rounded-full bg-[#DFE2E8] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#5D519E] to-[#56C2CE]"
              style={{
                width: `${progressValue}%`,
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={
            onPrimaryClick
          }
          className="mt-5 w-full h-11 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition"
        >
          Join Classroom
        </button>
      </article>
    );
  }

  /* ======================
     OTHER CARDS
  ====================== */

  const hasImage =
    variant === "simple-button" ||
    variant === "dual-buttons" ||
    variant === "main" ||
    variant === "mentor-profile-program-card";

  const statusStyles: Record<string, string> = {
    Open: "text-[#2EA594]",
    Closed: "text-[#B42318]",
    Accepted: "text-[#15803D]",
    "Under Review": "text-[#3643D9]",
    Rejected: "text-[#B42318]",
  };

  const currentStatusClass =
    statusStyles[status] || "text-[#2EA594]";

  return (
    <article
      className={`rounded-2xl border border-[#D8DBE4] bg-white shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      {(hasImage && (image || isProfileMentor)) && (
          <div
            className={`relative w-full shrink-0 ${
              isMain ||
              isMentor || isProfileMentor
                ? "h-40"
                : "h-32"
            } ${!image ? "bg-[#F5F7FB] flex items-center justify-center" : ""}`}
          >
            {image ? (
              <img
                src={image}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-[#A1A9B8]">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            )}

            {isProfileMentor && (
              <div className={`absolute top-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm ${currentStatusClass}`}>
                ● {status}
              </div>
            )}
          </div>
        )}

      <div
        className={`flex-1 flex flex-col ${
          isMain ||
          isMentor || isProfileMentor ||
          isMenteeApplication
            ? "p-5"
            : "p-4"
        }`}
      >
        {(isMentor || isProfileMentor) && (
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[#7D89A3] font-medium mb-3">
            <span>
              Deadline: {deadline}
            </span>
            {isMentor && (
              <span className={`inline-block rounded-full bg-[#F5F7FB] px-3 py-1 text-xs font-semibold ${currentStatusClass}`}>
                ● {status}
              </span>
            )}
          </div>
        )}

        {isMenteeApplication && (
          <div className="mb-3">
            <span className={`inline-block rounded-full bg-[#F5F7FB] px-3 py-1 text-xs font-semibold ${currentStatusClass}`}>
              ● {status}
            </span>
          </div>
        )}

        {!isMentor &&
          (tag ||
            shownSubs.length >
              0) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tag && (
                <span className="rounded-md bg-[#F0ECFB] px-2 py-1 text-[10px] font-semibold uppercase text-[#6B57B5]">
                  {tag}
                </span>
              )}

              {shownSubs.map(
                (
                  item,
                  i
                ) => (
                  <span
                    key={i}
                    className="rounded-md bg-[#EAF9F7] px-2 py-1 text-[10px] font-semibold uppercase text-[#2EA594]"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          )}

        <h3
          className={`font-bold leading-tight text-[#1F2432] line-clamp-2 ${
            isMain ||
            isMentor || isProfileMentor ||
            isMenteeApplication
              ? "text-[22px]"
              : "text-[18px]"
          }`}
        >
          {title}
        </h3>

        <p
          className={`mt-3 text-[#5D6A85] line-clamp-3 break-words ${
            isMain ||
            isMentor || isProfileMentor ||
            isMenteeApplication
              ? "text-[15px] leading-6"
              : "text-sm leading-6"
          }`}
        >
          {description}
        </p>

        <div className="mt-auto pt-5">
          {author &&
            isMain && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />

                  <span className="text-sm text-[#7D89A3] truncate">
                    {author.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onPrimaryClick}
                  className="h-11 px-5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition shrink-0"
                >
                  {primaryButtonText}
                </button>
              </div>
            )}

          {/* ✅ MENTOR ONLY */}
          {(isMentor || isProfileMentor) && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrimaryClick}
                className="flex-1 h-11 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition"
              >
                Manage Applicants
              </button>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                  className="h-11 w-11 flex items-center justify-center rounded-xl border border-[#E0E4EC] hover:bg-[#F5F7FB]"
                >
                  ⋮
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 bottom-12 w-48 bg-white border border-[#E0E4EC] rounded-xl shadow-lg z-50"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >
                    {/* ✅ ONLY EDITED PART */}
                    <button
                      onClick={() => {
                        if (onViewApplicants) {
                          onViewApplicants();
                        } else if (onPrimaryClick) {
                          onPrimaryClick();
                        }
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[#F5F7FB]"
                    >
                      View Application
                    </button>

                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit();
                          setMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-[#F5F7FB]"
                      >
                        Edit
                      </button>
                    )}

                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete();
                          setMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#F5F7FB]"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {isMenteeApplication && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrimaryClick}
                className="flex-1 h-11 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition"
              >
                {primaryButtonText}
              </button>

              {secondaryButtonText && (
                <button
                  type="button"
                  onClick={onSecondaryClick ?? onCancelApplying}
                  className={`h-11 px-4 rounded-xl border text-sm font-semibold transition ${
                    (secondaryButtonText || "").toLowerCase().includes("withdraw")
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : "border-[#C4CAD7] text-[#2E3547] hover:bg-[#F5F7FB]"
                  }`}
                >
                  {secondaryButtonText}
                </button>
              )}
            </div>
          )}

          {!isMain &&
            !(isMentor || isProfileMentor) &&
            !isMenteeApplication && (
              <div className="flex gap-2.5">
                {variant ===
                  "dual-buttons" && (
                  <button
                    type="button"
                    onClick={
                      onSecondaryClick
                    }
                    className="h-11 px-4 rounded-xl border border-[#C4CAD7] text-sm font-semibold text-[#2E3547] hover:bg-[#F5F7FB]"
                  >
                    {secondaryButtonText}
                  </button>
                )}

                <button
                  type="button"
                  onClick={
                    onPrimaryClick
                  }
                  className={`h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark transition ${
                    variant ===
                    "dual-buttons"
                      ? "flex-1"
                      : "w-full"
                  }`}
                >
                  {primaryButtonText}
                </button>
              </div>
            )}
        </div>
      </div>
    </article>
  );
};

export default ExtraProgramCard;