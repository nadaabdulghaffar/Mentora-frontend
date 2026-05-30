# 🎯 Classroom Module - Frontend Implementation Plan

**Target Stack:** React 18+ | TypeScript | React Query 5+ | Vite  
**Status:** Ready for Development  
**Last Updated:** May 2026

---

## 1️⃣ SUGGESTED FOLDER STRUCTURE

```
src/
├── api/
│   ├── classroom.ts           # API calls - raw
│   ├── sessions.ts
│   ├── feed.ts
│   ├── comments.ts
│   ├── submissions.ts
│   └── index.ts               # Barrel exports
│
├── services/
│   ├── classroomService.ts    # Business logic + React Query
│   ├── sessionService.ts
│   ├── feedService.ts
│   ├── commentService.ts
│   ├── submissionService.ts
│   └── index.ts
│
├── hooks/
│   ├── queries/
│   │   ├── useClassroom.ts
│   │   ├── useSessions.ts
│   │   ├── useFeed.ts
│   │   ├── useComments.ts
│   │   ├── useSubmissions.ts
│   │   └── index.ts
│   ├── mutations/
│   │   ├── useCreatePost.ts
│   │   ├── useUpdatePost.ts
│   │   ├── useDeletePost.ts
│   │   ├── useCreateSession.ts
│   │   └── index.ts
│   └── index.ts
│
├── types/
│   ├── api.ts                 # All API response types
│   ├── entities.ts            # Domain entities
│   ├── forms.ts               # Form input types
│   └── index.ts
│
├── mappers/
│   ├── classroom.mapper.ts
│   ├── session.mapper.ts
│   ├── feed.mapper.ts
│   ├── comment.mapper.ts
│   ├── submission.mapper.ts
│   └── index.ts
│
├── components/
│   ├── classroom/
│   │   ├── ClassroomView.tsx
│   │   ├── SessionCard.tsx
│   │   ├── SessionList.tsx
│   │   ├── Feed/
│   │   │   ├── PostCard.tsx
│   │   │   ├── CommentThread.tsx
│   │   │   ├── FeedContainer.tsx
│   │   │   └── index.ts
│   │   ├── Tasks/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── SubmissionForm.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── SkeletonLoader.tsx
│       ├── ErrorBoundary.tsx
│       ├── Toast.tsx
│       └── index.ts
│
├── pages/
│   ├── ClassroomPage.tsx
│   ├── SessionDetailPage.tsx
│   └── TaskSubmissionPage.tsx
│
├── utils/
│   ├── queryClient.ts         # React Query config
│   ├── dateFormatter.ts
│   ├── urlBuilder.ts
│   ├── debounce.ts
│   ├── classNames.ts
│   └── index.ts
│
├── constants/
│   ├── api.constants.ts       # Base URLs, timeouts
│   ├── queryKeys.ts           # All React Query keys
│   └── index.ts
│
└── config/
    └── environment.ts         # API endpoints by env
```

---

## 2️⃣ API INTEGRATION ORDER

| Phase | Features | Why This Order | Complexity |
|-------|----------|-----------------|-----------|
| **Phase 1** | Get Classroom | No dependencies, foundation | ⭐ Easy |
| **Phase 2** | Sessions CRUD | Depends on classroom context | ⭐⭐ Simple |
| **Phase 3** | Feed Read (GET) | Pure read, no mutations | ⭐ Easy |
| **Phase 4** | Posts & Likes | Simple mutations, isolated | ⭐⭐ Simple |
| **Phase 5** | Comments & Replies | Complex nesting, delete edge cases | ⭐⭐⭐ Medium |
| **Phase 6** | Task Submissions | Highest complexity: drafts, reviews | ⭐⭐⭐⭐ Hard |
| **Phase 7** | Analytics | Read-only, no real-time | ⭐ Easy |

