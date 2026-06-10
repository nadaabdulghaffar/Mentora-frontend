import { toast, type ToastOptions } from 'react-hot-toast';

/**
 * Standardized toast notifications for the application.
 * Uses react-hot-toast under the hood to ensure a single source of truth for styling and behavior.
 */

export const notifySuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, options);
};

export const notifyError = (message: string, options?: ToastOptions) => {
  return toast.error(message, options);
};

export const notifyInfo = (message: string, options?: ToastOptions) => {
  return toast(message, options);
};
