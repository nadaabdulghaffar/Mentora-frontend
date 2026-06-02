export const COMMUNITY_NAME_MIN_LENGTH = 3;
export const COMMUNITY_NAME_MAX_LENGTH = 100;
export const COMMUNITY_DESCRIPTION_MAX_LENGTH = 1000;

export type CommunityFieldErrors = {
  domainId?: string;
  name?: string;
  description?: string;
  coverImage?: string;
};

export function validateCommunityName(
  name: string
): { valid: boolean; message?: string } {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, message: "Community name is required." };
  }

  if (trimmed.length < COMMUNITY_NAME_MIN_LENGTH) {
    return {
      valid: false,
      message: `Community name must be at least ${COMMUNITY_NAME_MIN_LENGTH} characters.`,
    };
  }

  if (trimmed.length > COMMUNITY_NAME_MAX_LENGTH) {
    return {
      valid: false,
      message: `Community name must be at most ${COMMUNITY_NAME_MAX_LENGTH} characters.`,
    };
  }

  return { valid: true };
}

export function validateCommunityDescription(
  description: string
): { valid: boolean; message?: string } {
  if (description.length > COMMUNITY_DESCRIPTION_MAX_LENGTH) {
    return {
      valid: false,
      message: `Description must be at most ${COMMUNITY_DESCRIPTION_MAX_LENGTH} characters.`,
    };
  }

  return { valid: true };
}

export function validateCommunityDomainId(
  domainId: string | number
): { valid: boolean; message?: string } {
  const parsed =
    typeof domainId === "number"
      ? domainId
      : Number(domainId);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return { valid: false, message: "Please select a domain." };
  }

  return { valid: true };
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateCommunityImageFile(
  file: File
): { valid: boolean; message?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: "Cover image must be a JPG or PNG file.",
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      message: "Cover image must be 5 MB or smaller.",
    };
  }

  return { valid: true };
}

export function validateCreateCommunityForm(values: {
  domainId: string;
  name: string;
  description: string;
}): CommunityFieldErrors {
  const errors: CommunityFieldErrors = {};

  const domainValidation = validateCommunityDomainId(
    values.domainId
  );
  if (!domainValidation.valid) {
    errors.domainId = domainValidation.message;
  }

  const nameValidation = validateCommunityName(
    values.name
  );
  if (!nameValidation.valid) {
    errors.name = nameValidation.message;
  }

  const descriptionValidation =
    validateCommunityDescription(values.description);
  if (!descriptionValidation.valid) {
    errors.description = descriptionValidation.message;
  }

  return errors;
}

export function validateUpdateCommunityForm(values: {
  domainId: number;
  name: string;
  description: string;
}): CommunityFieldErrors {
  const errors: CommunityFieldErrors = {};

  const domainValidation = validateCommunityDomainId(
    values.domainId
  );
  if (!domainValidation.valid) {
    errors.domainId = domainValidation.message;
  }

  const nameValidation = validateCommunityName(
    values.name
  );
  if (!nameValidation.valid) {
    errors.name = nameValidation.message;
  }

  const descriptionValidation =
    validateCommunityDescription(values.description);
  if (!descriptionValidation.valid) {
    errors.description = descriptionValidation.message;
  }

  return errors;
}