**Reasoning:**
- Start simple → build confidence → tackle complex mutations
- Feed reads before feed writes (understand data shape first)
- Comments last (deep nesting + auth edge cases)
- Analytics last (lowest priority, pure reporting)

---

## 3️⃣ REACT QUERY PLAN

### Query Keys Strategy

```typescript
// Centralized in constants/queryKeys.ts
export const classroomKeys = {
  all: ['classroom'] as const,
  detail: (programId: number) => [...classroomKeys.all, 'detail', programId] as const,
};

export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (programId: number) => [...sessionKeys.lists(), programId] as const,
  upcoming: (programId: number) => [...sessionKeys.all, 'upcoming', programId] as const,
  detail: (sessionId: number) => [...sessionKeys.all, 'detail', sessionId] as const,
};

export const feedKeys = {
  all: ['feed'] as const,
  lists: () => [...feedKeys.all, 'list'] as const,
  list: (programId: number, page: number) => [...feedKeys.lists(), programId, page] as const,
  posts: (programId: number) => [...feedKeys.all, 'posts', programId] as const,
  post: (postId: number) => [...feedKeys.all, 'post', postId] as const,
};

export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (postId: number) => [...commentKeys.lists(), postId] as const,
};

export const submissionKeys = {
  all: ['submissions'] as const,
  mySubmission: (taskId: number) => [...submissionKeys.all, 'my', taskId] as const,
  programSubmissions: (programId: number, status?: string) => 
    [...submissionKeys.all, 'program', programId, status] as const,
};
```

### Query Configuration

| Feature | Type | Polling | Stale Time | Cache Time |
|---------|------|---------|------------|-----------|
| Classroom | Query | No | 5min | 10min |
| Sessions List | Query | No | 1min | 5min |
| Upcoming Session | Query | **Yes** (1min) | 30sec | 2min |
| Feed List | Query | No | 30sec | 2min |
| Comments | Query | No | 1min | 5min |
| My Submission | Query | No | 1min | 5min |

### Mutations & Invalidation

```typescript
// Pattern: After mutation succeeds, invalidate affected queries
createPost.mutate(
  { content },
  {
    onSuccess: (newPost) => {
      // Optimistic: prepend to list
      queryClient.setQueryData(
        feedKeys.list(programId, 1),
        (old) => ({ ...old, posts: [newPost, ...old.posts] })
      );
      // Invalidate to sync with server
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
    },
  }
);
```

**Invalidation Rules:**
- Create Post → invalidate `feedKeys.lists()`
- Update Post → invalidate `feedKeys.post(postId)`, `feedKeys.lists()`
- Delete Post → invalidate `feedKeys.lists()`
- Like Post → invalidate `feedKeys.post(postId)` only
- Create Comment → invalidate `commentKeys.list(postId)`, `feedKeys.post(postId)`
- Create Session → invalidate `sessionKeys.lists()`

### Polling Strategy

```typescript
// Only for "upcoming session" - recheck isJoinable every minute
const { data: upcomingSession } = useQuery({
  queryKey: sessionKeys.upcoming(programId),
  queryFn: () => fetchUpcomingSession(programId),
  refetchInterval: 60000, // 1 minute
  staleTime: 30000,       // Consider stale after 30sec
});
```

---

## 4️⃣ STATE MANAGEMENT PLAN

### What Goes Where?

| State Type | Location | Reason |
|-----------|----------|--------|
| Classroom data | React Query | Server source of truth |
| Sessions list | React Query | Large dataset, needs pagination |
| Current feed page | React Query + URL | Mix: cache feed, persist page in URL |
| Post being edited | Local state `useState` | Temporary, form-only |
| Comment form input | Local state `useState` | Temporary, lightweight |
| Post like count | React Query cache | User can toggle quickly |
| Toast messages | External lib (Sonner/hot-toast) | Global, temporary |
| User auth context | Context API | Rarely changes, needed everywhere |
| Form validation errors | Local state `useState` | Form-specific |

### Optimistic Updates Strategy

