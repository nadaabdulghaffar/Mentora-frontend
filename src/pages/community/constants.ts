/**
 * Community Constants & Mock Data
 * Centralized mock data for development and testing
 */

import type {
  Community,
  CommunityMember,
  CommunityThread,
  MemberRequest,
  ThreadComment,
} from './types';

// ============================================
// Community Mock Data
// ============================================

export const MOCK_COMMUNITY: Community = {
  id: 'fullstack-wizards',
  name: 'Fullstack Wizards',
  description:
    'A dedicated community for aspiring and senior fullstack engineers to share knowledge, review code, and grow together.',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FullstackWizards',
  cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=300&fit=crop',
  domain: 'Software Engineering',
  domainId: 1,
  memberCount: 1200,
  isPublic: true,
  createdDate: 'June 2023',
  isJoined: true,
};

// ============================================
// Mock Communities List
// ============================================

export const MOCK_COMMUNITIES: Community[] = [
  MOCK_COMMUNITY,
  {
    id: 'python-pros',
    name: 'Python Pros',
    description: 'A friendly community for Python enthusiasts, libraries, and best practices.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PythonPros',
    cover: 'https://images.unsplash.com/photo-1505685296765-3a2736de412f?w=1200&h=300&fit=crop',
    domain: 'Data Science',
    domainId: 2,
    memberCount: 850,
    isPublic: true,
    createdDate: 'April 2022',
    isJoined: false,
  },
  {
    id: 'product-school',
    name: 'Product School',
    description: 'Discussions on product strategy, roadmaps, and user research.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProductSchool',
    cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=300&fit=crop',
    domain: 'Product',
    domainId: 3,
    memberCount: 2400,
    isPublic: true,
    createdDate: 'Jan 2021',
    isJoined: false,
  },
];

// ============================================
// Mock Members
// ============================================

export const MOCK_MEMBERS: CommunityMember[] = [
  {
    id: 'marcus-thorne',
    name: 'Marcus Thorne',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    role: 'Admin',
    joinedDate: 'Joined Jan 2023',
    bio: 'Lead architect of Fullstack Wizards. Founder of Fullstack Wizards.',
  },
  {
    id: 'elena-rodriguez',
    name: 'Elena Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    role: 'Member',
    joinedDate: 'Joined Feb 2023',
    bio: 'DevOps specialist. Loves helping others scale their applications.',
  },
  {
    id: 'david-kim',
    name: 'David Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    role: 'Member',
    joinedDate: 'Joined Feb 2023',
    bio: 'Community Mod',
  },
];

// ============================================
// Mock Member Requests
// ============================================

export const MOCK_MEMBER_REQUESTS: MemberRequest[] = [
  {
    id: 'req-1',
    userId: 'ahmed-hassan',
    name: 'Ahmed Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    role: 'Frontend Developer',
    bio: 'Passionate about React and building great UIs',
    requestedAt: '2 hours ago',
  },
  {
    id: 'req-2',
    userId: 'priya-singh',
    name: 'Priya Singh',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    role: 'UI Designer',
    bio: 'Interested in learning full-stack development',
    requestedAt: '5 hours ago',
  },
];

// ============================================
// Mock Comments for Threads
// ============================================

export const MOCK_THREAD_COMMENTS: ThreadComment[] = [
  {
    id: 'comment-1',
    authorId: 'sarah-jenkins',
    authorName: 'Sarah Jenkins',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    authorRole: 'member',
    content: 'The typography choice is excellent. The Inter font really gives it a professional look. Maybe tighten the line height just a tiny bit on mobile?',
    timestamp: '1 hour ago',
    likes: 24,
    isLiked: false,
    canEdit: true,
    canDelete: true,
  },
  {
    id: 'comment-2',
    authorId: 'alex-rivera',
    authorName: 'Alex Rivera',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    authorRole: 'author',
    content: 'Great catch, Sarah! I\'ll test that out on the next iteration. Thanks for the feedback!',
    timestamp: '55 minutes ago',
    likes: 12,
    isLiked: false,
    canEdit: true,
    canDelete: true,
    replies: [
      {
        id: 'reply-1',
        authorId: 'marcus-thorne',
        authorName: 'Marcus Thorne',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
        authorRole: 'admin',
        content: 'Solid design work, Alex. This is the kind of iterative feedback that makes our community great.',
        timestamp: '45 minutes ago',
        likes: 8,
        isLiked: false,
        canEdit: true,
        canDelete: true,
      },
    ],
  },
  {
    id: 'comment-3',
    authorId: 'marcus-chen',
    authorName: 'Marcus Chen',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusChen',
    authorRole: 'member',
    content: 'Love the color palette! The primary purple works really well with the dark mode implementation.',
    timestamp: '32 minutes ago',
    likes: 16,
    isLiked: false,
    canEdit: true,
    canDelete: true,
  },
  {
    id: 'comment-4',
    authorId: 'jordan-smith',
    authorName: 'Jordan Smith',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    authorRole: 'member',
    content: 'The spacing looks much better than the previous version. Solid work!',
    timestamp: '10 minutes ago',
    likes: 5,
    isLiked: false,
    canEdit: true,
    canDelete: true,
  },
];

