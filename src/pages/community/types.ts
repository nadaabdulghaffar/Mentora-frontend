/**
 * Community Flow Type Definitions
 * Contains all TypeScript interfaces and types for the community feature
 */

// ============================================
// User & Member Types
// ============================================

export interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  role: 'Owner' | 'Admin' | 'Member';
  joinedDate: string;
  bio?: string;
  isFollowing?: boolean;
}

export interface MemberRequest {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  role: string;
  bio: string;
  requestedAt: string;
}

// ============================================
// Community Types
// ============================================

export interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string;
  cover: string;
  domain: string;
  domainId: number;
  memberCount: number;
  isPublic: boolean;
  createdDate: string;
  creatorName?: string;
  creatorAvatar?: string;
  isJoined?: boolean;

currentUserRole?: string;

canManage?: boolean;


}

export interface CommunitySettings {
  name: string;
  description: string;
  domainId: number;
  avatar: string;
  cover: string;
}

// ============================================
// Post & Comment Types
// ============================================

export interface ThreadComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  /** Raw profile picture from API (for ProfileAvatar resolution). */
  authorProfilePicture?: string;
  authorRole?: 'admin' | 'moderator' | 'member' | 'author';
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  replies?: ThreadComment[];
  canDelete?: boolean;
  canEdit?: boolean;
}

export interface CommunityThread {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  /** Raw profile picture from API (for ProfileAvatar resolution). */
  authorProfilePicture?: string;
  authorRole?: string;
  title?: string; // For discussion threads
  content: string;
  timestamp: string;
  likes: number;
  commentCount: number;
  shareCount: number;
  comments: ThreadComment[];
  attachments?: ThreadAttachment[];
  category?: string; // Career Advice, General Discussion, etc.
  isLiked?: boolean;
  isSaved?: boolean;
  canDelete?: boolean;
  canEdit?: boolean;
  // Optional: which community this thread belongs to (used in global feed)
  communityId?: string;
  communityName?: string;
}

export interface ThreadAttachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name?: string;
  mimeType?: string;
}

// ============================================
// Feed & Display Types
// ============================================

export interface FeedItem {
  type: 'announcement' | 'discussion' | 'news';
  data: CommunityThread;
}

export interface FeedFilter {
  category?: string;
  sortBy: 'recent' | 'popular' | 'trending';
  searchQuery?: string;
}

// ============================================
// Modal State Types
// ============================================

export interface CommunityModalData {
  threadId?: string;
  editingThread?: CommunityThread;
}

export interface ModalState {
  isOpen: boolean;
  type: 'thread' | 'create' | 'settings' | null;
  data?: CommunityModalData;
}

export interface CreateThreadPayload {
  content: string;
  title?: string;
  category?: string;
  attachments?: ThreadAttachment[];
}

// ============================================
// API Response Types
// ============================================

export interface CommunityFeedResponse {
  threads: CommunityThread[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ThreadDetailResponse {
  thread: CommunityThread;
  relatedThreads?: CommunityThread[];
}



export interface CreateCommunityPayload {
  name: string;
  description: string;
  coverImageUrl?: string;
  domainId: number;
}

export interface CommunityResponse {
  communityId: string;

  name: string;
  description: string;

  coverImageUrl?: string;

  domainId: number;

  membersCount: number;
  postsCount: number;

  createdAt: string;

  createdByUserName: string;
  createdByUserProfilePicture?: string;

  isMember: boolean;

  currentUserRole: string;

  canManage: boolean;
}
