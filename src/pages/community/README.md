# Community Flow Documentation

## Overview

The Community Flow is a comprehensive, scalable system for managing community discussions, members, and interactions. It's built following clean code principles with a strong emphasis on maintainability, reusability, and separation of concerns.

## Architecture

### Folder Structure

```
src/pages/community/
├── CommunityPage.tsx              # Main orchestrator component
├── types.ts                       # TypeScript interfaces
├── constants.ts                   # Mock data & constants
├── hooks/
│   ├── useCommunityModal.ts      # Modal state management
│   ├── useThreads.ts             # Thread management
│   ├── useCommunity.ts           # Community/member management
│   └── index.ts                  # Barrel export
├── utils/
│   └── threadUtils.ts            # Helper functions
├── sections/
│   ├── CommunityHeader.tsx       # Tab navigation
│   ├── CommunityFeed.tsx         # Main discussion feed
│   ├── CommunityMembers.tsx      # Member management
│   ├── CommunitySettings.tsx     # Settings panel
│   ├── CommunityDiscussion.tsx   # Extended discussion features
│   └── index.ts                  # Barrel export
└── README.md                      # This file

src/components/community/
├── PostCard.tsx                   # Thread card component
├── CommentThread.tsx              # Nested comment display
├── CreatePostForm.tsx             # Post creation form
├── ThreadModal.tsx                # Thread detail modal
├── MemberCard.tsx                 # Member profile card
├── MemberRequest.tsx              # Member request card
├── CommunitySidebar.tsx           # Community info sidebar
└── index.ts                       # Barrel export
```

## Key Principles

### 1. **Separation of Concerns**

- **UI Components** (`src/components/community/`): Pure presentation logic
- **Page Logic** (`src/pages/community/`): Container logic and state orchestration
- **Hooks** (`hooks/`): Reusable state management
- **Utils** (`utils/`): Pure functions for business logic
- **Types** (`types.ts`): Centralized type definitions
- **Constants** (`constants.ts`): Mock data and configuration

### 2. **Reusability**

- **Generic Components**: `Modal`, `PostCard`, `CommentThread`, `MemberCard` are fully reusable
- **Custom Hooks**: State logic is abstracted and can be used in other contexts
- **Utility Functions**: Pure functions for threading, searching, filtering
- **Barrel Exports**: Clean imports with `index.ts` files

### 3. **Scalability**

- **Dynamic Rendering**: Uses `.map()` for rendering lists instead of hardcoded JSX
- **Pagination Ready**: Constants define per-page limits
- **Filter Architecture**: Supports multiple filters simultaneously
- **Modular Sections**: Each tab/feature in separate components
- **Mock Data Structure**: Easy to replace with API calls

### 4. **Maintainability**

- **Small Components**: Each component has single responsibility
- **Clear Naming**: Self-documenting function and variable names
- **Type Safety**: Full TypeScript coverage
- **Documentation**: Inline comments and JSDoc blocks
- **DRY Principle**: No duplicated code

## Component Reference

### PostCard
Displays a single thread/post in the feed.

**Props:**
```typescript
interface PostCardProps {
  thread: CommunityThread;
  onThreadClick: (thread: CommunityThread) => void;
  onLike?: (threadId: string) => void;
  onSave?: (threadId: string) => void;
  onShare?: (threadId: string) => void;
  onMoreOptions?: (threadId: string) => void;
  isCompact?: boolean;
}
```

**Usage:**
```tsx
<PostCard
  thread={thread}
  onThreadClick={handleThreadClick}
  onLike={threads.toggleThreadLike}
  isCompact={false}
/>
```

### CommentThread
Displays nested comments with replies.

**Props:**
```typescript
interface CommentThreadProps {
  comment: ThreadComment;
  onReply?: (commentId: string, content: string) => void;
  onLike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  depth?: number;
  variant?: 'community' | 'classroom';
}
```

### CreatePostForm
Form for creating new posts.

**Features:**
- Character counter
- File attachments
- Category selection
- Real-time validation
- Loading states

