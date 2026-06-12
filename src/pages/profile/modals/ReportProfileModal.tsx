import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { InputGroup, SelectField, TextAreaField, type Option } from '../../../components/MultiStepForm';
import { reportService } from '../../../services/reportService';
import { notifySuccess, notifyError } from '../../../utils/toast';
import { ReportTargetType, type ReportReason } from '../../../types/report.types';

interface ReportProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
}

const REASON_OPTIONS: Option[] = [
  { label: 'Spam', value: 'Spam' },
  { label: 'Harassment', value: 'Harassment' },
  { label: 'Fake Profile', value: 'FakeProfile' },
  { label: 'Inappropriate Content', value: 'InappropriateContent' },
  { label: 'Scam', value: 'Scam' },
  { label: 'Other', value: 'Other' },
];

export function ReportProfileModal({ isOpen, onClose, targetId }: ReportProfileModalProps) {
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason) {
      setError('Please select a reason for reporting.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await reportService.submitReport({
        targetType: ReportTargetType.User,
        targetId,
        ownerUserId: targetId,
        reason: reason as ReportReason,
        description: description.trim() || undefined,
      });

      if (response.success) {
        notifySuccess('Report submitted successfully. Our team will review it shortly.');
        setReason('');
        setDescription('');
        onClose();
      } else {
        setError(response.message || 'Failed to submit report. Please try again.');
        notifyError(response.message || 'Failed to submit report.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      notifyError('An error occurred while submitting the report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-md p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ECEFF5] px-6 py-4">
        <div className="flex items-center gap-2">
          <Flag className="text-red-500" size={20} />
          <h2 className="text-lg font-bold text-[#1F2533]">Report Profile</h2>
        </div>
      </div>

      <div className="space-y-4 px-6 py-6">
        <p className="text-sm text-[#6B7289]">
          Please let us know why you are reporting this profile. Your report will be kept confidential and reviewed by our moderation team.
        </p>

        <InputGroup label="Reason" htmlFor="reason">
          <SelectField
            id="reason"
            value={reason}
            onChange={setReason}
            options={REASON_OPTIONS}
            placeholder="Select a reason"
          />
        </InputGroup>

        <InputGroup label="Description (Optional)" htmlFor="description">
          <TextAreaField
            id="description"
            value={description}
            onChange={setDescription}
            rows={4}
            placeholder="Provide additional details to help us understand the issue..."
            maxLength={500}
          />
        </InputGroup>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#ECEFF5] bg-[#FBFCFF] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-xl px-5 py-2 text-sm font-semibold text-[#6B7289] transition hover:bg-[#F0F2F8] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !reason}
          className="rounded-xl bg-red-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </Modal>
  );
}
