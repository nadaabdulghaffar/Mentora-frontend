
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";

import BaseModal from "../modals/BaseModal";
import CommunityFormFields from "./CommunityFormFields";

import {
  createCommunity,
  extractErrorMessage,
  getCommunityById,
} from "../../services/communityService";
import { uploadCommunityCoverImage } from "../../services/fileUploadService";
import {
  validateCreateCommunityForm,
  type CommunityFieldErrors,
} from "../../validators/community";
import { ensureDomainsLoaded } from "../../utils/domainCache";
import { mapCommunityDetails } from "../../pages/community/mappers/communityDetails.mapper";
import type { Community } from "../../pages/community/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (community: Community) => void;
};

type CommunityFormData = {
  domainId: string;
  name: string;
  description: string;
  coverImageUrl: string;
};

export default function CreateCommunityModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CommunityFormData>({
    defaultValues: {
      domainId: "",
      name: "",
      description: "",
      coverImageUrl: "",
    },
  });

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [coverImageFile, setCoverImageFile] =
    useState<File | null>(null);

  const [coverPreviewUrl, setCoverPreviewUrl] =
    useState("");

  const [coverUploadError, setCoverUploadError] =
    useState<string | null>(null);

  const [isUploadingCover, setIsUploadingCover] =
    useState(false);

  const values = watch();

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      setCoverUploadError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  const hasChanges =
    values.domainId?.trim().length > 0 ||
    values.name?.trim().length > 0 ||
    values.description?.trim().length > 0 ||
    values.coverImageUrl?.trim().length > 0 ||
    coverImageFile !== null;

  const applyFieldErrors = (
    errors: CommunityFieldErrors
  ) => {
    clearErrors();

    (
      Object.entries(errors) as Array<
        [keyof CommunityFieldErrors, string]
      >
    ).forEach(([field, message]) => {
      if (field === "coverImage") {
        setCoverUploadError(message);
        return;
      }

      setError(field as keyof CommunityFormData, {
        type: "manual",
        message,
      });
    });
  };

  const resetFormState = () => {
    reset();
    setCoverImageFile(null);
    setCoverUploadError(null);

    if (coverPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    setCoverPreviewUrl("");
  };

  const submitHandler = async (
    data: CommunityFormData
  ) => {
    setSubmitError(null);
    setCoverUploadError(null);

    const fieldErrors =
      validateCreateCommunityForm(data);

    if (Object.keys(fieldErrors).length > 0) {
      applyFieldErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      let coverImageUrl =
        data.coverImageUrl.trim() || undefined;

      if (coverImageFile) {
        setIsUploadingCover(true);

        try {
          coverImageUrl =
            await uploadCommunityCoverImage(
              coverImageFile
            );
          setValue(
            "coverImageUrl",
            coverImageUrl
          );
        } catch (uploadError) {
          const message =
            uploadError instanceof Error
              ? uploadError.message
              : "Failed to upload cover image.";

          setCoverUploadError(message);
          return;
        } finally {
          setIsUploadingCover(false);
        }
      }

      const communityId =
        await createCommunity({
          name: data.name,
          description: data.description,
          domainId: Number(data.domainId),
          coverImageUrl,
        });

      await ensureDomainsLoaded();

      const createdCommunity =
        await getCommunityById(
          communityId
        );

      const mappedCommunity =
        mapCommunityDetails(
          createdCommunity
        );

      resetFormState();

      await onSuccess?.(mappedCommunity);

      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setSubmitError(
          extractErrorMessage(err)
        );
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
      setIsUploadingCover(false);
    }
  };

  const handleDiscard = () => {
    resetFormState();
    setSubmitError(null);
    onClose();
  };

  const footer = (
    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
      <button
        type="button"
        onClick={onClose}
        className="h-11 px-6 rounded-xl border border-gray-200 hover:bg-gray-50"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={handleSubmit(submitHandler)}
        disabled={
          isSubmitting ||
          isUploadingCover
        }
        className="h-11 px-6 rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {isSubmitting
          ? isUploadingCover
            ? "Uploading cover…"
            : "Creating…"
          : "Create Community"}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onDiscard={handleDiscard}
      title="Create Community"
      subtitle="Build a focused space where members connect and grow together."
      width="lg:max-w-5xl"
      hasChanges={hasChanges}
      footer={footer}
    >
      {submitError && (
        <p
          className="text-sm text-red-600 mb-4 whitespace-pre-wrap"
          role="alert"
        >
          {submitError}
        </p>
      )}

      <CommunityFormFields
        register={register}
        values={values}
        setValue={setValue}
        errors={errors}
        coverPreviewUrl={coverPreviewUrl}
        coverUploadError={coverUploadError}
        isUploadingCover={isUploadingCover}
        onCoverFileChange={(
          file,
          previewUrl,
          errorMessage
        ) => {
          setCoverImageFile(file);
          setCoverPreviewUrl(previewUrl);
          setCoverUploadError(errorMessage);
          setValue("coverImageUrl", "");
        }}
      />
    </BaseModal>
  );
}
