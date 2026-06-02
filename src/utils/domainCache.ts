import lookupAPI from "../services/lookupService";

let domainsById = new Map<number, string>();
let loadPromise: Promise<void> | null = null;

export async function ensureDomainsLoaded(): Promise<void> {
  if (domainsById.size > 0) {
    return;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      const response = await lookupAPI.getDomains();

      if (response.success && response.data) {
        domainsById = new Map(
          response.data.map((domain) => [
            Number(domain.id),
            domain.name,
          ])
        );
      }
    } catch (error) {
      console.error("Failed to load domains", error);
    }
  })();

  return loadPromise;
}

export function getDomainName(
  domainId: number
): string {
  return (
    domainsById.get(domainId) ||
    (domainId > 0 ? `Domain ${domainId}` : "General")
  );
}

export function getDomainOptions(): Array<{
  id: number;
  name: string;
}> {
  return Array.from(domainsById.entries()).map(
    ([id, name]) => ({ id, name })
  );
}

export function resetDomainCacheForTests(): void {
  domainsById = new Map();
  loadPromise = null;
}
