import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Trophy, FileText, Star, Target, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, React.ElementType> = {
  achievement_unlocked: Trophy,
  survey_response_received: FileText,
  survey_rated: Star,
  survey_target_reached: Target,
  survey_scheduled_published: Calendar,
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs === 1 ? "" : "s"} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return new Date(dateStr).toLocaleDateString();
}

const Notifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isPending } = useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: () => api.get<ApiNotification[]>("/notifications"),
  });

  const { data: unreadData } = useQuery({
    queryKey: queryKeys.notificationsUnread(),
    queryFn: () => api.get<{ unread_count: number }>("/notifications/unread-count"),
  });

  const unreadCount = unreadData?.unread_count ?? 0;

  const markReadMutation = useMutation({
    mutationFn: (id: number) => api.put<void>(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnread() });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.put<void>("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnread() });
    },
  });

  return (
    <AppShell withContainer mainClassName="max-w-2xl px-4 pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Notifications</span>
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="mr-2 h-3.5 w-3.5" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      {isPending ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <Card className="border-border/50 bg-card/50 p-10 backdrop-blur text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">No notifications yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You'll be notified about survey activity and achievements here.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = TYPE_ICON[notification.type] ?? Bell;
            const isUnread = !notification.is_read;

            return (
              <Card
                key={notification.id}
                onClick={() => {
                  if (isUnread && !markReadMutation.isPending) {
                    markReadMutation.mutate(notification.id);
                  }
                }}
                className={cn(
                  "flex cursor-pointer items-start gap-4 border-border/50 p-4 backdrop-blur transition-colors",
                  isUnread
                    ? "bg-primary/5 hover:bg-primary/10"
                    : "bg-card/50 hover:bg-card/80",
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    isUnread ? "bg-primary/15" : "bg-muted",
                  )}
                >
                  <Icon className={cn("h-4 w-4", isUnread ? "text-primary" : "text-muted-foreground")} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-semibold", isUnread ? "text-foreground" : "text-foreground/80")}>
                      {notification.title}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {relativeTime(notification.created_at)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{notification.body}</p>
                </div>

                {/* Unread dot */}
                {isUnread && (
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
};

export default Notifications;
