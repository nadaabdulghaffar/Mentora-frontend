import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../shared/components/Layout';
import { MOCK_COMMUNITIES, MOCK_COMMUNITY_THREADS } from './constants';
import { PostCard } from '../../components/community/PostCard';
import { ThreadModal } from '../../components/community/ThreadModal';
import { CreatePostForm } from '../../components/community/CreatePostForm';
import CreateCommunityModal from '../../components/create-community/CreateCommunityModal';
import { useThreads, useCommunityModal } from './hooks';
import type { CommunityThread, ThreadComment, CreateThreadPayload } from './types';

const CommunitiesListPage: React.FC = () => {
  const navigate = useNavigate();
  const modalState = useCommunityModal();
  const threads = useThreads({ initialThreads: MOCK_COMMUNITY_THREADS });
  const currentUserId = 'current-user';
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);

  const handleThreadClick = useCallback(
    (thread: CommunityThread) => {
      threads.setSelectedThread(thread);
      modalState.openThreadModal(thread.id);
    },
    [threads.setSelectedThread, modalState.openThreadModal]
  );

  const handleCommentSubmit = useCallback(
    (content: string) => {
      const threadId = threads.selectedThread?.id;
      if (!threadId) return;
      const newComment: ThreadComment = {
        id: `comment-${Date.now()}`,
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
      threads.addComment(threadId, newComment);
    },
    [threads.selectedThread?.id, threads.addComment, currentUserId]
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

  const handleThreadComposerSubmit = useCallback(
    (payload: CreateThreadPayload) => {
      const editing = modalState.editingThread;
      if (!editing) return;
      threads.updateThread(editing.id, {
        content: payload.content,
        ...(editing.title != null ? { title: payload.title?.trim() ?? '' } : {}),
        attachments: payload.attachments,
      });
      modalState.closeModal();
    },
    [threads, modalState]
  );

  const handleThreadEditRequest = useCallback(
    (thread: CommunityThread) => {
      modalState.openEditPostModal(thread);
    },
    [modalState]
  );

  const handleThreadLike = useCallback(() => {
    const id = threads.selectedThread?.id;
    if (id) threads.toggleThreadLike(id);
  }, [threads.selectedThread?.id, threads.toggleThreadLike]);

  const handleThreadSave = useCallback(() => {
    const id = threads.selectedThread?.id;
    if (id) threads.toggleThreadSave(id);
  }, [threads.selectedThread?.id, threads.toggleThreadSave]);

  const selectedThread = threads.selectedThread;

  return (
    <Layout>
      <div className="min-h-screen bg-transparent">
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="w-full max-w-2xl mx-auto text-center">
              <p className="text-sm text-gray-500">Here is communities where you can connect and grow with others</p>
            </div>
            <div className="ml-4">
              <button
                className="rounded-full bg-primary text-white px-4 py-2 text-sm"
                onClick={() => setIsCreateCommunityOpen(true)}
              >
                Create Community
              </button>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-3">
            <div className="col-span-2 space-y-6">
              {threads.threads.map((thread) => (
                <PostCard
                  key={thread.id}
                  thread={thread}
                  onThreadClick={handleThreadClick}
                  onLike={threads.toggleThreadLike}
                  onSave={threads.toggleThreadSave}
                  onShare={() => {}}
                  currentUserId={currentUserId}
                  onThreadEditRequest={handleThreadEditRequest}
                  onThreadDelete={handleThreadDelete}
                />
              ))}
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <input placeholder="Search community name" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-3">Your Communities</h4>
                <ul className="space-y-3">
                  {MOCK_COMMUNITIES.slice(0, 3).map((c) => (
                    <li key={c.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={c.avatar} alt={c.name} className="h-8 w-8 rounded-full" />
                        <div>
                          <div className="text-sm font-medium text-slate-800">{c.name}</div>
                          <div className="text-xs text-gray-400">{c.memberCount.toLocaleString()} members</div>
                        </div>
                      </div>
                      <button onClick={() => navigate(`/community/${c.id}`)} className="text-sm text-primary">Open</button>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <button className="w-full rounded-md border border-gray-100 px-3 py-2 text-sm bg-gray-50">See All</button>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-3">Recommended Communities</h4>
                <ul className="space-y-3">
                  {MOCK_COMMUNITIES.map((c) => (
                    <li key={`rec-${c.id}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={c.avatar} alt={c.name} className="h-8 w-8 rounded-full" />
                        <div className="text-sm">
                          <div className="font-medium text-slate-800">{c.name}</div>
                          <div className="text-xs text-gray-400">{c.memberCount.toLocaleString()} members</div>
                        </div>
                      </div>
                      <button className="rounded-md border border-gray-100 px-3 py-1 text-sm">Join</button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {modalState.modalType === 'create' && modalState.editingThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Edit discussion</h2>
            <CreatePostForm
              formKey={modalState.editingThread.id}
              initialContent={modalState.editingThread.content}
              initialTitle={modalState.editingThread.title}
              initialAttachments={modalState.editingThread.attachments}
              showTitleField={modalState.editingThread.title != null}
              variant="edit"
              onSubmit={handleThreadComposerSubmit}
              onCancel={modalState.closeModal}
              authorAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=You"
              authorName="You"
            />
          </div>
        </div>
      )}

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
          currentUserId={currentUserId}
        />
      )}

      <CreateCommunityModal
        isOpen={isCreateCommunityOpen}
        onClose={() => setIsCreateCommunityOpen(false)}
      />
    </Layout>
  );
};

export default CommunitiesListPage;
