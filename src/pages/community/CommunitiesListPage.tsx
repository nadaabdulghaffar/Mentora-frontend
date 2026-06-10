import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';

import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';

import Layout from '../../shared/components/Layout';



import { PostCard } from '../../components/community/PostCard';

import { ThreadModal } from '../../components/community/ThreadModal';

import { CreatePostForm } from '../../components/community/CreatePostForm';

import CreateCommunityModal from '../../components/create-community/CreateCommunityModal';
import { Alert } from '../../components/Alert';
import RecommendedCommunitiesCard from '../../components/dashboard components/right/RecommendedCommunitiesCard';
import { SharedCommunitySidebarCard } from '../../shared/components/SharedCommunitySidebarCard';

import {
  useThreads,
  useCommunityModal,
} from './hooks';

import {
  getMyCommunities,
  getCommunityFeed,
  togglePostLike,
  createComment,
  deleteComment,
  updateComment,
  updateCommunityPost,
  deleteCommunityPost,
} from '../../services/communityService';

import authAPI from '../../services/authService';

import {
  mapCommunitiesResponse,
} from './mappers/community.mapper';
import { mapFeedPostToThread } from './mappers/feedPost.mapper';
import { resolveAuthorAvatar } from './utils/authorAvatar';
import { ensureDomainsLoaded } from '../../utils/domainCache';
import { refreshOwnProfile } from '../profile/profileService';
import {
  useEffectRunDiagnostics,
  usePageLifecycleDiagnostics,
  withLoadingDiagnostics,
} from '../../utils/pageDiagnosticLogger';

import type {
  Community,
  CommunityThread,
  ThreadComment,
  CreateThreadPayload,
} from './types';

const PAGE_NAME = 'CommunitiesListPage';

