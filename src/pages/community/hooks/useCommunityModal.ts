/**
 * useCommun Modal Hook
 * Manages modal state for community flow (thread detail, create post, settings)
 */

import { useState, useCallback } from 'react';
import type { CommunityThread, ModalState } from '../types';

export const useCommunityModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: null,
  });

  const openThreadModal = useCallback((threadId: string) => {
    setModalState({
      isOpen: true,
      type: 'thread',
      data: { threadId },
    });
  }, []);

  const openCreateModal = useCallback(() => {
    setModalState({
      isOpen: true,
      type: 'create',
      data: undefined,
    });
  }, []);

  const openEditPostModal = useCallback((thread: CommunityThread) => {
    setModalState({
      isOpen: true,
      type: 'create',
      data: { editingThread: thread },
    });
  }, []);

  const openSettingsModal = useCallback(() => {
    setModalState({
      isOpen: true,
      type: 'settings',
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      type: null,
      data: undefined,
    });
  }, []);

  const updateModalData = useCallback((data: Partial<ModalState['data']>) => {
    setModalState((prev) => ({
      ...prev,
      data: { ...prev.data, ...data },
    }));
  }, []);

  const editingThread = modalState.data?.editingThread;

  return {
    modalState,
    openThreadModal,
    openCreateModal,
    openEditPostModal,
    openSettingsModal,
    closeModal,
    updateModalData,
    isOpen: modalState.isOpen,
    modalType: modalState.type,
    editingThread,
  };
};
