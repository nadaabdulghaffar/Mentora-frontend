# 🎓 Classroom Module - API Integration Contract

**Last Updated:** May 2026  
**Target Integrations:** Classroom, Sessions, Feed, Comments, Task Submissions

---

## 📚 CLASSROOM

### Get Classroom

**Endpoint Info**
- **Method:** GET
- **Route:** `/api/classroom/program/{programId}`
- **Description:** Retrieve classroom details linked to a program
- **Roles:** Mentor (owner), Enrolled Mentee

**Request**
- **Route Params:** `programId` (int)
- **Query Params:** None
- **Body:** None

**Response**
```typescript
interface Classroom {
  classroomId: number;
  programId: number;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string; // ISO datetime
}
```

**Example Success Response**
```json
{
  "classroomId": 1,
  "programId": 5,
  "title": "React Fundamentals 2026",
  "description": "Learn React from basics to advanced",
  "isActive": true,
  "createdAt": "2026-01-15T10:30:00Z"
}
```

**Example Error Response**
```json
{
  "success": false,
  "message": "Classroom not found or access denied",
  "statusCode": 404
}
```

**Frontend Notes**
- **React Query Key:** `["classroom", programId]`
- **Type:** Query (useQuery)
- **Optimistic Update:** No
- **Pagination:** N/A

**Missing Information**
- Error response structure/format not specified
- Success wrapper in response?

---

## 🎬 SESSIONS

### Create Session

**Endpoint Info**
- **Method:** POST
- **Route:** `/api/classroom/program/{programId}/sessions`
- **Description:** Schedule a new live session
- **Roles:** Mentor (owner only)

**Request**
- **Route Params:** `programId` (int)
- **Query Params:** None
- **Body:**
  - `title` (string, required)
  - `description` (string, optional)
  - `meetingLink` (string, required)
  - `scheduledAt` (string ISO datetime, required, must be future)

**Response**
```typescript
interface Session {
  sessionId: number;
  classroomId: number;
  title: string;
  description: string | null;
  meetingLink: string;
  scheduledAt: string; // ISO datetime UTC
  status: "Upcoming" | "Live" | "Completed" | "Cancelled";
  createdAt: string;
  dateDisplay: string; // "Today" | "Tomorrow" | "Apr 25, 2026"
  timeDisplay: string; // "2:00 PM"
}
```

**Example Success Response**
```json
{
  "sessionId": 42,
  "classroomId": 1,
  "title": "React Hooks Deep Dive",
  "description": "Advanced patterns and best practices",
  "meetingLink": "https://zoom.us/j/123456789",
  "scheduledAt": "2026-06-15T14:00:00Z",
  "status": "Upcoming",
  "createdAt": "2026-05-27T10:30:00Z",
  "dateDisplay": "Jun 15, 2026",
  "timeDisplay": "2:00 PM"
}
```

**Frontend Notes**
- **React Query Key:** `["sessions", programId]`
- **Type:** Mutation (useMutation)
- **Optimistic Update:** Yes (add to sessions list)
- **Pagination:** N/A

**Missing Information**
- Validation rules for `meetingLink` format?
- Max length for title/description?

---

### Update Session

**Endpoint Info**
- **Method:** PATCH
- **Route:** `/api/classroom/sessions/{sessionId}`
- **Description:** Update session details (cannot update cancelled/completed)
- **Roles:** Mentor (owner only)

**Request**
- **Route Params:** `sessionId` (int)
- **Body:** (all optional)
  - `title` (string)
  - `description` (string)
  - `meetingLink` (string)
  - `scheduledAt` (string ISO datetime, must be future if provided)

**Response**
```typescript
interface Session {
  // Same as Create Session response
}
```

**Frontend Notes**
- **React Query Key:** `["sessions", sessionId]`
- **Type:** Mutation
- **Optimistic Update:** Yes (update in list)

---

### Cancel Session

**Endpoint Info**
- **Method:** PATCH
- **Route:** `/api/classroom/sessions/{sessionId}/cancel`
- **Description:** Cancel upcoming/live session
- **Roles:** Mentor (owner only)

**Request**
- **Route Params:** `sessionId` (int)
- **Body:** None

**Response**
```typescript
interface CancelResponse {
  success: boolean;
  message: string; // "Session cancelled successfully"
}
```