const CommunitiesListPage: React.FC = () => {
  const navigate = useNavigate();

  const modalState =
    useCommunityModal();

  const threads = useThreads({
    initialThreads: [],
  });

  const currentUser =
    authAPI.getCurrentUser();

  const currentUserId =
    currentUser?.userId || '';

  usePageLifecycleDiagnostics(PAGE_NAME);
  useEffectRunDiagnostics(PAGE_NAME, 'fetchProfile', [currentUser?.userId]);

  const [currentUserProfile, setCurrentUserProfile] = useState<{
    displayName: string;
    avatarUrl: string;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await withLoadingDiagnostics(
          PAGE_NAME,
          'profile',
          () => refreshOwnProfile()
        );
        if (profile) {
          setCurrentUserProfile({
            displayName: profile.displayName?.trim() || (currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : 'You'),
            avatarUrl: profile.avatarUrl || '',
          });
        }
      } catch (err) {
        console.error(`[${PAGE_NAME}] Failed to load user profile`, err);
      }
    };
    fetchProfile();
  }, [currentUser?.userId]);

  const [
    isCreateCommunityOpen,
    setIsCreateCommunityOpen,
  ] = useState(false);

  const [
    isLoadingFeed,
    setIsLoadingFeed,
  ] = useState(false);

  const [feedError, setFeedError] = useState<
    string | null
  >(null);

  const [pageAlert, setPageAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { data: myCommunities = [], isLoading: isLoadingCommunities } = useQuery({
    queryKey: ['myCommunities'],
    queryFn: async () => {
      await ensureDomainsLoaded();
      const response = await getMyCommunities();
      return mapCommunitiesResponse(response);
    },
    staleTime: 5 * 60 * 1000,
  });

  /* =========================
     FETCH COMMUNITIES
  ========================= */

  useEffectRunDiagnostics(PAGE_NAME, 'loadFeed', []);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setIsLoadingFeed(true);
        setFeedError(null);

        const { items } = await withLoadingDiagnostics(
          PAGE_NAME,
          'feed',
          () => getCommunityFeed()
        );
        threads.setThreads(
          items.map(mapFeedPostToThread)
        );
      } catch (error) {
        console.error(`[${PAGE_NAME}] Failed to fetch community feed`, error);
        setFeedError('Failed to load feed');
        threads.setThreads([]);
      } finally {
        setIsLoadingFeed(false);
      }
    };

    void loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const handleThreadClick =
    useCallback(
      (
        thread: CommunityThread
      ) => {
        threads.setSelectedThread(
          thread
        );

        modalState.openThreadModal(
          thread.id
        );
      },
      [
        threads.setSelectedThread,
        modalState.openThreadModal,
      ]
    );

  const handleCommentSubmit =
    useCallback(
      async (content: string) => {
        const threadId =
          threads.selectedThread?.id;

        if (!threadId) return;

        try {
          const commentId = await createComment(
            threadId,
            content
          );

          const authorName = currentUserProfile?.displayName || (currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : 'You');
          const authorProfilePicture = currentUserProfile?.avatarUrl;
          const newComment: ThreadComment = {
            id: commentId,
            authorId: currentUserId,
            authorName,
            authorProfilePicture,
            authorAvatar: resolveAuthorAvatar(authorName, authorProfilePicture),
            content,
            timestamp: new Date().toISOString(),
            likes: 0,
            isLiked: false,
            replies: [],
            canEdit: true,
            canDelete: true,
          };

          threads.addComment(threadId, newComment);
        } catch (error) {
          console.error('Failed to create comment', error);
        }
      },
      [
        threads.selectedThread?.id,
        threads.addComment,
        currentUserId,
        currentUserProfile,
        currentUser,
      ]
    );

  const handleCommentDelete =
    useCallback(
      async (commentId: string) => {
        const threadId =
          threads.selectedThread?.id;

        if (!threadId) return;

        try {
          await deleteComment(commentId);
          threads.deleteComment(threadId, commentId);
        } catch (error) {
          console.error('Failed to delete comment', error);
        }
      },
      [
        threads.selectedThread?.id,
        threads.deleteComment,
      ]
    );

  const handleCommentEdit =
    useCallback(
      async (commentId: string, content: string) => {
        const threadId =
          threads.selectedThread?.id;

        if (!threadId) return;

        try {
          await updateComment(commentId, content);
          threads.editComment(threadId, commentId, content);
        } catch (error) {
          console.error('Failed to edit comment', error);
        }
      },
      [
        threads.selectedThread?.id,
        threads.editComment,
      ]
    );

  const handleThreadDelete =
    useCallback(
      async (threadId: string) => {
        try {
          await deleteCommunityPost(threadId);
          threads.deleteThread(threadId);
          modalState.closeModal();
        } catch (error) {
          console.error('Failed to delete post', error);
        }
      },
      [threads, modalState]
    );

  const handleThreadComposerSubmit =
    useCallback(
      async (payload: CreateThreadPayload) => {
        const editing = modalState.editingThread;

        if (!editing) return;

        try {
          const updated = await updateCommunityPost(
            editing.id,
            {
              content: payload.content,
              imageUrl: payload.attachments?.[0]?.url,
            }
          );

          threads.updateThread(editing.id, {
            content: updated.content,
            attachments: payload.attachments,
          });

          modalState.closeModal();
        } catch (error) {
          console.error('Failed to update post', error);
        }
      },
      [threads, modalState]
    );

  const handleThreadEditRequest =
    useCallback(
      (
        thread: CommunityThread
      ) => {
        modalState.openEditPostModal(
          thread
        );
      },
      [modalState]
    );

  const handleThreadLike = useCallback(
    async (threadId: string) => {
      try {
        await togglePostLike(threadId);
        threads.toggleThreadLike(threadId);
      } catch (error) {
        console.error('Failed to toggle like', error);
      }
    },
    [threads]
  );

  const selectedThread =
    threads.selectedThread;

  return (
    <Layout>
      <div className="min-h-screen bg-transparent">
        {pageAlert && (
          <div className="py-4">
            <Alert
              type={pageAlert.type}
              message={pageAlert.message}
              onClose={() => setPageAlert(null)}
            />
          </div>
        )}

        <div className="py-6">
          <div className="grid gap-6 grid-cols-3">
            <div className="col-span-2 space-y-6">

              {!isLoadingCommunities && myCommunities.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-8 py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Users size={28} aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    No joined communities yet
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-gray-600 leading-relaxed">
                    Join communities to connect with people, discover discussions,
                    and participate in mentorship activities.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/search-mentorship?tab=communities')
                    }
                    className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
                  >
                    Explore Communities →
                  </button>
                </div>
              ) : isLoadingFeed ? (
                <div className="text-sm text-gray-500 py-8 text-center">
                  Loading feed...
                </div>
              ) : feedError ? (
                <div className="text-sm text-red-600 py-8 text-center">
                  {feedError}
                </div>
              ) : threads.threads.length === 0 ? (
                <div className="text-sm text-gray-500 py-8 text-center">
                  No posts yet. Join a community to see posts here.
                </div>
              ) : (
                threads.threads.map((thread) => (
                  <PostCard
                    key={thread.id}
                    thread={thread}
                    onThreadClick={handleThreadClick}
                    onLike={handleThreadLike}
                    onShare={() => {}}
                    currentUserId={currentUserId}
                    onThreadEditRequest={
                      handleThreadEditRequest
                    }
                    onThreadDelete={handleThreadDelete}
                  />
                ))
              )}
            </div>

            <aside className="space-y-4">
              <SharedCommunitySidebarCard
                title="Joined Communities"
                communities={myCommunities.slice(0, 3).map(c => ({
                  id: c.id,
                  name: c.name,
                  avatarUrl: c.cover || c.avatar
                }))}
                isLoading={isLoadingCommunities}
                emptyMessage={
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-medium text-slate-800">
                      No joined communities yet
                    </p>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed mb-3">
                      Explore communities to start connecting.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/search-mentorship?tab=communities')}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Explore Communities →
                    </button>
                  </div>
                }
                actionText="Open"
                onActionClick={(id) => navigate(`/community/${id}`)}
                footerLinkTo={myCommunities.length > 0 ? "/my-communities" : undefined}
                footerLinkText={myCommunities.length > 0 ? "See All" : undefined}
              />

              <RecommendedCommunitiesCard />

              <button
                type="button"
                className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
                onClick={() => setIsCreateCommunityOpen(true)}
              >
                <Plus size={18} strokeWidth={2.5} aria-hidden />
                Create Community
              </button>
            </aside>
          </div>
        </div>
      </div>

      {modalState.modalType ===
        'create' &&
        modalState.editingThread && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Edit discussion
              </h2>

              <CreatePostForm
                formKey={
                  modalState
                    .editingThread.id
                }
                initialContent={
                  modalState
                    .editingThread
                    .content
                }
                initialTitle={
                  modalState
                    .editingThread
                    .title
                }
                initialAttachments={
                  modalState
                    .editingThread
                    .attachments
                }
                showTitleField={
                  modalState
                    .editingThread
                    .title != null
                }
                variant="edit"
                onSubmit={
                  handleThreadComposerSubmit
                }
                onCancel={
                  modalState.closeModal
                }
                authorAvatar={currentUserProfile?.avatarUrl || resolveAuthorAvatar(
                  currentUser
                    ? `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'You'
                    : 'You',
                  null
                )}
                authorName={currentUserProfile?.displayName || (currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : 'You')}
              />
            </div>
          </div>
        )}

      {modalState.modalType ===
        'thread' &&
        selectedThread && (
          <ThreadModal
            isOpen={
              modalState.isOpen
            }
            onClose={
              modalState.closeModal
            }
            thread={selectedThread}
            onCommentSubmit={
              handleCommentSubmit
            }
            onCommentDelete={
              handleCommentDelete
            }
            onCommentEdit={
              handleCommentEdit
            }
            onThreadLike={() =>
              handleThreadLike(selectedThread.id)
            }
            onThreadEditRequest={
              handleThreadEditRequest
            }
            onThreadDelete={
              handleThreadDelete
            }
            currentUserId={
              currentUserId
            }
          />
        )}

      <CreateCommunityModal
        isOpen={
          isCreateCommunityOpen
        }
        onClose={() =>
          setIsCreateCommunityOpen(
            false
          )
        }
        onSuccess={async (createdCommunity) => {
          setPageAlert({
            type: 'success',
            message: 'Community created successfully.',
          });
          navigate(`/community/${createdCommunity.id}`);
        }}
      />
    </Layout>
  );
};

export default CommunitiesListPage;