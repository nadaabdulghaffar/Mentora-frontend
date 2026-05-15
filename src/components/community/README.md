# Community Components Documentation

## Overview

Reusable, presentation-focused components for the community flow. All components in `src/components/community/` are designed to be:

- **Standalone**: Work independently of the community page
- **Customizable**: Flexible props for different use cases
- **Accessible**: ARIA labels and semantic HTML
- **Responsive**: Mobile-first design
- **TypeScript-safe**: Full type coverage

## Components

### PostCard

A reusable card component for displaying community posts/threads.

#### Props

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

#### Features

- ✅ Author information with avatar
- ✅ Post content with optional truncation
- ✅ Engagement metrics (likes, comments, shares)
- ✅ Action buttons (like, comment, share, save)
- ✅ Category badge
- ✅ Responsive layout
- ✅ Hover effects and transitions

#### Usage

```tsx
import { PostCard } from './components/community';

<PostCard
  thread={thread}
  onThreadClick={handleThreadClick}
  onLike={handleLike}
  onSave={handleSave}
  onShare={handleShare}
  onMoreOptions={handleMoreOptions}
  isCompact={false}
/>
```

#### Styling

- Uses Tailwind CSS utility classes
- Follows design system colors and spacing
- Responsive grid-compatible
- Hover and focus states for accessibility

---

### CommentThread

Displays a single comment with nested replies and supports edit/delete operations.

#### Props

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

#### Features

- ✅ Author info with role badges
- ✅ Comment content display
- ✅ Like counter
- ✅ Reply functionality
- ✅ Nested replies (up to 3 levels deep)
- ✅ Edit and delete (if author)
- ✅ Recursive nesting support
- ✅ Collapse/expand reply threads

#### Usage

```tsx
import { CommentThread } from './components/community';

<CommentThread
  comment={comment}
  onReply={handleReply}
  onLike={handleLike}
  onDelete={handleDelete}
  onEdit={handleEdit}
  depth={0}
  variant="community"
/>
```

#### Features

- Supports infinite nesting (with max depth of 3)
- Edit mode with textarea
- Reply input with keyboard shortcuts (Ctrl+Enter)
- Author role badges (admin, moderator, author)
- Delete confirmation implicit

---

### CreatePostForm

Form component for creating new community posts with file attachments and category selection.

#### Props

```typescript
interface CreatePostFormProps {
  onSubmit: (payload: CreateThreadPayload) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  categories?: string[];
  authorAvatar: string;
  authorName: string;
}
```

#### Features

- ✅ Rich textarea input
- ✅ Character counter (0/5000)
- ✅ Category dropdown
- ✅ File attachment support (images & files)
- ✅ Preview of attachments
- ✅ Real-time validation
- ✅ Loading states
- ✅ Cancel button
- ✅ Responsive file buttons

#### Usage

```tsx
import { CreatePostForm } from './components/community';

<CreatePostForm
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  categories={COMMUNITY_CATEGORIES}
  authorAvatar={userAvatar}
  authorName={userName}
  isLoading={isLoading}
/>
```

#### Validation

- Content: 1-5000 characters
- Real-time character count
- Disable submit if empty or too long
- File size limits (configurable)

---

### ThreadModal

Full-screen modal for viewing thread details with nested comments.

#### Props

```typescript
interface ThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: CommunityThread;
  onCommentSubmit?: (content: string) => void;
  onCommentLike?: (commentId: string) => void;
  onCommentDelete?: (commentId: string) => void;
  onCommentEdit?: (commentId: string, content: string) => void;
  onThreadLike?: () => void;
  onThreadShare?: () => void;
  onThreadSave?: () => void;
  isLoadingComment?: boolean;
  currentUserId?: string;
  currentUserRole?: 'admin' | 'moderator' | 'member';
}
```

#### Features

- ✅ Full thread display
- ✅ Author information
- ✅ Engagement metrics
- ✅ Like/share/save buttons
- ✅ Comments section with sorting
- ✅ Comment input form
- ✅ Nested comment threads
- ✅ Edit/delete capabilities
- ✅ Loading states
- ✅ Scrollable content
- ✅ Close button

#### Usage

```tsx
import { ThreadModal } from './components/community';

<ThreadModal
  isOpen={isOpen}
  onClose={handleClose}
  thread={thread}
  onCommentSubmit={handleCommentSubmit}
  onCommentLike={handleCommentLike}
  onThreadLike={handleThreadLike}
  isLoadingComment={isLoading}
/>
```

#### Comment Sorting

- Most Recent (default)
- Most Popular (by likes)

---

### MemberCard

Displays member profile information with action buttons.

#### Props

```typescript
interface MemberCardProps {
  member: CommunityMember;
  onFollow?: (memberId: string) => void;
  onUnfollow?: (memberId: string) => void;
  onMessage?: (memberId: string) => void;
  onMoreOptions?: (memberId: string) => void;
  showFollowButton?: boolean;
  showMessageButton?: boolean;
  isCompact?: boolean;
}
```

#### Features

- ✅ Avatar and name display
- ✅ Role badges (admin/moderator)
- ✅ Bio preview
- ✅ Join date
- ✅ Follow/unfollow button
- ✅ Message button
- ✅ More options button
- ✅ Compact and full layouts
- ✅ Responsive grid layout

#### Usage

```tsx
import { MemberCard } from './components/community';

<MemberCard
  member={member}
  onFollow={handleFollow}
  onUnfollow={handleUnfollow}
  onMessage={handleMessage}
  showFollowButton={true}
  showMessageButton={true}
  isCompact={false}
/>
```

---

### MemberRequestCard

