
import { useEffect, useState } from "react";
import { UploadCloud } from "lucide-react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

import lookupAPI from "../../services/lookupService";
import {
  validateCommunityImageFile,
  COMMUNITY_DESCRIPTION_MAX_LENGTH,
  COMMUNITY_NAME_MAX_LENGTH,
} from "../../validators/community";
import { getDomainName } from "../../utils/domainCache";

type CommunityFormData = {
  domainId: string;
  name: string;
  description: string;
  coverImageUrl: string;
};

type Props = {
  register: UseFormRegister<CommunityFormData>;
  values: CommunityFormData;
  setValue: UseFormSetValue<CommunityFormData>;
  coverPreviewUrl: string;
  coverUploadError?: string | null;
  isUploadingCover?: boolean;
  onCoverFileChange: (
    file: File | null,
    previewUrl: string,
    errorMessage: string | null
  ) => void;
  errors?: FieldErrors<CommunityFormData>;
};

type DomainOption = {
  id: number;
  name: string;
};

export default function CommunityFormFields({
  register,
  values,
  coverPreviewUrl,
  coverUploadError,
  isUploadingCover = false,
  onCoverFileChange,
  errors,
}: Props) {
  const [domains, setDomains] = useState<
    DomainOption[]
  >([]);
  const [loadingDomains, setLoadingDomains] =
    useState(true);

  useEffect(() => {
    const loadDomains = async () => {
      try {
        const response =
          await lookupAPI.getDomains();

        if (response.success && response.data) {
          setDomains(
            response.data.map((domain) => ({
              id: Number(domain.id),
              name: domain.name,
            }))
          );
        }
      } catch (error) {
        console.error(
          "Failed to load domains",
          error
        );
      } finally {
        setLoadingDomains(false);
      }
    };

    loadDomains();
  }, []);

  const selectedDomainName =
    domains.find(
      (domain) =>
        String(domain.id) ===
        values.domainId
    )?.name ||
    getDomainName(Number(values.domainId));

  const previewCover =
    coverPreviewUrl ||
    values.coverImageUrl;

  const handleCoverImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0] || null;

    if (!file) {
      onCoverFileChange(null, "", null);
      return;
    }

    const validation =
      validateCommunityImageFile(file);

    if (!validation.valid) {
      onCoverFileChange(
        null,
        "",
        validation.message || "Invalid image file."
      );
      event.target.value = "";
      return;
    }

    const previewUrl =
      URL.createObjectURL(file);

    onCoverFileChange(
      file,
      previewUrl,
      null
    );
    event.target.value = "";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-5">
        <div>
          <label className="block mb-2 text-sm font-semibold text-slateInk">
            Domain
          </label>

          <select
            {...register("domainId", {
              required: "Please select a domain.",
            })}
            className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:border-primary"
            disabled={loadingDomains}
          >
            <option value="">
              {loadingDomains
                ? "Loading domains…"
                : "Select domain"}
            </option>

            {domains.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>

          {errors?.domainId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.domainId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-slateInk">
            Community Name
          </label>

          <input
            {...register("name", {
              required:
                "Community name is required.",
              minLength: {
                value: 3,
                message:
                  "Community name must be at least 3 characters.",
              },
              maxLength: {
                value: COMMUNITY_NAME_MAX_LENGTH,
                message: `Community name must be at most ${COMMUNITY_NAME_MAX_LENGTH} characters.`,
              },
            })}
            placeholder="Enter community name"
            className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:border-primary"
          />

          {errors?.name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-slateInk">
            Description
          </label>

          <textarea
            {...register("description", {
              maxLength: {
                value:
                  COMMUNITY_DESCRIPTION_MAX_LENGTH,
                message: `Description must be at most ${COMMUNITY_DESCRIPTION_MAX_LENGTH} characters.`,
              },
            })}
            rows={5}
            placeholder="Tell members what this community is about..."
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none resize-none focus:border-primary"
          />

          {errors?.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-slateInk">
            Cover Image
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center hover:border-primary">
            <UploadCloud className="mb-2 h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-slateInk">
              {isUploadingCover
                ? "Uploading cover image…"
                : "Upload cover image"}
            </span>
            <span className="mt-1 text-xs text-gray-500">
              JPG or PNG, up to 5 MB
            </span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="hidden"
              onChange={handleCoverImageChange}
              disabled={isUploadingCover}
            />
          </label>

          {coverUploadError && (
            <p className="mt-1 text-sm text-red-600">
              {coverUploadError}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-[#F8F9FC] p-5">
        <div
          className="h-44 rounded-2xl bg-cover bg-center bg-gray-100"
          style={{
            backgroundImage: previewCover
              ? `url(${previewCover})`
              : undefined,
          }}
        />

        <div className="mt-5">
          <span className="inline-flex rounded-md bg-[#F0ECFB] px-3 py-1 text-xs font-semibold text-primary">
            {selectedDomainName || "Domain"}
          </span>

          <h3 className="mt-4 text-2xl font-bold text-slateInk line-clamp-2">
            {values.name ||
              "Community Name"}
          </h3>

          <p className="mt-3 text-sm leading-6 text-gray-500 line-clamp-4">
            {values.description ||
              "Your community preview will appear here while typing."}
          </p>

          <button
            type="button"
            className="mt-6 h-11 w-full rounded-xl bg-primary text-white font-semibold"
          >
            Join Community
          </button>
        </div>
      </div>
    </div>
  );
}