**Frontend Notes**
- **React Query Key:** `["sessions", sessionId]`
- **Type:** Mutation
- **Optimistic Update:** Yes (set status to "Cancelled")

---

### Get Sessions (List)

**Endpoint Info**
- **Method:** GET
- **Route:** `/api/classroom/program/{programId}/sessions`
- **Description:** Get all future sessions (status: Upcoming/Live, ordered by date ascending)
- **Roles:** Mentor (owner), Enrolled Mentee

**Request**
- **Route Params:** `programId` (int)
- **Query Params:** None

**Response**
```typescript
interface Session[] {
  // Array of Session objects (see Create Session)
}
```

**Frontend Notes**
- **React Query Key:** `["sessions", "list", programId]`
- **Type:** Query
- **Optimistic Update:** N/A
- **Pagination:** No (returns all)

---

### Get Upcoming Session

**Endpoint Info**
- **Method:** GET
- **Route:** `/api/classroom/program/{programId}/sessions/upcoming`
- **Description:** Get next upcoming/live session with `isJoinable` flag
- **Roles:** Mentor (owner), Enrolled Mentee

**Request**
- **Route Params:** `programId` (int)
- **Query Params:** None

**Response**
```typescript
interface Session {
  sessionId: number;
  classroomId: number;
  title: string;
  description: string | null;
  meetingLink: string;
  scheduledAt: string;
  status: "Upcoming" | "Live" | "Completed" | "Cancelled";
  createdAt: string;
  dateDisplay: string;
  timeDisplay: string;
  isJoinable: boolean; // true if 15min before or already Live
}
```

**Frontend Notes**
- **React Query Key:** `["sessions", "upcoming", programId]`
- **Type:** Query
- **Polling:** Recommended (check isJoinable every 1-2 minutes)

**Missing Information**
- What if no upcoming session exists? Null or error?
- Should return empty object or null?

---

## 💬 FEED

### Get Feed

**Endpoint Info**
- **Method:** GET
- **Route:** `/api/classroom/program/{programId}/feed`
- **Description:** Get paginated feed (pinned posts first, then newest-first)
- **Roles:** Mentor (owner), Enrolled Mentee

**Request**
- **Route Params:** `programId` (int)
- **Query Params:**
  - `page` (int, optional, default: 1)
  - `pageSize` (int, optional, default: 10)

**Response**
```typescript
interface FeedResponse {
  posts: Post[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

interface Post {
  postId: number;
  classroomId: number;
  authorId: number;
  authorName: string;
  content: string;
  isPinned: boolean;
  likeCount: number;
  isLikedByUser: boolean;
  commentCount: number;
  comments: Comment[]; // Array of 2 most recent top-level comments
  createdAt: string;
  updatedAt: string | null;
}

interface Comment {
  commentId: number;
  postId: number;
  authorId: number;
  authorName: string;
  content: string;
  likeCount: number;
  isLikedByUser: boolean;
  replies: Reply[];
  createdAt: string;
  updatedAt: string | null;
}

interface Reply {
  commentId: number; // or replyId?
  parentCommentId: number;
  authorId: number;
  authorName: string;
  content: string;
  likeCount: number;
  isLikedByUser: boolean;
  createdAt: string;
  updatedAt: string | null;
}
```

**Example Success Response**
```json
{
  "posts": [
    {
      "postId": 101,
      "classroomId": 1,
      "authorId": 5,
      "authorName": "John Mentor",
      "content": "Welcome to the course!",
      "isPinned": true,
      "likeCount": 15,
      "isLikedByUser": false,
      "commentCount": 8,
      "comments": [
        {
          "commentId": 201,
          "postId": 101,
          "authorId": 6,
          "authorName": "Alice Student",
          "content": "Thanks for the course!",
          "likeCount": 3,
          "isLikedByUser": true,
          "replies": [],
          "createdAt": "2026-05-26T15:30:00Z",
          "updatedAt": null
        }
      ],
      "createdAt": "2026-05-27T10:00:00Z",
      "updatedAt": null
    }
  ],
  "totalCount": 25,
  "currentPage": 1,
  "totalPages": 3,
  "pageSize": 10
}
```

**Frontend Notes**
- **React Query Key:** `["feed", programId, page]`
- **Type:** Query (useInfiniteQuery recommended)
- **Pagination:** Yes (page-based, default size 10)
- **Optimistic Update:** Yes (add post to top of list)