| Operation | Optimistic | Rollback | Notes |
|-----------|------------|----------|-------|
| Like Post | YES | Update count only | Fast UX |
| Create Post | YES | Prepend with temp ID | Show immediately |
| Delete Post | YES | Remove from list | Rollback if fails |
| Create Comment | YES | Add to thread | Rollback if fails |
| Edit Post | NO | Too risky | Wait for server |
| Update Session | NO | Complex merge | Wait for server |
| Submit Task | NO | Too important | Wait for server |

### No-Cache Items

- Form inputs (controlled components)
- UI flags (modal open/close)
- Loading overlays (temporary)
- Temporary user selections

---

## 5️⃣ API SERVICE LAYER PLAN

### Structure Pattern

```typescript
// services/classroomService.ts
import { useQuery } from '@tanstack/react-query';
import { classroomApi } from '@/api/classroom';
import { classroomKeys } from '@/constants/queryKeys';
import { classroomMapper } from '@/mappers';

export const useClassroom = (programId: number) => {
  return useQuery({
    queryKey: classroomKeys.detail(programId),
    queryFn: async () => {
      const raw = await classroomApi.getClassroom(programId);
      return classroomMapper.toClassroom(raw);
    },
    enabled: !!programId,
  });
};

// services/sessionService.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionApi } from '@/api/sessions';
import { sessionKeys } from '@/constants/queryKeys';
import { sessionMapper } from '@/mappers';

export const useSessions = (programId: number) => {
  return useQuery({
    queryKey: sessionKeys.list(programId),
    queryFn: async () => {
      const raw = await sessionApi.getSessions(programId);
      return raw.map(sessionMapper.toSession);
    },
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSessionInput) => sessionApi.createSession(data),
    onSuccess: (newSession, variables) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.lists(),
      });
    },
  });
};

export const useCancelSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number) => sessionApi.cancelSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.setQueryData(
        sessionKeys.detail(sessionId),
        (old: Session) => ({ ...old, status: 'Cancelled' })
      );
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
    },
  });
};
```

### Min Service Methods

| Service | Methods |
|---------|---------|
| **classroomService** | `useClassroom(programId)` |
| **sessionService** | `useSessions(programId)`, `useUpcomingSession(programId)`, `useCreateSession()`, `useUpdateSession()`, `useCancelSession()` |
| **feedService** | `useFeed(programId, page)`, `useCreatePost()`, `useUpdatePost()`, `useDeletePost()`, `usePinPost()`, `useLikePost()` |
| **commentService** | `useComments(postId)`, `useCreateComment()`, `useUpdateComment()`, `useDeleteComment()`, `useLikeComment()` |
| **submissionService** | `useMySubmission(taskId)`, `useCreateSubmission()`, `useUpdateSubmission()`, `useDeleteSubmission()`, `useReviewSubmission()`, `useTaskRegistry(programId)` |

---

## 6️⃣ MAPPER LAYER PLAN

### Why Mappers?

- **Decouple API responses from UI logic** — API changes don't break components
- **Type safety** — Transform `any` API responses to strict types
- **Normalize nested data** — Flatten or reshape before storing
- **Date handling** — Convert ISO strings to Date objects or formatted strings once

### Response Mapping Examples

```typescript
// mappers/session.mapper.ts
export const sessionMapper = {
  toSession: (raw: SessionApiResponse): Session => ({
    sessionId: raw.sessionId,
    title: raw.title,
    description: raw.description || '',
    meetingLink: raw.meetingLink,
    scheduledAt: new Date(raw.scheduledAt),
    status: raw.status,
    dateDisplay: raw.dateDisplay,
    timeDisplay: raw.timeDisplay,
    isJoinable: raw.isJoinable ?? false,
  }),
};

// mappers/feed.mapper.ts
export const feedMapper = {
  toPost: (raw: PostApiResponse): Post => ({
    postId: raw.postId,
    authorId: raw.authorId,
    authorName: raw.authorName,
    content: raw.content,
    isPinned: raw.isPinned,
    likeCount: raw.likeCount,
    isLikedByUser: raw.isLikedByUser,
    comments: raw.comments.map(feedMapper.toComment),
    createdAt: new Date(raw.createdAt),
  }),

  toComment: (raw: CommentApiResponse): Comment => ({
    commentId: raw.commentId,
    content: raw.content,
    authorName: raw.authorName,
    likeCount: raw.likeCount,
    isLikedByUser: raw.isLikedByUser,
    replies: raw.replies.map(feedMapper.toComment),
    createdAt: new Date(raw.createdAt),
  }),
};
```

