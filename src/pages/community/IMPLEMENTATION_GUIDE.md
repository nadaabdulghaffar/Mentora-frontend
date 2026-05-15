# Community Flow Implementation Guide

## Quick Start

### 1. Install the Community Page

In your routing configuration (e.g., `App.tsx`):

```typescript
import CommunityPage from './pages/community/CommunityPage';

// Add to your routes
<Route path="/community/:id" element={<CommunityPage />} />
```

### 2. Import Components

For standalone usage:

```typescript
import {
  PostCard,
  CommentThread,
  CreatePostForm,
  ThreadModal,
  MemberCard,
  CommunitySidebar,
} from './components/community';
```

### 3. Import Hooks

For state management:

```typescript
import { useCommunityModal, useThreads, useCommunity } from './pages/community/hooks';
```

### 4. Import Utilities

For business logic:

```typescript
import {
  searchThreads,
  sortThreads,
  filterThreadsByCategory,
  getTrendingThreads,
  validateThreadContent,
} from './pages/community/utils/threadUtils';
```

---

## Integration Examples

### Using PostCard in a Custom Layout

```tsx
import { PostCard } from './components/community';
import { CommunityThread } from './pages/community/types';

function MyCustomFeed({ threads }: { threads: CommunityThread[] }) {
  const [selectedThread, setSelectedThread] = useState<CommunityThread | null>(null);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {threads.map((thread) => (
        <PostCard
          key={thread.id}
          thread={thread}
          onThreadClick={setSelectedThread}
          onLike={(id) => console.log('Liked:', id)}
          isCompact={true}
        />
      ))}
    </div>
  );
}
```

### Using useThreads Hook Independently

```tsx
import { useThreads } from './pages/community/hooks';
import { MOCK_COMMUNITY_THREADS } from './pages/community/constants';

function MyThreadComponent() {
  const {
    threads,
    filter,
    setSearchQuery,
    setSortBy,
    setCategory,
  } = useThreads({ initialThreads: MOCK_COMMUNITY_THREADS });

  return (
    <>
      <input
        placeholder="Search..."
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <select onChange={(e) => setSortBy(e.target.value as any)}>
        <option value="recent">Recent</option>
        <option value="popular">Popular</option>
        <option value="trending">Trending</option>
      </select>

      {threads.map((thread) => (
        <div key={thread.id}>{thread.content}</div>
      ))}
    </>
  );
}
```

### Using CreatePostForm in a Modal

```tsx
import { CreatePostForm } from './components/community';
import { Modal } from './components/Modal';
import { COMMUNITY_CATEGORIES } from './pages/community/constants';

function PostCreationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const handleSubmit = async (payload) => {
    // Send to API
    const response = await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <CreatePostForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        categories={COMMUNITY_CATEGORIES}
        authorAvatar={userAvatar}
        authorName={userName}
      />
    </Modal>
  );
}
```

### Using useCommunity Hook

```tsx
import { useCommunity } from './pages/community/hooks';
import { MOCK_COMMUNITY, MOCK_MEMBERS, MOCK_MEMBER_REQUESTS } from './pages/community/constants';

function AdminPanel() {
  const {
    memberRequests,
    approveMemberRequest,
    rejectMemberRequest,
    isAdmin,
  } = useCommunity({
    initialCommunity: MOCK_COMMUNITY,
    initialMembers: MOCK_MEMBERS,
    initialRequests: MOCK_MEMBER_REQUESTS,
  });

  if (!isAdmin('current-user')) {
    return <div>Not authorized</div>;
  }

  return (
    <div>
      {memberRequests.map((request) => (
        <div key={request.id}>
          <h3>{request.name}</h3>
          <button onClick={() => approveMemberRequest(request.id)}>Approve</button>
          <button onClick={() => rejectMemberRequest(request.id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}
```

---

## API Integration

### Replacing Mock Data

Replace mock data constants with API calls in hooks:

```typescript
// In useThreads hook
const [threads, setThreads] = useState<CommunityThread[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  async function fetchThreads() {
    try {
      const response = await fetch(`/api/communities/${communityId}/threads`);
      const data = await response.json();
      setThreads(data.threads);
    } finally {
      setIsLoading(false);
    }
  }

  fetchThreads();
}, [communityId]);

// Return with loading state
return {
  threads: filteredThreads,
  isLoading,
  // ... rest of hook
};
```

### API Endpoints Mapping

```typescript
// Suggested API structure
GET    /api/communities/:id              # Get community
GET    /api/communities/:id/threads      # List threads
POST   /api/communities/:id/threads      # Create thread
PATCH  /api/threads/:id                  # Update thread
DELETE /api/threads/:id                  # Delete thread
POST   /api/threads/:id/like             # Like thread
GET    /api/threads/:id/comments         # Get comments
POST   /api/threads/:id/comments         # Add comment
PATCH  /api/comments/:id                 # Update comment
DELETE /api/comments/:id                 # Delete comment
GET    /api/communities/:id/members      # List members
POST   /api/communities/:id/members/join # Join community
DELETE /api/communities/:id/members      # Leave community
GET    /api/communities/:id/requests     # Member requests
POST   /api/communities/:id/requests/:id/approve
```

---

## State Management

### Option 1: Local State (Current Implementation)

Use the built-in hooks:

```typescript
const threads = useThreads({ initialThreads: [...] });
const community = useCommunity({ initialCommunity, initialMembers, initialRequests });
```

**Pros**: Simple, no external dependencies
**Cons**: Not persisted across page reloads

