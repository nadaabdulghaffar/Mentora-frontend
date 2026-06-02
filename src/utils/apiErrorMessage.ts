import axios from 'axios';

type ApiErrorBody = {
  message?: string;
  errors?: string[] | Record<string, string[]>;
};

/** Prefer API `message` (or validation errors) over generic Axios status text. */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;

    if (data?.message?.trim()) {
      return data.message.trim();
    }

    if (Array.isArray(data?.errors) && data.errors[0]) {
      return String(data.errors[0]);
    }

    if (data?.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
      const firstField = Object.values(data.errors)[0];
      if (Array.isArray(firstField) && firstField[0]) {
        return String(firstField[0]);
      }
    }
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const data = (error as { response?: { data?: ApiErrorBody } }).response?.data;

    if (data?.message?.trim()) {
      return data.message.trim();
    }
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    if (message && !/^Request failed with status code \d+$/i.test(message)) {
      return message;
    }
  }

  return fallback;
}