---

### Create Post

**Endpoint Info**
- **Method:** POST
- **Route:** `/api/classroom/program/{programId}/feed/posts`
- **Description:** Create new post in feed
- **Roles:** Mentor (owner), Enrolled Mentee

**Request**
- **Route Params:** `programId` (int)
- **Body:**
  - `content` (string, required, max length?)

**Response**
```typescript
interface Post {
  // Same as Get Feed Post object
  postId: number;
  classroomId: number;
  authorId: number;
  authorName: string;
  content: string;
  isPinned: false; // New posts never pinned
  likeCount: 0;
  isLikedByUser: false;
  commentCount: 0;
  comments: [];
  createdAt: string;
  updatedAt: null;
}
```

**Frontend Notes**
- **React Query Key:** `["feed", programId]`
- **Type:** Mutation
- **Optimistic Update:** Yes (prepend to feed)

---

### Update Post

**Endpoint Info**
- **Method:** PATCH
- **Route:** `/api/classroom/program/{programId}/feed/posts/{postId}`
- **Description:** Edit post content
- **Roles:** Post author only

**Request**
- **Route Params:** `programId` (int), `postId` (int)
- **Body:**
  - `content` (string, required)

**Response**
```typescript
interface Post {
  // Same as Create Post response
}
```

**Frontend Notes**
- **React Query Key:** `["feed", "post", postId]`
- **Type:** Mutation
- **Optimistic Update:** Yes

---

### Delete Post

**Endpoint Info**
- **Method:** DELETE
- **Route:** `/api/classroom/program/{programId}/feed/posts/{postId}`
- **Description:** Soft-delete post
- **Roles:** Post author OR Mentor (owner)

**Request**
- **Route Params:** `programId` (int), `postId` (int)
- **Body:** None

**Response**
```typescript
interface DeleteResponse {
  success: boolean;
  message: string;
}
```

**Frontend Notes**
- **React Query Key:** `["feed", postId]`
- **Type:** Mutation
- **Optimistic Update:** Yes (remove from feed)

---

### Toggle Pin Post

**Endpoint Info**
- **Method:** PATCH
- **Route:** `/api/classroom/program/{programId}/feed/posts/{postId}/pin`
- **Description:** Toggle pin status (mentor only)
- **Roles:** Mentor (owner only)

**Request**
- **Route Params:** `programId` (int), `postId` (int)
- **Body:** None

**Response**
```typescript
interface Post {
  postId: number;
  isPinned: boolean; // New state after toggle
  // Other post fields...
}
```

**Frontend Notes**
- **React Query Key:** `["feed", "post", postId]`
- **Type:** Mutation
- **Optimistic Update:** Yes (toggle isPinned locally)

---

### Toggle Like Post

**Endpoint Info**
- **Method:** POST
- **Route:** `/api/classroom/program/{programId}/feed/posts/{postId}/like`
- **Description:** Like/unlike post (idempotent toggle)
- **Roles:** Mentor (owner), Enrolled Mentee

**Request**
- **Route Params:** `programId` (int), `postId` (int)
- **Body:** None

**Response**
```typescript
interface LikeResponse {
  postId: number;
  likeCount: number;
  isLikedByUser: boolean; // New state after toggle
}
```

**Frontend Notes**
- **React Query Key:** `["feed", "post", postId, "likes"]`
- **Type:** Mutation
- **Optimistic Update:** Yes (toggle locally first)

---

## 💬 COMMENTS

### Get Comments

**Endpoint Info**
- **Method:** GET
- **Route:** `/api/classroom/program/{programId}/feed/posts/{postId}/comments`
- **Description:** Get full comment thread (top-level comments + nested replies)
- **Roles:** Mentor (owner), Enrolled Mentee

**Request**
- **Route Params:** `programId` (int), `postId` (int)
- **Query Params:** None

**Response**
```typescript
interface Comment[] {
  commentId: number;
  postId: number;
  parentCommentId: null; // null for top-level
  authorId: number;
  authorName: string;
  content: string;
  likeCount: number;
  isLikedByUser: boolean;
  replies: Comment[]; // Nested replies
  createdAt: string;
  updatedAt: string | null;
}
```