Displays pending member requests with approve/decline buttons.

#### Props

```typescript
interface MemberRequestProps {
  request: MemberRequest;
  onApprove: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  isProcessing?: boolean;
}
```

#### Features

- ✅ Member avatar and info
- ✅ Role and bio display
- ✅ Request timestamp
- ✅ Approve button (green)
- ✅ Decline button (red)
- ✅ Processing state
- ✅ Responsive layout

#### Usage

```tsx
import { MemberRequestCard } from './components/community';

<MemberRequestCard
  request={request}
  onApprove={handleApprove}
  onDecline={handleDecline}
  isProcessing={isProcessing}
/>
```

---

### CommunitySidebar

Displays community information and meta content.

#### Props

```typescript
interface CommunitySidebarProps {
  community: Community;
  onSettings?: () => void;
  onShare?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  isLoading?: boolean;
}
```

#### Features

- ✅ Cover image display
- ✅ Community name and description
- ✅ Domain badge
- ✅ Member count
- ✅ Creation date
- ✅ Join/Leave button (context-aware)
- ✅ Settings button
- ✅ Share button
- ✅ Privacy status indicator
- ✅ Sticky positioning (optional)

#### Usage

```tsx
import { CommunitySidebar } from './components/community';

<CommunitySidebar
  community={community}
  onSettings={handleSettings}
  onShare={handleShare}
  onJoin={handleJoin}
  onLeave={handleLeave}
  isLoading={isLoading}
/>
```

---

## Reusable Design Patterns

### 1. Dynamic Rendering

All list components use `.map()` for efficient rendering:

```tsx
<div className="space-y-4">
  {threads.map((thread) => (
    <PostCard key={thread.id} thread={thread} {...props} />
  ))}
</div>
```

### 2. Callback Props

Components use callbacks for event handling:

```tsx
<PostCard
  onThreadClick={handleClick}
  onLike={handleLike}
  onSave={handleSave}
/>
```

### 3. Conditional Rendering

Show/hide elements based on props:

```tsx
{showFollowButton && (
  <button onClick={() => onFollow(member.id)}>
    Follow
  </button>
)}
```

### 4. Role-Based UI

Display different UI based on user role:

```tsx
{member.role === 'admin' && (
  <span className="bg-red-100 text-red-700">Admin</span>
)}
```

### 5. Loading States

Show skeleton or disabled state during loading:

```tsx
<button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

## Styling Guide

### Colors

- **Primary**: `bg-blue-600` text-white
- **Success**: `bg-green-600` green actions
- **Danger**: `bg-red-600` for delete/decline
- **Secondary**: `bg-gray-100` for neutral actions
- **Text**: `text-gray-900` primary, `text-gray-600` secondary

### Spacing

- **Gap**: `gap-2` (8px), `gap-3` (12px), `gap-4` (16px)
- **Padding**: `p-4` standard, `p-6` larger sections
- **Margin**: Follow gap pattern with `m-` or `my-`

### Responsive

- **Mobile-first**: Base styles for mobile
- **Tablets**: `sm:` breakpoint (640px)
- **Desktop**: `lg:` breakpoint (1024px)
- **Grid**: `grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-3`

### States

- **Hover**: `hover:bg-gray-50` for gray, `hover:bg-blue-700` for blue
- **Focus**: `focus:border-blue-400` focus ring
- **Disabled**: `disabled:opacity-50` with cursor
- **Active**: `bg-blue-600 text-white` for active state

## Accessibility

All components include:

- ✅ ARIA labels on icon-only buttons
- ✅ Semantic HTML (button, form, etc.)
- ✅ Keyboard navigation support
- ✅ Focus states for keyboard users
- ✅ Color contrast ratios (WCAG AA)
- ✅ Alt text for images
- ✅ Proper heading hierarchy

## Performance

- **Memoization**: Use `React.memo` for components that receive same props
- **useCallback**: Wrap event handlers to prevent recreations
- **useMemo**: Memoize expensive calculations
- **Lazy Loading**: Load modals only when needed
- **List Optimization**: Use `key` prop for stable identity

## Type Safety

All components are fully typed:

```typescript
// Components import and use types from community types
import { CommunityThread, ThreadComment, MemberRequest } from '../pages/community/types';

interface ComponentProps {
  data: CommunityThread;
  onAction: (id: string) => void;
  isLoading?: boolean;
}
```

## Testing

### Unit Tests

```typescript
// Example test for PostCard
describe('PostCard', () => {
  it('renders thread content', () => {
    render(<PostCard thread={mockThread} onThreadClick={vi.fn()} />);
    expect(screen.getByText(mockThread.content)).toBeInTheDocument();
  });

  it('calls onLike when like button clicked', () => {
    const onLike = vi.fn();
    render(<PostCard thread={mockThread} onLike={onLike} onThreadClick={vi.fn()} />);
    userEvent.click(screen.getByRole('button', { name: /like/i }));
    expect(onLike).toHaveBeenCalledWith(mockThread.id);
  });
});
```

## Export

All components are exported from `src/components/community/index.ts`:

```typescript
export { PostCard } from './PostCard';
export { CommentThread } from './CommentThread';
export { CreatePostForm } from './CreatePostForm';
export { ThreadModal } from './ThreadModal';
export { MemberCard } from './MemberCard';
export { MemberRequestCard } from './MemberRequest';
export { CommunitySidebar } from './CommunitySidebar';
```

## Import Example

```typescript
import {
  PostCard,
  CommentThread,
  CreatePostForm,
  ThreadModal,
  MemberCard,
  MemberRequestCard,
  CommunitySidebar,
} from '../components/community';
```
