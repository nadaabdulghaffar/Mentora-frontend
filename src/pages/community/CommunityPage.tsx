/**
 * CommunityPage Component
 * Main community page orchestrating all sections and features
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CommunitySidebar } from '../../components/community/CommunitySidebar';
import Layout from '../../shared/components/Layout';
import { CreatePostForm } from '../../components/community/CreatePostForm';
import { ThreadModal } from '../../components/community/ThreadModal';
import {
  CommunityHeaderSection,
  CommunityFeedSection,
  CommunityMembersSection,
  CommunitySettingsSection,
  CommunityTab,
} from './sections';
import { useCommunityModal, useThreads, useCommunity } from './hooks';
import { MOCK_COMMUNITY, MOCK_COMMUNITY_THREADS, MOCK_MEMBERS, MOCK_MEMBER_REQUESTS, COMMUNITY_CATEGORIES } from './constants';
import { CommunityThread, ThreadComment, CreateThreadPayload } from './types';

/**
 * CommunityPage - Main community component
 *
 * Architecture:
 * - Uses custom hooks for state management (useCommunityModal, useThreads, useCommunity)
 * - Organized into reusable sections (Header, Feed, Members, Settings)
 * - Separation of concerns: UI components vs business logic
 * - Dynamic rendering with mapping for threads and members
 * - Reusable modal component for thread details
 *
 * Features:
 * - Discussion feed with search, sort, and filter
 * - Member management with admin features
 * - Create post form
 * - Thread detail modal
 * - Community info sidebar
 * - Settings management
 */
