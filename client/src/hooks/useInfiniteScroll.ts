import { useEffect, useRef } from "react";

/**
 * Calls `onIntersect` when the returned ref enters the viewport.
 * Attach the ref to a sentinel element at the end of a list.
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>(
  onIntersect: () => void,
  enabled = true
) {
  const ref = useRef<T | null>(null);
  /** Kept in a ref so re-renders don't tear down the observer. */
  const handler = useRef(onIntersect);
  handler.current = onIntersect;

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handler.current();
      },
      // Start fetching before the sentinel is actually visible.
      { rootMargin: "400px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
}