### Option 2: React Query (Recommended)

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

function CommunityPage() {
  const { data: threads, isLoading } = useQuery({
    queryKey: ['community', communityId, 'threads'],
    queryFn: () => fetchThreads(communityId),
  });

  const createThreadMutation = useMutation({
    mutationFn: (payload) => createThread(communityId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['community', communityId, 'threads']);
    },
  });

  // ...
}
```

**Pros**: Caching, auto-refetch, background updates
**Cons**: Additional dependency

### Option 3: Zustand Store

```typescript
import create from 'zustand';

const useCommunityStore = create((set) => ({
  threads: [],
  fetchThreads: async (communityId) => {
    const data = await fetch(`/api/communities/${communityId}/threads`);
    set({ threads: data.threads });
  },
}));
```

---

## Common Customizations

### Customize Colors

Tailwind classes in components use:
- `bg-blue-600` for primary
- `text-gray-900` for primary text
- `hover:bg-gray-50` for hover states

To change colors globally:

```css
/* tailwind.config.js */
theme: {
  colors: {
    primary: '#your-color',
  },
}
```

### Customize Pagination

In `constants.ts`:

```typescript
export const PAGINATION = {
  THREADS_PER_PAGE: 10,  // Change here
  COMMENTS_PER_PAGE: 5,
  MEMBERS_PER_PAGE: 20,
};
```

### Add New Categories

In `constants.ts`:

```typescript
export const COMMUNITY_CATEGORIES = [
  'General Discussion',
  'Career Advice',
  'Your New Category',  // Add here
  // ...
];
```

### Extend Comment Depth

In `CommentThread.tsx`:

```typescript
const maxDepth = 5; // Increase from 3
```

---

## Performance Optimization

### 1. Implement Pagination

```typescript
// In useThreads
const itemsPerPage = PAGINATION.THREADS_PER_PAGE;
const paginatedThreads = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  return filteredThreads.slice(start, start + itemsPerPage);
}, [filteredThreads, currentPage]);
```

### 2. Add Virtual Scrolling

For large lists, use `react-window`:

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={threads.length}
  itemSize={100}
>
  {({ index, style }) => (
    <div style={style}>
      <PostCard thread={threads[index]} {...props} />
    </div>
  )}
</FixedSizeList>
```

### 3. Debounce Search

```typescript
const debouncedSearch = useMemo(
  () => debounce(threads.setSearchQuery, 300),
  []
);

<input onChange={(e) => debouncedSearch(e.target.value)} />
```

### 4. Memoize Components

```typescript
export const PostCardMemo = React.memo(PostCard, (prev, next) => {
  return prev.thread.id === next.thread.id;
});
```

---

## Error Handling

### Add Error Boundaries

```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<ErrorPage />}>
  <CommunityPage />
</ErrorBoundary>
```

### Handle Loading States

```typescript
if (isLoading) return <LoadingSkeleton />;
if (error) return <ErrorMessage error={error} />;
if (threads.length === 0) return <EmptyState />;

return <ThreadsList threads={threads} />;
```

---

## Testing

### Test Components

```typescript
import { render, screen, userEvent } from '@testing-library/react';
import { PostCard } from './components/community/PostCard';

describe('PostCard', () => {
  it('renders thread content', () => {
    render(<PostCard thread={mockThread} onThreadClick={vi.fn()} />);
    expect(screen.getByText(mockThread.content)).toBeInTheDocument();
  });

  it('calls onThreadClick when clicked', () => {
    const onClick = vi.fn();
    render(<PostCard thread={mockThread} onThreadClick={onClick} />);
    userEvent.click(screen.getByRole('button', { name: /reply/i }));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Test Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useThreads } from './hooks';

describe('useThreads', () => {
  it('filters threads by search', () => {
    const { result } = renderHook(() => 
      useThreads({ initialThreads: mockThreads })
    );

    act(() => {
      result.current.setSearchQuery('test');
    });

    expect(result.current.threads).toHaveLength(1);
  });
});
```

---

## Deployment Checklist

- [ ] Replace mock data with API calls
- [ ] Add error handling and boundaries
- [ ] Test on mobile devices
- [ ] Add loading skeletons
- [ ] Implement pagination for large lists
- [ ] Set up analytics tracking
- [ ] Configure CDN for images
- [ ] Test accessibility with screen readers
- [ ] Optimize bundle size
- [ ] Set up monitoring and error tracking

---

## Troubleshooting

### Modal not closing

Check that `onClose` is called and state is updated:

```typescript
const handleClose = () => {
  setIsOpen(false);
  modalState.closeModal();
};
```

### Comments not appearing

Verify thread has comments array:

```typescript
thread.comments = thread.comments || [];
```

### Styles not applied

Check Tailwind is configured and imported:

```typescript
// In main.tsx or App.tsx
import './index.css';
```

### Types not found

Ensure imports are from correct path:

```typescript
import { CommunityThread } from '../pages/community/types';
```

### Components not rendering

Check that components are exported:

```typescript
export { PostCard } from './PostCard';
```

And imported correctly:

```typescript
import { PostCard } from './components/community';
```

---

## Next Steps

1. **Integrate with API** - Replace mock data with real API calls
2. **Add Authentication** - Implement user-specific features
3. **Add Notifications** - Notify users of replies
4. **Implement Moderation** - Admin tools for content management
5. **Add Analytics** - Track engagement metrics
6. **Optimize Performance** - Implement caching and pagination
7. **Enhance Search** - Full-text search capabilities
8. **Add Real-time** - WebSocket support for live updates
