import { useState } from 'react';
import CreateProgramModal from './CreateProgramModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProgramModalWrapper({ isOpen, onClose }: Props) {
  // State management is here in the wrapper to avoid hook issues
  const [key, setKey] = useState(0);

  const handleClose = () => {
    onClose();
    // Force remount of modal
    setKey(prev => prev + 1);
  };

  if (!isOpen) return null;

  return (
    <CreateProgramModal
      key={key}
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
}
