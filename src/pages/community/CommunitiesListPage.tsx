
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';

import Layout from '../../shared/components/Layout';

import { MOCK_COMMUNITIES } from './constants';

import { PostCard } from '../../components/community/PostCard';

import { ThreadModal } from '../../components/community/ThreadModal';

import { CreatePostForm } from '../../components/community/CreatePostForm';

import CreateCommunityModal from '../../components/create-community/CreateCommunityModal';
import { Alert } from '../../components/Alert';

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
  useEffectRunDiagnostics(PAGE_NAME, 'fetchProfile', [currentUser]);

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
          displayName:
            profile.displayName?.trim() ||
            (currentUser
              ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
              : 'You'),
          avatarUrl: profile.avatarUrl || '',
        });
      }
    } catch (err) {
      console.error(
        `[${PAGE_NAME}] Failed to load user profile`,
        err
      );
    }
  };

  fetchProfile();
}, []); // <-- مؤقتاً للتشخيص

  const [
    isCreateCommunityOpen,
    setIsCreateCommunityOpen,
  ] = useState(false);

  const [
    myCommunities,
    setMyCommunities,
  ] = useState<Community[]>(
    []
  );

  const [
    isLoadingCommunities,
    setIsLoadingCommunities,
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

  const loadMyCommunities = useCallback(async () => {
    try {
      setIsLoadingCommunities(true);

      const response = await withLoadingDiagnostics(
        PAGE_NAME,
        'my communities',
        async () => {
          await ensureDomainsLoaded();
          return getMyCommunities();
        }
      );
      const mapped = mapCommunitiesResponse(response);

      setMyCommunities(mapped);
    } catch (error) {
      console.error(
        `[${PAGE_NAME}] Failed to fetch communities`,
        error
      );
    } finally {
      setIsLoadingCommunities(false);
    }
  }, []);

  /* =========================
     FETCH COMMUNITIES
  ========================= */

  useEffectRunDiagnostics(PAGE_NAME, 'loadMyCommunities', [loadMyCommunities]);

  useEffect(() => {
    void loadMyCommunities();
  }, [loadMyCommunities]);

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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-gray-500">
                Connect and grow with others across mentorship communities.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 transition hover:bg-primary-dark sm:self-auto"
              onClick={() => setIsCreateCommunityOpen(true)}
            >
              <Plus size={18} strokeWidth={2.5} aria-hidden />
              Create Community
            </button>
          </div>

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
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-3">
                  Joined Communities
                </h4>

                {isLoadingCommunities ? (
                  <div className="text-sm text-gray-500">
                    Loading...
                  </div>
                ) : myCommunities.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-slate-800">
                      No joined communities yet
                    </p>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                      Explore communities to start connecting.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/search-mentorship?tab=communities')
                      }
                      className="mt-3 text-xs font-semibold text-primary hover:underline"
                    >
                      Explore Communities →
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {myCommunities
                      .slice(0, 3)
                      .map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                c.cover || c.avatar
                              }
                              alt={
                                c.name
                              }
                              className="h-8 w-8 rounded-lg object-cover"
                            />

                            <div>
                              <div className="text-sm font-medium text-slate-800">
                                {
                                  c.name
                                }
                              </div>

                              <div className="text-xs text-gray-400">
                                {c.memberCount.toLocaleString()}{' '}
                                members
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              navigate(
                                `/community/${c.id}`
                              )
                            }
                            className="text-sm text-primary"
                          >
                            Open
                          </button>
                        </li>
                      ))}
                  </ul>
                                            )}

              </div>

              {myCommunities.length > 0 && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/my-communities')}
                    className="w-full rounded-md border border-gray-100 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 transition"
                  >
                    See All
                  </button>
                </div>
              )}


              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-3">
                  Recommended
                  Communities
                </h4>

                <ul className="space-y-3">
                  {MOCK_COMMUNITIES.map(
                    (c) => (
                      <li
                        key={`rec-${c.id}`}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              c.cover || c.avatar
                            }
                            alt={
                              c.name
                            }
                            className="h-8 w-8 rounded-lg object-cover"
                          />

                          <div className="text-sm">
                            <div className="font-medium text-slate-800">
                              {
                                c.name
                              }
                            </div>

                            <div className="text-xs text-gray-400">
                              {c.memberCount.toLocaleString()}{' '}
                              members
                            </div>
                          </div>
                        </div>

                        <button className="rounded-md border border-gray-100 px-3 py-1 text-sm">
                          Join
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </div>
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
          await loadMyCommunities();
          navigate(`/community/${createdCommunity.id}`);
        }}
      />
    </Layout>
  );
};

export default CommunitiesListPage;
