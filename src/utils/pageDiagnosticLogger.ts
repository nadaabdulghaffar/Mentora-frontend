import { useEffect, useRef } from "react";

/** Temporary diagnostics — log page mount/unmount. */
export function usePageLifecycleDiagnostics(pageName: string): void {
  useEffect(() => {
    console.log(`[${pageName}] Mounted`);
    return () => {
      console.log(`[${pageName}] Unmounted`);
    };
  }, [pageName]);
}

/** Temporary diagnostics — count how many times a useEffect runs. */
export function useEffectRunDiagnostics(
  pageName: string,
  effectName: string,
  deps: unknown[]
): void {
  const runCountRef = useRef(0);

  useEffect(() => {
    runCountRef.current += 1;
    console.log(
      `[${pageName}] useEffect "${effectName}" run #${runCountRef.current} deps=${JSON.stringify(deps)}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- diagnostic deps snapshot only
  }, deps);
}

/** Temporary diagnostics — wrap async loaders with start/end timing logs. */
export async function withLoadingDiagnostics<T>(
  pageName: string,
  label: string,
  loader: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  console.log(`[${pageName}] Loading ${label}`);
  try {
    const result = await loader();
    console.log(
      `[${pageName}] ${label} loaded in ${Math.round(performance.now() - start)}ms`
    );
    return result;
  } catch (error) {
    console.error(
      `[${pageName}] ${label} failed after ${Math.round(performance.now() - start)}ms`,
      error
    );
    throw error;
  }
}
