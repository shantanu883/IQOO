import { NavLink, Link } from "react-router-dom";
import { PenSquare } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mainNav } from "./navConfig";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function LeftSidebar({ onCreate }: { onCreate: () => void }) {
  const { user } = useAuth();
  const { unread } = useNotifications();

  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col gap-1 border-r border-border/60 px-4 py-5 lg:flex">
      <Link to="/" className="mb-5 px-2">
        <Logo size="md" />
      </Link>

      <nav className="flex flex-col gap-1">
        {mainNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3.5 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )
            }
          >
            <span className="relative">
              <item.icon className="h-5 w-5" />
              {item.label === "Notifications" && unread > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Button
        variant="gradient"
        className="mt-4 w-full gap-2"
        onClick={onCreate}
      >
        <PenSquare className="h-4 w-4" />
        Create Post
      </Button>

      <div className="flex-1" />

      {user && (
        <Link
          to={`/u/${user.username}`}
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 p-2.5 transition-colors hover:bg-accent"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar} alt={user.fullName} />
            <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">
              @{user.username}
            </p>
          </div>
        </Link>
      )}
    </aside>
  );
}
