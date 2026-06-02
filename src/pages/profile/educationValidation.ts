import type { EducationEntry } from './types';

export const EDUCATION_YEAR_MIN = 1900;

export function getEducationYearBounds() {
  const currentYear = new Date().getFullYear();
  return {
    startYearMax: currentYear + 1,
    graduationYearMax: currentYear + 10,
  };
}

export function buildYearOptions(min: number, max: number): { label: string; value: string }[] {
  const options: { label: string; value: string }[] = [{ label: 'Select year', value: '' }];
  for (let year = max; year >= min; year -= 1) {
    options.push({ label: String(year), value: String(year) });
  }
  return options;
}

export type EducationFieldErrors = {
  institution?: string;
  faculty?: string;
  degree?: string;
  startYear?: string;
  endYear?: string;
};

function willSaveEntry(entry: EducationEntry): boolean {
  return Boolean(entry.degree.trim() || entry.institution.trim());
}

/** Mirrors ProfileService.ValidateEducationRequest for entries being saved. */
export function validateEducationEntry(entry: EducationEntry): EducationFieldErrors {
  const errors: EducationFieldErrors = {};

  if (!willSaveEntry(entry)) {
    return errors;
  }

  const { startYearMax, graduationYearMax } = getEducationYearBounds();

  if (!entry.institution.trim()) {
    errors.institution = 'Institution name is required.';
  }

  const faculty = entry.faculty?.trim() ?? '';
  if (faculty.length > 255) {
    errors.faculty = 'Faculty must be 255 characters or fewer.';
  }

  const degree = entry.degree.trim();
  if (degree.length > 255) {
    errors.degree = 'Degree must be 255 characters or fewer.';
  }

  if (!entry.startYear.trim()) {
    errors.startYear = 'Please select a start year.';
  }

  if (!entry.endYear.trim()) {
    errors.endYear = 'Please select a graduation year.';
  }

  const startYear = entry.startYear.trim() ? Number(entry.startYear) : NaN;
  const graduationYear = entry.endYear.trim() ? Number(entry.endYear) : NaN;

  if (entry.startYear.trim()) {
    if (!Number.isFinite(startYear) || startYear < EDUCATION_YEAR_MIN || startYear > startYearMax) {
      errors.startYear = `Start year must be between ${EDUCATION_YEAR_MIN} and ${startYearMax}.`;
    }
  }

  if (entry.endYear.trim()) {
    if (
      !Number.isFinite(graduationYear) ||
      graduationYear < EDUCATION_YEAR_MIN ||
      graduationYear > graduationYearMax
    ) {
      errors.endYear = `Graduation year must be between ${EDUCATION_YEAR_MIN} and ${graduationYearMax}.`;
    }
  }

  if (
    Number.isFinite(startYear) &&
    Number.isFinite(graduationYear) &&
    startYear > graduationYear
  ) {
    errors.startYear = 'Start year cannot be after graduation year.';
    if (!errors.endYear) {
      errors.endYear = 'Graduation year cannot be before start year.';
    }
  }

  return errors;
}

export function validateEducationEntries(entries: EducationEntry[]): {
  valid: boolean;
  errorsById: Record<string, EducationFieldErrors>;
  formError: string | null;
} {
  const toSave = entries.filter(willSaveEntry);

  if (toSave.length === 0) {
    return {
      valid: false,
      errorsById: {},
      formError: 'Add at least one education entry with an institution or degree before saving.',
    };
  }

  const errorsById: Record<string, EducationFieldErrors> = {};
  let valid = true;

  toSave.forEach((entry) => {
    const fieldErrors = validateEducationEntry(entry);
    if (Object.keys(fieldErrors).length > 0) {
      valid = false;
      errorsById[entry.id] = fieldErrors;
    }
  });

  return {
    valid,
    errorsById,
    formError: valid ? null : 'Please fix the highlighted education fields before saving.',
  };
}