const CommunityPage: React.FC = () => {
  // State Management
  const modalState = useCommunityModal();
  const threads = useThreads({ initialThreads: MOCK_COMMUNITY_THREADS });
  const community = useCommunity({
    initialCommunity: MOCK_COMMUNITY,
    initialMembers: MOCK_MEMBERS,
    initialRequests: MOCK_MEMBER_REQUESTS,
  });

  const [activeTab, setActiveTab] = useState<CommunityTab>('discussion');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Temporary: current user id - replace with real auth context
  const currentUserId = 'marcus-thorne';
  const navigate = useNavigate();
  const params = useParams();
  const viewingCommunityId = params.id;

  // if viewing by id, load that community (mock)
  const activeCommunity = useMemo(() => {
    if (!viewingCommunityId) return community.community;
    // Keep the hero in sync with the editable community state.
    return community.community;
  }, [viewingCommunityId, community.community]);

  // ============================================
  // Thread Operations
  // ============================================

  const handleCreatePost = useCallback(() => {
    modalState.openCreateModal();
  }, [modalState]);

  const handleThreadEditRequest = useCallback(
    (thread: CommunityThread) => {
      modalState.openEditPostModal(thread);
    },
    [modalState]
  );

  const handleThreadSubmit = useCallback(
    async (payload: CreateThreadPayload) => {
      const editing = modalState.editingThread;
      if (editing) {
        threads.updateThread(editing.id, {
          content: payload.content,
          ...(editing.title != null ? { title: payload.title?.trim() ?? '' } : {}),
          attachments: payload.attachments,
        });
        modalState.closeModal();
        return;
      }

      // Simulate API call
      const newThread: CommunityThread = {
        id: `thread-${Date.now()}`,
        authorId: currentUserId,
        authorName: 'You',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
        content: payload.content,
        timestamp: new Date().toISOString(),
        likes: 0,
        commentCount: 0,
        shareCount: 0,
        comments: [],
        category: payload.category,
        attachments: payload.attachments,
        isLiked: false,
        isSaved: false,
        canEdit: true,
        canDelete: true,
      };

      threads.addThread(newThread);
      modalState.closeModal();
    },
    [threads, modalState, currentUserId]
  );

  const handleThreadClick = useCallback(
    (thread: CommunityThread) => {
      threads.setSelectedThread(thread);
      modalState.openThreadModal(thread.id);
    },
    [threads, modalState]
  );

  const handleThreadLike = useCallback(() => {
    if (threads.selectedThread) {
      threads.toggleThreadLike(threads.selectedThread.id);
    }
  }, [threads]);

  const handleThreadSave = useCallback(() => {
    if (threads.selectedThread) {
      threads.toggleThreadSave(threads.selectedThread.id);
    }
  }, [threads]);

  // ============================================
  // Comment Operations
  // ============================================

  const handleCommentSubmit = useCallback(
    (content: string) => {
      if (!threads.selectedThread) return;

      const newComment: ThreadComment = {
        id: `comment-${Date.now()}`,
        authorId: currentUserId,
        authorName: 'You',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
        content,
        timestamp: 'Just now',
        likes: 0,
        isLiked: false,
        canEdit: true,
        canDelete: true,
      };

      threads.addComment(threads.selectedThread.id, newComment);
    },
    [threads, currentUserId]
  );

  const handleCommentLike = useCallback(
    (commentId: string) => {
      const threadId = threads.selectedThread?.id;
      if (!threadId) return;
      threads.toggleCommentLike(threadId, commentId);
    },
    [threads.selectedThread?.id, threads.toggleCommentLike]
  );

  const handleCommentReply = useCallback(
    (parentCommentId: string, content: string) => {
      const threadId = threads.selectedThread?.id;
      if (!threadId) return;
      const reply: ThreadComment = {
        id: `reply-${Date.now()}`,
        authorId: currentUserId,
        authorName: 'You',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
        content,
        timestamp: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        replies: [],
        canEdit: true,
        canDelete: true,
      };
      threads.addReplyToComment(threadId, parentCommentId, reply);
    },
    [threads.selectedThread?.id, threads.addReplyToComment, currentUserId]
  );

  const handleCommentDelete = useCallback(
    (commentId: string) => {
      const threadId = threads.selectedThread?.id;
      if (!threadId) return;
      threads.deleteComment(threadId, commentId);
    },
    [threads.selectedThread?.id, threads.deleteComment]
  );

  const handleCommentEdit = useCallback(
    (commentId: string, content: string) => {
      const threadId = threads.selectedThread?.id;
      if (!threadId) return;
      threads.editComment(threadId, commentId, content);
    },
    [threads.selectedThread?.id, threads.editComment]
  );

  const handleThreadDelete = useCallback(
    (threadId: string) => {
      threads.deleteThread(threadId);
      modalState.closeModal();
    },
    [threads.deleteThread, modalState]
  );

  // ============================================
  // Member Operations
  // ============================================

  const handleApproveMember = useCallback(
    (requestId: string) => {
      community.approveMemberRequest(requestId);
    },
    [community]
  );

  const handleRejectMember = useCallback(
    (requestId: string) => {
      community.rejectMemberRequest(requestId);
    },
    [community]
  );

  // Admin / member actions
  const handleRemoveMember = useCallback((memberId: string) => {
    community.removeMember(memberId);
  }, [community]);

  const handleBanMember = useCallback((memberId: string) => {
    // In mock: remove member and optionally add to banned list (not implemented)
    community.removeMember(memberId);
  }, [community]);

  const handleChangeMemberRole = useCallback(
    (memberId: string, newRole: 'Owner' | 'Admin' | 'member') => {
      community.updateMemberRole(memberId, newRole);
    },
    [community]
  );

  // ============================================
  // Community Join/Leave Operations
  // ============================================

  const handleJoinCommunity = useCallback(() => {
    community.updateCommunitySettings({ isJoined: true });
  }, [community]);

  const handleLeaveCommunity = useCallback(() => {
    community.updateCommunitySettings({ isJoined: false });
  }, [community]);

  const isCurrentUserAdmin = community.isAdmin(currentUserId);

  // ============================================
  // Render
  // ============================================

  const selectedThread = threads.selectedThread;

  return (
    <Layout>
      <div className="min-h-screen bg-transparent">
      {viewingCommunityId && (
        <div className="mb-4">
          <button
            onClick={() => navigate('/community')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:underline"
          >
            ← Back to Communities
          </button>
        </div>
      )}
      <div className="py-6">
        <div className="grid gap-6 grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="col-span-2 space-y-6">
            {/* Header */}
              {/* Community Hero (cover, avatar, meta, actions) */}
              <div className="rounded-lg bg-card shadow-sm">
                <div className="relative">
                  <div className="h-36 w-full bg-gradient-to-r from-primary to-primary-dark overflow-hidden">
                    {activeCommunity.cover && (
                      <img
                        src={activeCommunity.cover}
                        alt={activeCommunity.name}
                        className="h-36 w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="-mt-8 px-6 pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-end gap-4">
                        <img
                          src={activeCommunity.avatar}
                          alt={activeCommunity.name}
                          className="h-20 w-20 rounded-full border-4 border-card object-cover"
                        />
                        <div>
                          <h2 className="text-xl font-bold text-slate-800">{activeCommunity.name}</h2>
                          <div className="mt-1 flex items-center gap-3 text-sm text-muted">
                            <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-primary">{activeCommunity.domain}</span>
                            <span>{activeCommunity.memberCount.toLocaleString()} members</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {activeCommunity.isJoined ? (
                          <button className="rounded-full bg-card border px-4 py-2 text-sm font-medium">Joined</button>
                        ) : (
                          <button onClick={handleJoinCommunity} className="rounded-full bg-card border px-4 py-2 text-sm font-medium">Join</button>
                        )}
                        <button className="rounded-full bg-primary text-white px-4 py-2 text-sm font-medium">Invite</button>
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Settings button clicked');
                            modalState.openSettingsModal();
                          }}
                          className="rounded-full p-2 text-gray-500 bg-card border hover:bg-gray-100 transition cursor-pointer"
                          aria-label="Settings"
                        >
                          •••
                        </button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <CommunityHeaderSection
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                      />
                    </div>
                  </div>
                </div>
              </div>

            {/* Tab Content */}
            {activeTab === 'discussion' && (
              <CommunityFeedSection
                threads={threads.threads}
                isLoading={false}
                onThreadClick={handleThreadClick}
                onLike={threads.toggleThreadLike}
                onSave={threads.toggleThreadSave}
                onShare={(threadId) => {
                  // Share logic
                }}
                onCreatePost={handleCreatePost}
                currentUserId={currentUserId}
                onThreadEditRequest={handleThreadEditRequest}
                onThreadDelete={handleThreadDelete}
              />
            )}

            {activeTab === 'members' && (
              <CommunityMembersSection
                members={community.allMembers}
                staffMembers={community.staffMembers}
                searchQuery={community.searchQuery}
                onSearchChange={community.setSearchQuery}
                onFollowMember={(memberId) => {
                  // Follow logic
                }}
                onUnfollowMember={(memberId) => {
                  // Unfollow logic
                }}
                onMessageMember={(memberId) => {
                  // Message logic
                }}
                currentUserId={currentUserId}
                onRemoveMember={handleRemoveMember}
                onBanMember={handleBanMember}
                onChangeMemberRole={handleChangeMemberRole}
              />
            )}



            {/* Settings opens in modal for admins */}
          </div>

          {/* Sidebar - 1 column (always visible & sticky) */}
          <div className="sticky top-24 self-start">
            <CommunitySidebar
              community={community.community}
              onSettings={() => setActiveTab('discussion')}
              onShare={() => {
                // Share community logic
              }}
              onJoin={handleJoinCommunity}
              onLeave={handleLeaveCommunity}
            />
          </div>
        </div>
      </div>

      {/* Modals */}

      {/* Create / Edit Post Modal */}
      {modalState.modalType === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {modalState.editingThread ? 'Edit discussion' : 'Start a Discussion'}
            </h2>
            <CreatePostForm
              formKey={modalState.editingThread?.id ?? 'new'}
              initialContent={modalState.editingThread?.content}
              initialTitle={modalState.editingThread?.title}
              initialAttachments={modalState.editingThread?.attachments}
              showTitleField={Boolean(modalState.editingThread && modalState.editingThread.title != null)}
              variant={modalState.editingThread ? 'edit' : 'create'}
              onSubmit={handleThreadSubmit}
              onCancel={modalState.closeModal}
              authorAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=You"
              authorName="You"
              isLoading={isCreatingPost}
            />
          </div>
        </div>
      )}

      {/* Thread Detail Modal */}
      {modalState.modalType === 'thread' && selectedThread && (
        <ThreadModal
          isOpen={modalState.isOpen}
          onClose={modalState.closeModal}
          thread={selectedThread}
          onCommentSubmit={handleCommentSubmit}
          onCommentReply={handleCommentReply}
          onCommentLike={handleCommentLike}
          onCommentDelete={handleCommentDelete}
          onCommentEdit={handleCommentEdit}
          onThreadLike={handleThreadLike}
          onThreadSave={handleThreadSave}
          onThreadEditRequest={handleThreadEditRequest}
          onThreadDelete={handleThreadDelete}
          isLoadingComment={isLoadingComment}
          currentUserId={currentUserId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900">Delete Community?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this community? This action cannot be undone and all data will be lost.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                No, Keep it
              </button>
              <button
                onClick={() => {
                  console.log('Community deleted');
                  setShowDeleteConfirm(false);
                  modalState.closeModal();
                  navigate('/community');
                }}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal for admins */}
      {modalState.modalType === 'settings' ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-12"
          onClick={() => {
            console.log('Closing modal');
            modalState.closeModal();
          }}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <CommunitySettingsSection
              community={activeCommunity}
              onSave={community.updateCommunitySettings}
              onClose={modalState.closeModal}
              isLoading={false}
              onDelete={() => setShowDeleteConfirm(true)}
            />
          </div>
        </div>
      ) : null}
      </div>
    </Layout>
  );
};

export default CommunityPage;