### Mapper Naming

- `toEntity` — API response → UI entity
- `fromFormData` — Form input → API request body
- `toApiRequest` — UI state → API body

---

## 7️⃣ ERROR HANDLING PLAN

### Toast Strategy

```typescript
// In every mutation onError:
useMutation({
  mutationFn: createPost,
  onError: (error: AxiosError) => {
    if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.');
      // Redirect to login
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error.response?.status === 400) {
      toast.error(error.response.data?.message || 'Invalid input.');
    } else {
      toast.error('Failed to create post. Please try again.');
    }
  },
});
```

### Unauthorized Handling

```typescript
// Create axios interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state
      localStorage.removeItem('token');
      // Redirect to login
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

### Validation Error Handling

```typescript
// Backend returns field-level errors
onError: (error: AxiosError<ValidationError>) => {
  const errors = error.response?.data?.errors; // { field: 'title', message: 'Required' }
  setFieldErrors(errors);
  // OR show toast
  errors?.forEach(err => toast.error(err.message));
};
```

### Retry Strategy

```typescript
// Global retry config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Retry on network errors, not 4xx
        if (error.response?.status >= 400 && error.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

---

## 8️⃣ LOADING & EMPTY STATES

### Skeleton Loaders (Show While Fetching)

| Component | Show Skeleton | Notes |
|-----------|---------------|-------|
| Classroom header | YES | Entire classroom loading |
| Sessions list | YES | 3-4 skeleton cards |
| Feed posts | YES | 2-3 skeleton post cards |
| Comments thread | YES | When expanding post |
| Session details | YES | Full page skeleton |

### Optimistic UI (Immediate Feedback)

| Action | Optimistic | Reason |
|--------|-----------|--------|
| Like post | YES | User sees count +1 immediately |
| Create post | YES | Prepend to feed instantly |
| Create comment | YES | Add to thread instantly |
| Delete comment | YES | Remove from thread instantly |
| Pin post | YES | Move to top immediately |

### Empty States (When Data is Empty)

```typescript
{data?.posts.length === 0 ? (
  <EmptyState 
    icon={MessageSquare}
    title="No posts yet"
    description="Be the first to start a discussion!"
    action={<Button>Create Post</Button>}
  />
) : (
  <PostList posts={data.posts} />
)}
```

**When to show:**
- Feed with 0 posts
- Comments with 0 replies
- Submissions with 0 draft/submitted
- Sessions with 0 upcoming

---

## 9️⃣ KNOWN INTEGRATION RISKS

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Nested comment updates** | Like/edit on reply affects parent | Keep invalidation narrow: only invalidate the post's comment thread |
| **Optimistic rollback fails** | UI shows stale data | Check mutation `onError`, revert manually or refetch |
| **Pagination desync** | User on page 2, new post added, shifts items | Don't cache feed aggressively; refetch on mutation |
| **Timezone issues** | `scheduledAt` UTC but displayed as local | Use date formatter library; convert UTC→local in mapper |
| **Feed polling conflicts** | useInfiniteQuery + refetch = race condition | Use single `useQuery` for page, or `enabled: page === 1` for polling |
| **Session isJoinable lag** | Polling every 1min but user misses 15min window | Reduce poll interval to 30sec near session start time |
| **Comment author mismatch** | User deletes own comment but can't verify auth | Use `currentUserId` from context, check before showing delete button |
| **Like count race condition** | Multiple users like simultaneously, count desync | Accept eventual consistency; refetch on error |
| **Session cancel + in-progress** | User cancels session while live | Disable cancel button if status === 'Live' |

---

## 🔟 RECOMMENDED UTILITIES

### Date Formatting
```bash
npm install date-fns
```
```typescript
import { format, formatDistance, isToday, isTomorrow } from 'date-fns';

// Use in mapper or component
const dateDisplay = isToday(date) 
  ? 'Today'
  : isTomorrow(date)
  ? 'Tomorrow'
  : format(date, 'MMM dd, yyyy');
```

### Debouncing (Search, Input)
```typescript
import { useDebouncedValue } from '@mantine/hooks'; // or use-debounce
// Already have: lodash.debounce

const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebouncedValue(searchInput, 300);

useEffect(() => {
  if (debouncedSearch) {
    searchFeed(debouncedSearch);
  }
}, [debouncedSearch]);
```

### Query Params Helper
```bash
npm install qs
```
```typescript
import qs from 'qs';

// Build URL with params
const url = `/feed?${qs.stringify({ page: 1, status: 'submitted' })}`;
```

### Class Merging
```bash
npm install clsx
```
```typescript
import clsx from 'clsx';

<div className={clsx(
  'p-4 rounded',
  { 'bg-blue-500': isPinned, 'bg-white': !isPinned },
  isActive && 'shadow-lg'
)}>
</div>
```

### Toast Notifications (Already Available)
```typescript
// Use existing toast library
import { toast } from 'sonner'; // or react-hot-toast

toast.success('Post created!');
toast.error('Failed to submit');
toast.loading('Saving...');
```

### Form Validation
```bash
npm install react-hook-form zod
```
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  content: z.string().min(1, 'Cannot be empty').max(5000),
  parentCommentId: z.number().optional(),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

### HTTP Client (Already Configured)
```typescript
// Use existing axios setup with interceptors
import { api } from '@/config/api';

// GET
const { data } = await api.get('/classroom/program/5');

// POST
const { data } = await api.post('/classroom/program/5/feed/posts', { content: '...' });

// PATCH with partial update
await api.patch(`/sessions/${id}`, { title: 'New Title' });

// DELETE
await api.delete(`/posts/${id}`);
```

---

## ✅ IMPLEMENTATION CHECKLIST

**Phase 1: Setup**
- [ ] Create folder structure
- [ ] Setup React Query client + interceptors
- [ ] Create query keys constants
- [ ] Setup toast library

**Phase 2: Types & Mappers**
- [ ] Define all API response types
- [ ] Define all domain entity types
- [ ] Create all mappers

**Phase 3: API Layer**
- [ ] Create api/classroom.ts
- [ ] Create api/sessions.ts
- [ ] Create api/feed.ts
- [ ] Create api/comments.ts
- [ ] Create api/submissions.ts

**Phase 4: Services & Hooks**
- [ ] Create services with React Query hooks
- [ ] Test query keys work correctly
- [ ] Test mutations trigger invalidation

**Phase 5: Components**
- [ ] Build classroom layout
- [ ] Build session components
- [ ] Build feed components
- [ ] Build comment thread
- [ ] Build task submission form

**Phase 6: Integration & Testing**
- [ ] Connect to real API
- [ ] Test optimistic updates
- [ ] Test error handling
- [ ] Test edge cases (empty states, network errors)

---

## 🚀 QUICK START COMMAND

```bash
# Install core dependencies
npm install @tanstack/react-query axios date-fns clsx zod react-hook-form

# Optionally: form builder
npm install @hookform/resolvers

# Toast notifications (if not already installed)
npm install sonner

# Start implementing Phase 1
```

---

**Next Step:** Start with Phase 1 (Classroom endpoint) to validate API contract and React Query setup.

