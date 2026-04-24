import { useCallback, useEffect, useRef, useState } from "react";

import { historyService } from "@/services/history";
import type {
  SessionType,
  UnifiedSession,
} from "@/services/history/history.types";

import { useIsPremium } from "@/stores/usePremiumStore";

const FREE_SESSION_LIMIT = 3;
const PAGE_SIZE = 15;

function useHistory() {
  const isPremium = useIsPremium();
  const [sessions, setSessions] = useState<UnifiedSession[]>([]);

  const [sessionCount, setSessionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const [hasMore, setHasMore] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<SessionType | null>(null);

  const cursorRef = useRef<number | undefined>(undefined);
  const limit = isPremium ? PAGE_SIZE : FREE_SESSION_LIMIT;

  // Initial load + reload when filter changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [rows, count] = await Promise.all([
          historyService.getUnifiedSessions(
            limit,
            undefined,
            filterType ?? undefined,
          ),
          historyService.getUnifiedSessionCount(filterType ?? undefined),
        ]);

        if (cancelled) return;

        setSessions(rows);
        setSessionCount(count);

        setHasMore(isPremium && rows.length >= PAGE_SIZE);
        cursorRef.current =
          rows.length > 0 ? rows[rows.length - 1].startedAt : undefined;
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isPremium, limit, filterType]);

  // Load more (cursor-based pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !isPremium) return;

    setIsLoadingMore(true);
    try {
      const rows = await historyService.getUnifiedSessions(
        PAGE_SIZE,
        cursorRef.current,
        filterType ?? undefined,
      );

      setSessions((prev) => [...prev, ...rows]);
      setHasMore(rows.length >= PAGE_SIZE);

      cursorRef.current =
        rows.length > 0 ? rows[rows.length - 1].startedAt : undefined;
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, isPremium, filterType]);

  // Pull-to-refresh
  const refresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const [rows, count] = await Promise.all([
        historyService.getUnifiedSessions(
          limit,
          undefined,
          filterType ?? undefined,
        ),
        historyService.getUnifiedSessionCount(filterType ?? undefined),
      ]);

      setSessions(rows);
      setSessionCount(count);

      setHasMore(isPremium && rows.length >= PAGE_SIZE);
      cursorRef.current =
        rows.length > 0 ? rows[rows.length - 1].startedAt : undefined;
    } finally {
      setIsRefreshing(false);
    }
  }, [isPremium, limit, filterType]);

  // Delete session (optimistic + refetch to fill slots)
  const deleteSession = useCallback(
    async (id: string, type: SessionType) => {
      // Optimistic: remove from UI immediately
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setSessionCount((prev) => Math.max(0, prev - 1));

      try {
        await historyService.deleteUnifiedSession(id, type);

        // Refetch to fill the now-empty slot (important for free tier limit)
        const [rows, count] = await Promise.all([
          historyService.getUnifiedSessions(
            limit,
            undefined,
            filterType ?? undefined,
          ),
          historyService.getUnifiedSessionCount(filterType ?? undefined),
        ]);

        setSessions(rows);
        setSessionCount(count);

        setHasMore(isPremium && rows.length >= PAGE_SIZE);
        cursorRef.current =
          rows.length > 0 ? rows[rows.length - 1].startedAt : undefined;
      } catch {
        // Rollback on failure
        const [rows, count] = await Promise.all([
          historyService.getUnifiedSessions(
            limit,
            undefined,
            filterType ?? undefined,
          ),
          historyService.getUnifiedSessionCount(filterType ?? undefined),
        ]);

        setSessions(rows);
        setSessionCount(count);
      }
    },
    [limit, filterType, isPremium],
  );

  return {
    sessions,
    sessionCount,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    isPremium,
    freeLimit: FREE_SESSION_LIMIT,
    isLimited: !isPremium && sessionCount > FREE_SESSION_LIMIT,
    filterType,
    setFilterType,
    refresh,
    loadMore,
    deleteSession,
  };
}

export { useHistory };
