import {
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ApplicantSidePanel({
  applicant,
  isOpen,
  onClose,
  onAccept,
  onReject,
}: any) {

  if (!applicant) return null;

  const levelStyles: any = {
    Senior:
      "bg-blue-100 text-blue-600",

    "Mid-Level":
      "bg-purple-100 text-purple-600",

    Mid:
      "bg-purple-100 text-purple-600",

    Junior:
      "bg-green-100 text-green-600",

    Beginner:
      "bg-green-100 text-green-600",
  };

  const statusStyles: any = {
    Accepted:
      "bg-green-100 text-green-700",

    Pending:
      "bg-yellow-100 text-yellow-700",

    Rejected:
      "bg-red-100 text-red-600",

    Cancelled:
      "bg-gray-100 text-gray-500",
  };

  return (
    <>
      {/* OVERLAY */}
      {isOpen && (
        <div
          onClick={onClose}
          className="
            fixed inset-0
            bg-black/20 z-40
          "
        />
      )}

      {/* PANEL */}
      <div
        className={`
          fixed top-0 right-0
          h-full w-[420px]
          bg-white border-l
          shadow-xl z-50
          transform transition duration-300
          overflow-hidden
          flex flex-col
          ${
            isOpen
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >

        {/* CLOSE BUTTON */}
        <div className="flex justify-end p-4">

          <button
            onClick={onClose}
            className="
              text-gray-400
              hover:text-gray-700
              transition
            "
          >
            <X size={22} />
          </button>

        </div>

        {/* SCROLLABLE CONTENT */}
        <div
          className="
            flex-1 overflow-y-auto
    px-6 pt-4 pb-8
            space-y-6
            
          "
        >

          {/* PROFILE */}
          <div className="text-center">

            <img
              src={
                applicant.menteeProfilePicture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(applicant.menteeName)}&background=random`
              }
              className="
                w-24 h-24 rounded-full
                mx-auto border-4
                border-gray-100
                object-cover
              "
            />

            <h2 className="
              mt-4 text-[22px]
              font-semibold text-[#1F2432]
              break-words
            ">

              {applicant.menteeName}

            </h2>

            <p className="
              text-[15px]
              text-primary font-medium
              break-words
            ">

              {applicant.programName}

            </p>

            <Link to={`/profile/${applicant.menteeId}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2 inline-block">
              View Profile &rarr;
            </Link>

            {/* BADGES */}
            <div className="
              flex justify-center
              gap-3 mt-3 flex-wrap
            ">

              {/* LEVEL */}
              <span
                className={`
                  px-3 py-1 rounded-full
                  text-xs font-medium
                  ${
                    levelStyles[
                      applicant.level
                    ] ||
                    "bg-gray-100 text-gray-600"
                  }
                `}
              >

                {applicant.level}

              </span>

              {/* STATUS */}
              <span
                className={`
                  px-3 py-1 rounded-full
                  text-xs font-medium
                  ${
                    statusStyles[
                      applicant.status
                    ] ||
                    "bg-gray-100 text-gray-600"
                  }
                `}
              >

                {applicant.status}

              </span>

            </div>

          </div>

          {/* INFO */}
          <div>

            <h4 className="
              text-xs font-semibold
              text-gray-400 uppercase
              mb-3
            ">
              Applicant Info
            </h4>

            <div className="
              space-y-4 text-sm
            ">

              {/* APPLIED DATE */}
              <div className="
                flex justify-between
                gap-4
              ">

                <span className="text-gray-500">
                  Applied Date
                </span>

                <span className="
                  font-medium text-right
                ">

                  {new Date(
                    applicant.appliedAt
                  ).toLocaleDateString()}

                </span>

              </div>

              {/* EDUCATION */}
              <div className="
                flex justify-between
                gap-4
              ">

                <span className="text-gray-500">
                  Education
                </span>

                <span className="
                  font-medium text-right
                  break-words
                ">

                  {applicant.education ||
                    "Not provided"}

                </span>

              </div>

            </div>

          </div>

          {/* BIO */}
          {applicant.bio && (

            <div>

              <h4 className="
                text-xs font-semibold
                text-gray-400 uppercase
                mb-3
              ">
                Bio
              </h4>

              <div className="
                bg-gray-50 p-4
                rounded-2xl
                text-sm text-gray-600
                leading-7 break-words
              ">

                {applicant.bio}

              </div>

            </div>
          )}

          {/* ANSWERS */}
          {applicant.answers?.length > 0 && (

            <div>

              <h4 className="
                text-xs font-semibold
                text-gray-400 uppercase
                mb-4
              ">
                Application Answers
              </h4>

              <div className="space-y-4">

                {applicant.answers.map(
                  (
                    answer: any,
                    index: number
                  ) => (

                    <div
                      key={index}
                      className="
                        border rounded-2xl
                        p-4 bg-gray-50
                      "
                    >

                      <p className="
                        text-sm font-semibold
                        text-[#1F2432]
                        mb-2
                        break-words
                      ">

                        {answer.questionText}

                      </p>

                      <p className="
                        text-sm text-gray-600
                        leading-7 break-words
                      ">

                        {answer.answerText}

                      </p>

                    </div>
                  )
                )}

              </div>

            </div>
          )}

        </div>

        {/* STICKY ACTIONS */}
        <div
          className="
            border-t bg-white
            px-6 py-4
            space-y-3
            sticky bottom-0
          "
        >

          {/* ACCEPT */}
          <button
            disabled={
              applicant.status ===
              "Accepted"
            }
            onClick={() =>
              onAccept(
                applicant.applicationId
              )
            }
            className={`
              w-full flex items-center
              justify-center gap-2
              py-3 rounded-xl
              font-medium transition
              ${
                applicant.status ===
                "Accepted"
                  ? `
                    bg-gray-200
                    text-gray-400
                    cursor-not-allowed
                  `
                  : `
                    bg-[#1FA38A]
                    text-white
                    hover:opacity-90
                  `
              }
            `}
          >

            <CheckCircle size={18} />

            Accept Application

          </button>

          {/* REJECT */}
          <button
            disabled={
              applicant.status ===
              "Rejected"
            }
            onClick={() =>
              onReject(
                applicant.applicationId
              )
            }
            className={`
              w-full flex items-center
              justify-center gap-2
              py-3 rounded-xl
              font-medium transition border
              ${
                applicant.status ===
                "Rejected"
                  ? `
                    bg-gray-100
                    text-gray-400
                    cursor-not-allowed
                  `
                  : `
                    text-gray-600
                    hover:bg-gray-50
                  `
              }
            `}
          >

            <XCircle size={18} />

            Reject Application

          </button>

        </div>

      </div>
    </>
  );
}