export function resolveCommunityImageUrl(
  imageUrl?: string | null
): string {
  if (!imageUrl?.trim()) {
    return "";
  }

  const trimmed = imageUrl.trim();

  if (trimmed.startsWith("http") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  const apiRoot = (
    import.meta.env.VITE_API_URL ?? "http://localhost:5069/api"
  ).replace(/\/api\/?$/, "");

  const path = trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed}`;

  return `${apiRoot}${path}`;
}

export function toStorageCommunityImageUrl(
  url?: string | null
): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed || trimmed.startsWith("data:")) {
    return undefined;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  const apiRoot = (
    import.meta.env.VITE_API_URL ?? "http://localhost:5069/api"
  ).replace(/\/api\/?$/, "");

  if (trimmed.startsWith(apiRoot)) {
    const path = trimmed.slice(apiRoot.length);
    return path.startsWith("/") ? path : `/${path}`;
  }

  return trimmed;
}
