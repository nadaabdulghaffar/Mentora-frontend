import { Alert } from '../Alert';

interface ProfileToastProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

/** Fixed-position toast using the shared Alert component. */
export function ProfileToast({ type, message, onClose }: ProfileToastProps) {
  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[200] w-full max-w-sm px-4 sm:px-0"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto shadow-lg">
        <Alert type={type} message={message} onClose={onClose} duration={5000} />
      </div>
    </div>
  );
}
