/* ─────────────────────────────────────────────────────────────
 * DevLoop — notifications context
 * Shares the unread count + list between the top-bar bell and the
 * notifications page so marking-as-read stays consistent.
 * ───────────────────────────────────────────────────────────── */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NotificationItem } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface NotificationsContextValue {
  items: NotificationItem[];
  unread: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setUnread(0);
      return;
    }
    setLoading(true);
    try {
      const { items: list, unread: u } = await api.getNotifications();
      setItems(list);
      setUnread(u);
    } catch {
      /* ignore — surfaced on the page */
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markRead = useCallback(async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnread((u) => Math.max(0, u - 1));
    await api.markNotificationRead(id);
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    await api.markAllNotificationsRead();
  }, []);

  const value = useMemo(
    () => ({ items, unread, loading, refresh, markRead, markAllRead }),
    [items, unread, loading, refresh, markRead, markAllRead]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error("useNotifications must be used within a NotificationsProvider");
  return ctx;
}