**Example Success Response**
```json
[
  {
    "commentId": 201,
    "postId": 101,
    "parentCommentId": null,
    "authorId": 6,
    "authorName": "Alice",
    "content": "Great post!",
    "likeCount": 2,
    "isLikedByUser": false,
    "replies": [
      {
        "commentId": 202,
        "postId": 101,
        "parentCommentId": 201,
        "authorId": 7,
        "authorName": "Bob",
        "content": "I agree!",
        "likeCount": 0,
        "isLikedByUser": false,
        "replies": [],
        "createdAt": "2026-05-26T16:00:00Z",
        "updatedAt": null
      }
    ],
    "createdAt": "2026-05-26T15:30:00Z",
    "updatedAt": null
  }
]
```

**Frontend Notes**
- **React Query Key:** `["comments", postId]`
- **Type:** Query
- **Pagination:** N/A (loads all)

---

### Create Comment/Reply

**Endpoint Info**
- **Method:** POST
- **Route:** `/api/classroom/program/{programId}/feed/posts/{postId}/comments`
- **Description:** Add top-level comment or reply to existing comment
- **Roles:** Mentor (owner), Enrolled Mentee

**Request**
- **Route Params:** `programId` (int), `postId` (int)
- **Body:**
  - `content` (string, required)
  - `parentCommentId` (int, optional) — provide to reply; null/omit for top-level

**Response**
```typescript
interface Comment {
  commentId: number;
  postId: number;
  parentCommentId: number | null;
  authorId: number;
  authorName: string;
  content: string;
  likeCount: 0;
  isLikedByUser: false;
  replies: [];
  createdAt: string;
  updatedAt: null;
}
```

**Frontend Notes**
- **React Query Key:** `["comments", postId]`
- **Type:** Mutation
- **Optimistic Update:** Yes (add to appropriate position)

---

### Update Comment

**Endpoint Info**
- **Method:** PATCH
- **Route:** `/api/classroom/program/{programId}/feed/comments/{commentId}`
- **Description:** Edit comment or reply
- **Roles:** Comment author only

**Request**
- **Route Params:** `programId` (int), `commentId` (int)
- **Body:**
  - `content` (string, required)

**Response**
```typescript
interface Comment {
  // Same structure with updated content
}
```

**Frontend Notes**
- **Type:** Mutation
- **Optimistic Update:** Yes

---

### Delete Comment

**Endpoint Info**
- **Method:** DELETE
- **Route:** `/api/classroom/program/{programId}/feed/comments/{commentId}`
- **Description:** Soft-delete comment or reply
- **Roles:** Comment author OR Mentor (owner)

**Request**
- **Route Params:** `programId` (int), `commentId` (int)
- **Body:** None

**Response**
```typescript
interface DeleteResponse {
  success: boolean;
  message: string;
}
```

**Frontend Notes**
- **Type:** Mutation
- **Optimistic Update:** Yes (remove from thread)

---

### Toggle Like Comment

**Endpoint Info**
- **Method:** POST
- **Route:** `/api/classroom/program/{programId}/feed/comments/{commentId}/like`
- **Description:** Like/unlike comment or reply
- **Roles:** Mentor (owner), Enrolled Mentee

**Request**
- **Route Params:** `programId` (int), `commentId` (int)
- **Body:** None

**Response**
```typescript
interface LikeResponse {
  commentId: number;
  likeCount: number;
  isLikedByUser: boolean;
}
```

**Frontend Notes**
- **Type:** Mutation
- **Optimistic Update:** Yes

---

## 📝 TASK SUBMISSIONS

### Create Submission

**Endpoint Info**
- **Method:** POST
- **Route:** `/api/tasksubmission/tasks/{taskId}`
- **Description:** Create submission for a task
- **Roles:** Mentee only

**Request**
- **Route Params:** `taskId` (int)
- **Body:**
  - `title` (string, required)
  - `links` (object array, optional):
    - `url` (string, required)
    - `label` (string, required)
  - `notesForMentor` (string, optional)
  - `publish` (boolean, required) — false = Draft, true = Submitted

