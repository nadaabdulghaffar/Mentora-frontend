import { resolveProgramImageUrl } from '../../services/programService';

const apiRoot = (import.meta.env.VITE_API_URL ?? 'http://localhost:5069/api').replace(
  /\/api\/?$/,
  ''
);

const defaultProgramImage =
  'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80';

export type MentorApplicationProgramItem = {
  id: string;
  title: string;
  description: string;
  image?: string;
  applicantsCount?: number;
  deadline?: string;
  status: 'Open' | 'Closed';
};

export type ExploreStyleProgramItem = {
  id: string;
  title: string;
  description: string;
  image?: string;
  tag?: string;
  phases?: string;
  isApplied?: boolean;
  author?: { avatar: string; name: string };
};

export type MyProgramStyleItem = {
  id: string;
  title: string;
  description: string;
  tag: string;
  phases: string;
  image?: string;
  mentorName?: string;
  mentorAvatar?: string;
  progress?: number;
};

export function getProgramStatus(deadline?: string): 'Open' | 'Closed' {
  if (!deadline || deadline.startsWith('0001-01-01')) {
    return 'Open';
  }

  const today = new Date();
  const deadlineDate = new Date(deadline);
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  return deadlineDate >= today ? 'Open' : 'Closed';
}

export function formatDeadline(deadline?: string) {
  if (!deadline || deadline.startsWith('0001-01-01')) {
    return 'No deadline';
  }
  return new Date(deadline).toLocaleDateString();
}

export function mapPublishedProgramToMentorApplication(
  p: Record<string, unknown>
): MentorApplicationProgramItem {
  const deadline = (p.deadline ?? p.Deadline) as string | undefined;
  return {
    id: String(p.programId ?? p.ProgramId),
    title: String(p.title ?? p.Title ?? ''),
    description: String(p.description ?? p.Description ?? ''),
    image: resolveProgramImageUrl(
      String(p.programImageUrl ?? p.ProgramImageUrl ?? '')
    ),
    applicantsCount: 0,
    deadline,
    status: getProgramStatus(deadline),
  };
}

export function mapPublishedProgramToExploreStyle(
  p: Record<string, unknown>,
  mentorDisplay: { name: string; avatar?: string },
  isApplied = false
): ExploreStyleProgramItem {
  const imageUrl = String(p.programImageUrl ?? p.ProgramImageUrl ?? '');
  const resolvedImage = imageUrl
    ? resolveProgramImageUrl(imageUrl)
    : defaultProgramImage;

  return {
    id: String(p.programId ?? p.ProgramId),
    title: String(p.title ?? p.Title ?? ''),
    description: String(p.description ?? p.Description ?? ''),
    image: resolvedImage,
    tag: String(p.domainName ?? p.DomainName ?? 'PROGRAM').toUpperCase(),
    phases: String(p.subDomainName ?? p.SubDomainName ?? '').toUpperCase() || undefined,
    isApplied,
    author: {
      name: mentorDisplay.name,
      avatar:
        mentorDisplay.avatar ??
        `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(mentorDisplay.name)}`,
    },
  };
}

export function mapAcceptedApplicationToMyProgram(
  a: Record<string, unknown>
): MyProgramStyleItem {
  const imageUrl = String(a.programImageUrl ?? '');
  return {
    id: String(a.applicationId ?? a.programId),
    title: String(a.programTitle ?? ''),
    description: String(a.programDescription ?? ''),
    tag: String(a.mentorDomain ?? 'PROGRAM').toUpperCase(),
    phases: '8 Phases',
    image: imageUrl
      ? imageUrl.startsWith('http')
        ? imageUrl
        : `${apiRoot}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
      : undefined,
    mentorName: String(a.mentorName ?? 'Mentor'),
    mentorAvatar: a.mentorProfilePicture
      ? String(a.mentorProfilePicture)
      : undefined,
    progress: 0,
  };
}

export function isApiSuccess(envelope: unknown): boolean {
  if (!envelope || typeof envelope !== 'object') return false;
  const record = envelope as Record<string, unknown>;
  return record.success === true || record.Success === true;
}

export function extractPagedProgramItems(data: unknown): Record<string, unknown>[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data as Record<string, unknown>[];
  }
  if (typeof data !== 'object') return [];
  const record = data as Record<string, unknown>;
  const items = record.items ?? record.Items;
  return Array.isArray(items) ? (items as Record<string, unknown>[]) : [];
}

export function extractApiData<T = unknown>(envelope: unknown): T | null {
  if (!envelope || typeof envelope !== 'object') return null;
  const record = envelope as Record<string, unknown>;
  return (record.data ?? record.Data ?? null) as T | null;
}