// ============================================
// Mock Threads/Posts
// ============================================

export const MOCK_COMMUNITY_THREADS: CommunityThread[] = [
  {
    id: 'thread-1',
    authorId: 'alex-rivera',
    authorName: 'Alex Rivera',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    authorRole: 'member',
    title: 'Mentorship Platform Design',
    content:
      'Here is my latest design for the mentorship platform. What do you think about the spacing and the typography? I\'m aiming for a clean, accessible look that works well for long-form reading.',
    timestamp: '2 hours ago',
    likes: 24,
    commentCount: 4,
    shareCount: 2,
    category: 'Design Critique',
    comments: MOCK_THREAD_COMMENTS,
    isLiked: false,
    isSaved: false,
    canEdit: true,
    canDelete: true,
    communityId: 'fullstack-wizards',
    communityName: 'Fullstack Wizards',
  },
  {
    id: 'thread-2',
    authorId: 'sarah-johnson',
    authorName: 'Sarah Johnson',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah2',
    authorRole: 'member',
    title: 'React Best Practices for 2024',
    content:
      'Just finished my first React-Native project thanks to the resources in the media tab! Does anyone have experience with CI/CD pipelines for mobile apps? Would love to get some mentorship on this.',
    timestamp: '5 hours ago',
    likes: 12,
    commentCount: 3,
    shareCount: 1,
    category: 'Career Advice',
    comments: [],
    isLiked: false,
    isSaved: false,
    attachments: [
      {
        id: 'mock-att-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=400&fit=crop',
        name: 'React native design',
      }
    ],
    communityId: 'fullstack-wizards',
    communityName: 'Fullstack Wizards',
  },
  {
    id: 'thread-3',
    authorId: 'jordan-lee',
    authorName: 'Jordan Lee',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan2',
    authorRole: 'member',
    title: 'Using Zustand for State Management',
    content:
      'I\'ve been using Zustand for simple state and Server Actions for data mutations. It feels much cleaner than before! Anyone else using this pattern?',
    timestamp: '1 day ago',
    likes: 45,
    commentCount: 12,
    shareCount: 8,
    category: 'General Discussion',
    comments: [],
    isLiked: false,
    isSaved: false,
    communityId: 'fullstack-wizards',
    communityName: 'Fullstack Wizards',
  },
];

// ============================================
// Community Constants
// ============================================

export const COMMUNITY_CATEGORIES = [
  'General Discussion',
  'Career Advice',
  'Design Critique',
  'Code Review',
  'Resource Sharing',
  'Job Opportunities',
  'Announcements',
];

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' },
];

export const MEMBER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'member', label: 'Member' },
];

// ============================================
// Pagination Constants
// ============================================

export const PAGINATION = {
  THREADS_PER_PAGE: 10,
  COMMENTS_PER_PAGE: 5,
  MEMBERS_PER_PAGE: 20,
};

// ============================================
// UI Constants
// ============================================

export const COMMUNITY_TABS = [
  { id: 'discussion', label: 'Discussion', icon: 'MessageCircle' },
  { id: 'members', label: 'Members', icon: 'Users' },
  { id: 'media', label: 'Media', icon: 'Image' },
  { id: 'files', label: 'Files', icon: 'File' },
];

export const EMPTY_STATES = {
  NO_THREADS: {
    title: 'No discussions yet',
    description: 'Be the first to start a conversation in this community!',
  },
  NO_MEMBERS: {
    title: 'No members found',
    description: 'Join this community to be the first member!',
  },
  NO_COMMENTS: {
    title: 'No comments yet',
    description: 'Start the conversation by adding the first comment!',
  },
};
