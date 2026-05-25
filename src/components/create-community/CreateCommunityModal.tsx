
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";

import BaseModal from "../modals/BaseModal";
import CommunityFormFields from "./CommunityFormFields";

import {
  createCommunity,
  extractErrorMessage,
} from "../../services/communityService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
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
}: Props) {
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
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

  const values = watch();

  /* =========================
     CHANGES DETECTION
  ========================= */

  const hasChanges =
    values.domainId?.trim().length > 0 ||
    values.name?.trim().length > 0 ||
    values.description?.trim().length > 0 ||
    values.coverImageUrl?.trim().length > 0;

  /* =========================
     SUBMIT
  ========================= */

  const submitHandler = async (
    data: CommunityFormData
  ) => {
    setSubmitError(null);

    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        domainId: Number(data.domainId),
      };

      await createCommunity(payload);

      reset();

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
          "Something went wrong"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     DISCARD
  ========================= */

  const handleDiscard = () => {
    reset();

    onClose();
  };

  /* =========================
     FOOTER
  ========================= */

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
        disabled={isSubmitting}
        className="h-11 px-6 rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {isSubmitting
          ? "Creating…"
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
      />
    </BaseModal>
  );
}

