import type { ApiResponse, ExploreSearchParams, PagedResult } from '../types/api';

/** Maps explore params to ASP.NET Core query string names. */
export function toExploreQueryParams(
  params: ExploreSearchParams
): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {};
  if (params.searchQuery !== undefined && params.searchQuery !== '')
    query.SearchQuery = params.searchQuery;
  if (params.domainId != null) query.DomainId = params.domainId;
  if (params.subDomainId != null) query.SubDomainId = params.subDomainId;
  if (params.recommendedForYou != null)
    query.RecommendedForYou = params.recommendedForYou;
  if (params.pageNumber != null) query.PageNumber = params.pageNumber;
  if (params.pageSize != null) query.PageSize = params.pageSize;
  if (params.openedNow != null) query.OpenedNow = params.openedNow;
  if (params.targetLevel != null) query.TargetLevel = params.targetLevel;
  if (params.educationLevel != null) query.EducationLevel = params.educationLevel;
  return query;
}

export function unwrapPagedExplore<T>(
  response: { data?: ApiResponse<PagedResult<T>> },
  errorMessage: string
): PagedResult<T> {
  if (!response.data?.success || !response.data?.data) {
    throw new Error(response.data?.message || errorMessage);
  }
  return response.data.data;
}
