import { useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { useNotifications } from "@/context/NotificationsContext";
import { formatDistanceToNow } from "@/lib/utils";

export default function Notifications() {
  const { notifications, loading, error, markAsRead, markAllAsRead, refetch } =
    useNotifications();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Notifications</h1>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Mark all read</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-border">
        {loading ? (
          <div className="flex justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-4 sm:p-6">
            <ErrorState
              title="Failed to load notifications"
              message={error}
              action={{ label: "Try again", onClick: refetch }}
            />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 sm:p-6">
            <EmptyState
              icon={Bell}
              title="No notifications"
              message="You're all caught up! Notifications will appear here when people interact with your content."
            />
          </div>
        ) : (
          notifications.map((notification, i) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`group relative px-4 py-4 transition-colors hover:bg-muted/50 sm:px-6 ${
                !notification.read ? "bg-primary/5" : ""
              }`}
            >
              {!notification.read && (
                <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
              )}

              <div className="flex gap-3">
                {notification.sender && (
                  <Link to={`/profile/${notification.sender.username}`}>
                    <Avatar className="h-10 w-10 transition-transform group-hover:scale-105">
                      <AvatarImage
                        src={notification.sender.avatar}
                        alt={notification.sender.name}
                      />
                      <AvatarFallback>
                        {notification.sender.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                )}

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm">
                      {notification.sender && (
                        <Link
                          to={`/profile/${notification.sender.username}`}
                          className="font-semibold hover:underline"
                        >
                          {notification.sender.name}
                        </Link>
                      )}{" "}
                      <span className="text-muted-foreground">{notification.message}</span>
                    </p>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => markAsRead(notification._id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt))}
                  </p>

                  {notification.link && (
                    <Link
                      to={notification.link}
                      className="mt-2 inline-block text-xs text-primary hover:underline"
                    >
                      View →
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