### ThreadModal
Full-screen modal for viewing thread details with comments.

**Features:**
- Nested comment rendering
- Comment sorting (recent/popular)
- Like/save/share actions
- Edit and delete capabilities

### MemberCard
Displays member information with action buttons.

**Features:**
- Role badges (admin/moderator)
- Follow/unfollow
- Message button
- Bio preview

### CommunitySidebar
Community information sidebar.

**Features:**
- Community stats
- Join/leave button
- Settings/share actions
- Member count and creation date

## Hooks Reference

### useCommunityModal
Manages modal state for thread detail, create post, and settings.

```typescript
const {
  modalState,        // Current modal state
  openThreadModal,   // Open thread detail modal
  openCreateModal,   // Open create post modal
  openSettingsModal, // Open settings modal
  closeModal,        // Close any modal
  updateModalData,   // Update modal data
  isOpen,           // Is modal open?
  modalType,        // Current modal type
} = useCommunityModal();
```

### useThreads
Manages thread data, filtering, sorting, and comments.

```typescript
const {
  threads,           // Filtered and sorted threads
  allThreads,        // All threads
  filter,            // Current filter state
  selectedThread,    // Currently selected thread
  addThread,         // Add new thread
  updateThread,      // Update existing thread
  deleteThread,      // Delete thread
  toggleThreadLike,  // Like/unlike thread
  addComment,        // Add comment to thread
  deleteComment,     // Delete comment
  setSortBy,         // Change sort order
  setSearchQuery,    // Update search
  setCategory,       // Filter by category
} = useThreads({ initialThreads: [...] });
```

### useCommunity
Manages community data, members, and member requests.

```typescript
const {
  community,              // Community data
  members,               // Filtered members
  allMembers,            // All members
  memberRequests,        // Pending requests
  staffMembers,          // Admins & moderators
  searchQuery,           // Search query
  addMember,             // Add member
  removeMember,          // Remove member
  updateMemberRole,      // Change member role
  approveMemberRequest,  // Approve request
  rejectMemberRequest,   // Reject request
  isMember,              // Check if user is member
  isAdmin,               // Check if user is admin
} = useCommunity({ initialCommunity, initialMembers, initialRequests });
```

## Utility Functions

Located in `utils/threadUtils.ts`:

### Thread Operations
- `searchThreads()` - Search threads by content/author
- `sortThreads()` - Sort by recent/popular/trending
- `filterThreadsByCategory()` - Filter by category
- `getThreadStats()` - Get engagement metrics
- `getTrendingThreads()` - Get top trending threads

### Comment Operations
- `getTotalCommentCount()` - Count all comments including replies
- `sortCommentsByLikes()` - Sort by engagement
- `sortCommentsByTime()` - Sort by recency
- `searchComments()` - Search comment text
- `getTopComments()` - Get most relevant comments

### Validation
- `validateThreadContent()` - Validate thread content length
- `validateCommentContent()` - Validate comment length

### Formatting
- `formatTimestamp()` - Convert to human-readable time
- `truncateText()` - Truncate with ellipsis
- `extractMentions()` - Find @mentions in text
- `highlightMentions()` - Format mentions for display

## Usage Example

### Complete Flow

```tsx
import CommunityPage from './pages/community/CommunityPage';

// In your App.tsx or routing:
<Route path="/community/:id" element={<CommunityPage />} />
```

### Individual Components

```tsx
import {
  PostCard,
  CommentThread,
  CreatePostForm,
  ThreadModal,
  MemberCard,
} from './components/community';

// Use components independently
<PostCard
  thread={thread}
  onThreadClick={handleClick}
  onLike={handleLike}
/>

<CommentThread
  comment={comment}
  onLike={handleLike}
  onReply={handleReply}
/>

<CreatePostForm
  onSubmit={handleSubmit}
  categories={categories}
  authorAvatar={avatar}
  authorName={name}
/>
```

## Data Flow

