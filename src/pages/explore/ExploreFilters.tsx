import { useEffect, useState } from "react";
import lookupAPI from "../../services/lookupService";
import type { ExploreFiltersState, ExploreTab } from "./exploreTypes";

type LookupOption = { id: number; name: string };

type Props = {
  activeTab: ExploreTab;
  filters: ExploreFiltersState;
  onChange: (filters: ExploreFiltersState) => void;
  onClear: () => void;
};

export default function ExploreFilters({
  activeTab,
  filters,
  onChange,
  onClear,
}: Props) {
  const [domains, setDomains] = useState<LookupOption[]>([]);
  const [subDomains, setSubDomains] = useState<LookupOption[]>([]);
  const [educationLevels, setEducationLevels] = useState<LookupOption[]>([]);
  const [targetLevels, setTargetLevels] = useState<LookupOption[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);

  const showSubDomain = activeTab !== "communities";
  const showProgramFilters = activeTab === "programs";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await lookupAPI.getDomains();
        if (mounted && res.success && res.data) {
          setDomains(
            res.data.map((d) => ({ id: Number(d.id), name: d.name }))
          );
        }
      } catch (err) {
        console.error("Failed to load domains", err);
      } finally {
        if (mounted) setLoadingDomains(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!filters.domainId) {
      setSubDomains([]);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await lookupAPI.getSubDomains(String(filters.domainId));
        if (mounted && res.success && res.data) {
          setSubDomains(
            res.data.map((s) => ({ id: Number(s.id), name: s.name }))
          );
        }
      } catch (err) {
        console.error("Failed to load subdomains", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [filters.domainId]);

  useEffect(() => {
    if (!showProgramFilters) return;

    let mounted = true;
    (async () => {
      try {
        const [eduRes, levelRes] = await Promise.all([
          lookupAPI.getEducationStatuses(),
          lookupAPI.getCurrentLevels(),
        ]);

        if (!mounted) return;

        if (eduRes.success && eduRes.data) {
          setEducationLevels(
            eduRes.data.map((e, i) => ({
              id: Number(e.value) || i + 1,
              name: e.name,
            }))
          );
        }

        if (levelRes.success && levelRes.data) {
          setTargetLevels(
            levelRes.data.map((l, i) => ({
              id: Number(l.value) || i + 1,
              name: l.name,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load program filter options", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [showProgramFilters]);

  const patch = (partial: Partial<ExploreFiltersState>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <aside className="h-fit rounded-2xl bg-[#F3F4F7] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#222838]">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-primary"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-5 text-sm">


        <div>
          <p className="mb-2 font-medium text-[#262D3F]">Domain</p>
          <select
            value={filters.domainId ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              patch({
                domainId: value ? Number(value) : null,
                subDomainId: null,
              });
            }}
            className="w-full rounded-xl border border-[#DFE3ED] bg-white px-3 py-2.5 text-[#5D657A] outline-none"
          >
            <option value="">
              {loadingDomains ? "Loading…" : "All domains"}
            </option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {showSubDomain && (
          <div>
            <p className="mb-2 font-medium text-[#262D3F]">Sub-domain</p>
            <select
              value={filters.subDomainId ?? ""}
              disabled={!filters.domainId}
              onChange={(e) => {
                const value = e.target.value;
                patch({ subDomainId: value ? Number(value) : null });
              }}
              className="w-full rounded-xl border border-[#DFE3ED] bg-white px-3 py-2.5 text-[#5D657A] outline-none disabled:opacity-50"
            >
              <option value="">
                {filters.domainId ? "All sub-domains" : "Select a domain first"}
              </option>
              {subDomains.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showProgramFilters && (
          <>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filters.openedNow === true}
                onChange={(e) =>
                  patch({ openedNow: e.target.checked ? true : null })
                }
                className="h-4 w-4 rounded border-[#DFE3ED] text-primary focus:ring-primary/30"
              />
              <span className="font-medium text-[#262D3F]">Open now</span>
            </label>

            <div>
              <p className="mb-2 font-medium text-[#262D3F]">Target level</p>
              <select
                value={filters.targetLevel ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  patch({ targetLevel: value ? Number(value) : null });
                }}
                className="w-full rounded-xl border border-[#DFE3ED] bg-white px-3 py-2.5 text-[#5D657A] outline-none"
              >
                <option value="">Any level</option>
                {targetLevels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-2 font-medium text-[#262D3F]">Education level</p>
              <select
                value={filters.educationLevel ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  patch({ educationLevel: value ? Number(value) : null });
                }}
                className="w-full rounded-xl border border-[#DFE3ED] bg-white px-3 py-2.5 text-[#5D657A] outline-none"
              >
                <option value="">Any education</option>
                {educationLevels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