**Response**
```typescript
interface Submission {
  submissionId: number;
  taskId: number;
  menteeId: number;
  title: string;
  links: { url: string; label: string }[];
  notesForMentor: string | null;
  status: "Draft" | "Submitted" | "Reviewed";
  grade: number | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**Example Success Response**
```json
{
  "submissionId": 50,
  "taskId": 5,
  "menteeId": 10,
  "title": "My React Component",
  "links": [
    { "url": "https://github.com/user/repo", "label": "GitHub Repo" },
    { "url": "https://myapp.vercel.app", "label": "Live Demo" }
  ],
  "notesForMentor": "Used hooks as suggested",
  "status": "Submitted",
  "grade": null,
  "feedback": null,
  "createdAt": "2026-05-27T12:00:00Z",
  "updatedAt": "2026-05-27T12:00:00Z"
}
```

**Frontend Notes**
- **React Query Key:** `["submission", taskId]`
- **Type:** Mutation
- **Optimistic Update:** Yes

**Missing Information**
- Max length for title/notes?
- Max array length for links?

---

### Update Submission

**Endpoint Info**
- **Method:** PATCH
- **Route:** `/api/tasksubmission/{submissionId}`
- **Description:** Update submission (partial update supported)
- **Roles:** Mentee only

**Request**
- **Route Params:** `submissionId` (int)
- **Body:** (all optional)
  - `title` (string)
  - `links` (object array)
  - `notesForMentor` (string)
  - `publish` (boolean)

**Response**
```typescript
interface Submission {
  // Same as Create Submission
}
```

**Frontend Notes**
- **Type:** Mutation
- **Optimistic Update:** Yes

---

### Delete Submission

**Endpoint Info**
- **Method:** DELETE
- **Route:** `/api/tasksubmission/{submissionId}`
- **Description:** Permanently delete submission
- **Roles:** Mentee only

**Request**
- **Route Params:** `submissionId` (int)
- **Body:** None

**Response**
```typescript
interface DeleteResponse {
  success: boolean;
  message: string;
}
```

**Frontend Notes**
- **Type:** Mutation
- **Optimistic Update:** Yes

---

### Get My Submission

**Endpoint Info**
- **Method:** GET
- **Route:** `/api/tasksubmission/tasks/{taskId}/my`
- **Description:** Get current mentee's submission for a task
- **Roles:** Mentee only

**Request**
- **Route Params:** `taskId` (int)
- **Query Params:** None

**Response**
```typescript
interface Submission {
  // Same as Create Submission
}
```

**Frontend Notes**
- **React Query Key:** `["submission", "my", taskId]`
- **Type:** Query

**Missing Information**
- What if no submission exists? Null or error?

---

### Get Phase Tasks (with submission status)

**Endpoint Info**
- **Method:** GET
- **Route:** `/api/tasksubmission/phases/{phaseId}/tasks`
- **Description:** Get all tasks in phase with mentee's personal submission status
- **Roles:** Mentee only

**Request**
- **Route Params:** `phaseId` (int)
- **Query Params:**
  - `status` (optional) — "Draft" | "Submitted" | "Reviewed" | empty = all

**Response**
```typescript
interface Task[] {
  taskId: number;
  phaseName: string;
  title: string;
  description: string;
  // ... other task fields
  menteeSubmissionStatus: "Draft" | "Submitted" | "Reviewed" | null; // null if no submission
}
```

**Frontend Notes**
- **React Query Key:** `["tasks", "phase", phaseId, status]`
- **Type:** Query

**Missing Information**
- Full task schema needed
- What other task fields exist?

---

### Get Roadmap Submissions

**Endpoint Info**
- **Method:** GET
- **Route:** `/api/tasksubmission/roadmaps/{roadmapId}/submissions`
- **Description:** Get all submissions for every task in roadmap
- **Roles:** Mentor only (mentor must own roadmap)

**Request**
- **Route Params:** `roadmapId` (int)
- **Query Params:**
  - `status` (optional) — "Draft" | "Submitted" | "Reviewed" | empty = non-reviewed

**Response**
```typescript
interface SubmissionWithTask[] {
  submissionId: number;
  taskId: number;
  taskTitle: string;
  phaseName: string;
  menteeId: number;
  menteeName: string;
  status: "Draft" | "Submitted" | "Reviewed";
  grade: number | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**Frontend Notes**
- **React Query Key:** `["submissions", "roadmap", roadmapId, status]`
- **Type:** Query
- **Pagination:** Likely needed (not specified)

---

### Get Program Submissions

**Endpoint Info**
- **Method:** GET
- **Route:** `/api/tasksubmission/programs/{programId}/submissions`
- **Description:** Get all submissions for tasks in program's roadmap
- **Roles:** Mentor only (mentor must own program)

**Request**
- **Route Params:** `programId` (int)
- **Query Params:**
  - `status` (optional) — "Draft" | "Submitted" | "Reviewed"

**Response**
```typescript
interface SubmissionWithTask[] {
  // Same as Get Roadmap Submissions
}
```

**Frontend Notes**
- **React Query Key:** `["submissions", "program", programId, status]`
- **Type:** Query

---

### Review Submission

**Endpoint Info**
- **Method:** POST
- **Route:** `/api/tasksubmission/{submissionId}/review`
- **Description:** Grade submission or request revision
- **Roles:** Mentor only

**Request**
- **Route Params:** `submissionId` (int)
- **Body:**
  - `grade` (number, required) — score/grade value
  - `feedback` (string, required)
  - `requestRevision` (boolean, optional, default: false) — true = revert to Draft

**Response**
```typescript
interface Submission {
  submissionId: number;
  status: "Submitted" | "Reviewed" | "Draft"; // Draft if requestRevision=true
  grade: number | null;
  feedback: string;
  updatedAt: string;
}
```

**Frontend Notes**
- **React Query Key:** `["submission", submissionId]`
- **Type:** Mutation
- **Optimistic Update:** Yes

**Missing Information**
- Grade validation range (0-100)?
- What happens if both fields missing?

---

### Get Task Registry (Analytics)

**Endpoint Info**
- **Method:** GET
- **Route:** `/api/tasksubmission/programs/{programId}/task-registry`
- **Description:** Get analytics overview for all tasks in program
- **Roles:** Mentor only (mentor must own program)
- **Prerequisite:** Program must have attached roadmap

**Request**
- **Route Params:** `programId` (int)
- **Query Params:** None

**Response**
```typescript
interface TaskRegistry {
  success: boolean;
  data: TaskAnalytics[];
}

interface TaskAnalytics {
  taskId: number;
  taskName: string;
  phaseName: string;
  totalStudents: number;
  totalSubmissions: number;
  reviewedSubmissions: number;
  averageScore: number | null;
  submissionRate: number; // 0-1
  reviewRate: number; // 0-1
  completionRate: number; // 0-1
  status: "Done" | "StillRunning";
}
```

**Example Success Response**
```json
{
  "success": true,
  "data": [
    {
      "taskId": 5,
      "taskName": "Build a REST API",
      "phaseName": "Phase 1: Backend Basics",
      "totalStudents": 12,
      "totalSubmissions": 9,
      "reviewedSubmissions": 6,
      "averageScore": 78.5,
      "submissionRate": 0.75,
      "reviewRate": 0.67,
      "completionRate": 0.50,
      "status": "StillRunning"
    }
  ]
}
```

**Frontend Notes**
- **React Query Key:** `["analytics", "tasks", programId]`
- **Type:** Query
- **Caching:** Can cache longer (static data)

---

## 🚨 CRITICAL MISSING INFORMATION

| Item | Issue |
|------|-------|
| **Error Schema** | What's the standard error response format? |
| **JWT/Token** | How is auth passed? (Bearer, Cookie?) |
| **Validation Errors** | What does a 400 validation error look like? |
| **Rate Limiting** | Any rate limits to consider? |
| **Status Codes** | List of all HTTP status codes by endpoint |
| **No Submission Response** | When getting "my submission" with no data, return 404 or null? |
| **Unique Constraints** | Can a mentee submit multiple times per task? |
| **Soft Delete** | Should deleted posts/comments return in queries? |
| **Feed Order** | When pinned posts tie, what's secondary sort? |
| **Reply Depth** | Are nested replies supported (replies to replies)? |
| **Comment Pagination** | Should full comment thread be paginated? |
| **Session Validation** | Constraints on scheduledAt format/timezone? |
| **Link Validation** | URL format validation rules? |

---

## ✅ READY FOR IMPLEMENTATION

**Frontend Stack:**
- React Query v5+ (useQuery, useMutation, useInfiniteQuery)
- TypeScript strict mode
- Suggested keys provided for all endpoints
- Optimistic update guidance included

**Next Steps:**
1. Confirm all missing information with backend
2. Create typed React Query hooks
3. Implement with abort controllers for cancellation
4. Add error boundary + toast notifications