```
CommunityPage (Main Orchestrator)
├── useCommunityModal() ─→ Modal state
├── useThreads() ─────────→ Thread management
├── useCommunity() ───────→ Member management
└── Render:
    ├── CommunityHeaderSection
    ├── CommunityFeedSection
    │   └── PostCard[] (dynamic rendering)
    ├── CommunityMembersSection
    │   ├── MemberCard[] (dynamic rendering)
    │   └── MemberRequestCard[] (dynamic rendering)
    ├── CommunitySidebar
    ├── CreatePostForm (in modal)
    └── ThreadModal
        └── CommentThread[] (nested)
```

## Performance Optimizations

1. **Dynamic Rendering**: Uses `.map()` for efficient list rendering
2. **Memoization**: `useMemo` for expensive calculations
3. **Callbacks**: `useCallback` to prevent unnecessary re-renders
4. **Lazy Loading**: Modal content only renders when needed
5. **Pagination**: Configurable items per page

## Testing Strategy

### Unit Testing
- Utility functions: `threadUtils.ts`
- Type validation functions
- Custom hooks in isolation

### Component Testing
- Individual component snapshots
- Props variations
- User interactions (click, input)
- Loading and error states

### Integration Testing
- Full CommunityPage flow
- Modal interactions
- Thread creation and commenting
- Member management

## Extension Points

### Adding Features

1. **New Section**: Create in `sections/` folder, add to tabs
2. **New Utility**: Add to `utils/threadUtils.ts`
3. **New Hook**: Create in `hooks/` folder and export
4. **New Component**: Create in `components/community/` folder
5. **New Types**: Add to `types.ts`
6. **New Constants**: Add to `constants.ts`

### API Integration

Replace mock data with API calls:

```typescript
// In useThreads hook
const [threads, setThreads] = useState<CommunityThread[]>([]);

useEffect(() => {
  // Replace MOCK_COMMUNITY_THREADS with API call
  fetchCommunityThreads().then(setThreads);
}, []);
```

## Best Practices

1. **Keep Components Small**: Max 200-300 lines
2. **Use TypeScript**: Full type coverage
3. **Avoid Prop Drilling**: Use custom hooks
4. **DRY Code**: Extract reusable functions
5. **Clear Naming**: Self-documenting names
6. **Comments**: Explain "why", not "what"
7. **Responsive Design**: Test on mobile/tablet/desktop
8. **Accessibility**: ARIA labels, semantic HTML
9. **Performance**: Memoize expensive calculations
10. **Testing**: Unit test utilities, integration test features

## Common Patterns

### Filter and Sort
```typescript
const filteredThreads = useMemo(() => {
  let result = threads;
  if (searchQuery) result = searchThreads(result, searchQuery);
  if (category) result = filterThreadsByCategory(result, category);
  return sortThreads(result, sortBy);
}, [threads, searchQuery, category, sortBy]);
```

### Modal State Management
```typescript
const { modalState, openThreadModal, closeModal } = useCommunityModal();

// Open modal
<button onClick={() => openThreadModal(threadId)}>View</button>

// Render modal
{modalState.isOpen && modalState.type === 'thread' && <ThreadModal />}
```

### Dynamic Rendering
```typescript
<div className="space-y-4">
  {threads.map((thread) => (
    <PostCard
      key={thread.id}
      thread={thread}
      onThreadClick={onThreadClick}
    />
  ))}
</div>
```

## Troubleshooting

### Common Issues

1. **Modal not opening**: Check `useCommunityModal()` state
2. **Comments not showing**: Verify thread has comments array
3. **Styles not applying**: Check Tailwind class names
4. **Types errors**: Ensure all types imported from `types.ts`
5. **Performance issues**: Add memoization with `useMemo`

## Future Improvements

1. **Caching**: Add React Query for API caching
2. **Pagination**: Implement with infinite scroll
3. **Real-time**: Add WebSocket for live updates
4. **Search**: Add full-text search backend
5. **Analytics**: Track engagement metrics
6. **Notifications**: Notify on new replies
7. **Moderation**: Enhanced admin tools
8. **Mentions**: @mention autocomplete
9. **Reactions**: Emoji reactions on posts
10. **Threading**: Collapse/expand reply chains
