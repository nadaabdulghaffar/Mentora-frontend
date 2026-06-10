import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { Modal } from '../../../components/Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSave?: (payload: { email: string; pushNotifications: boolean }) => void;
}

export function SettingsModal({ isOpen, onClose, initialEmail = '', onSave }: SettingsModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [push, setPush] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
    }
  }, [isOpen, initialEmail]);

  const handleSave = () => {
    onSave?.({ email, pushNotifications: push });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-lg p-0 overflow-hidden">
      <div className="flex items-center border-b border-[#ECEFF5] px-6 py-4">
        <div className="flex items-center gap-2">
          <Settings className="text-primary" size={22} />
          <h2 className="text-lg font-bold text-[#1F2533]">Settings</h2>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#3D4559]">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[#D8DCE8] px-4 py-3 text-sm outline-none transition focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#3D4559]">Password</label>
          <div className="relative">
            <input
              type="password"
              readOnly
              value="••••••••"
              className="w-full rounded-xl border border-[#D8DCE8] px-4 py-3 pr-32 text-sm"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-primary hover:underline"
            >
              Change Password
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl bg-[#F8F9FD] px-4 py-4">
          <div>
            <p className="font-semibold text-[#1F2533]">Push Notifications</p>
            <p className="mt-1 text-xs text-[#6B7289]">Alerts for new messages and upcoming session reminders</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={push}
            onClick={() => setPush(!push)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${push ? 'bg-primary' : 'bg-[#C5CAD8]'}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${push ? 'left-6' : 'left-1'}`}
            />
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-[#ECEFF5] px-6 py-4">
        <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-[#5C6378] hover:bg-[#F4F5FA]">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
}
