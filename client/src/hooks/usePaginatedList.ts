/* ─────────────────────────────────────────────────────────────
 * usePaginatedList — shared infinite-scroll state machine
 * Used by the feed, bookmarks, explore, projects and profile tabs.
 * ───────────────────────────────────────────────────────────── */
import { useCallback, useEffect, useRef, useState } from "react";
import type { Paginated } from "@/types";

interface Options<T> {
  /** Fetches one page. Must be stable or memoised by the caller. */
  fetchPage: (page: number) => Promise<Paginated<T>>;
  /**
   * Changing any value here resets to page 1 — pass filters, the active
   * username, a feed version counter, etc.
   */
  deps: unknown[];
  enabled?: boolean;
}

interface Result<T> {
  items: T[];
  /** First page is loading (show skeletons). */
  loading: boolean;
  /** A subsequent page is loading (show a spinner at the end). */
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  reload: () => void;
  /** Local mutation, e.g. removing a deleted item without a refetch. */
  setItems: (updater: (prev: T[]) => T[]) => void;
}

export function usePaginatedList<T>({
  fetchPage,
  deps,
  enabled = true,
}: Options<T>): Result<T> {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  /** Guards against out-of-order responses when deps change mid-flight. */
  const requestId = useRef(0);

  const depsKey = JSON.stringify(deps);

  // Load page 1 whenever the deps or reload key change.
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    setPage(1);

    fetchPage(1)
      .then((res) => {
        if (id !== requestId.current) return;
        setItems(res.items);
        setHasMore(res.pagination.hasMore);
      })
      .catch((e: unknown) => {
        if (id !== requestId.current) return;
        setError(e instanceof Error ? e.message : "Something went wrong.");
        setItems([]);
        setHasMore(false);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
    // fetchPage is intentionally excluded: callers rebuild it on every render,
    // and `deps` is the contract for when a refetch should happen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, reloadKey, enabled]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    const id = requestId.current;

    setLoadingMore(true);
    fetchPage(nextPage)
      .then((res) => {
        if (id !== requestId.current) return;
        // De-duplicate in case a new item shifted the page boundaries.
        setItems((prev) => {
          const seen = new Set(
            prev.map((item) => (item as { _id?: string })._id).filter(Boolean)
          );
          const fresh = res.items.filter((item) => {
            const key = (item as { _id?: string })._id;
            return key ? !seen.has(key) : true;
          });
          return [...prev, ...fresh];
        });
        setHasMore(res.pagination.hasMore);
        setPage(nextPage);
      })
      .catch((e: unknown) => {
        if (id !== requestId.current) return;
        setError(e instanceof Error ? e.message : "Couldn't load more.");
      })
      .finally(() => {
        if (id === requestId.current) setLoadingMore(false);
      });
  }, [fetchPage, hasMore, loading, loadingMore, page]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const mutate = useCallback(
    (updater: (prev: T[]) => T[]) => setItems((prev) => updater(prev)),
    []
  );

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    reload,
    setItems: mutate,
  };
}
