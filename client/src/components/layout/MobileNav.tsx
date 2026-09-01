import { NavLink, useNavigate } from "react-router-dom";
import { Home, Compass, Plus, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import { initials, cn } from "@/lib/utils";

const items = [
  { label: "Home", to: "/", icon: Home, end: true },
  { label: "Explore", to: "/explore", icon: Compass },
];

/** Fixed bottom navigation for mobile / tablet (< lg). */
export function MobileNav({ onCreate }: { onCreate: () => void }) {
  const { user } = useAuth();
  const { unread } = useNotifications();
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
      isActive ? "text-primary" : "text-muted-foreground"
    );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center border-t border-border/60 bg-background/90 backdrop-blur-lg lg:hidden">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className={linkClass}>
          <it.icon className="h-5 w-5" />
          {it.label}
        </NavLink>
      ))}

      <button
        onClick={onCreate}
        aria-label="Create post"
        className="flex flex-1 flex-col items-center justify-center"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-white shadow-glow">
          <Plus className="h-5 w-5" />
        </span>
      </button>

      <NavLink to="/notifications" className={linkClass}>
        <span className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-1.5 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
        Alerts
      </NavLink>

      <button
        onClick={() => user && navigate(`/u/${user.username}`)}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground"
      >
        {user && (
          <Avatar className="h-5 w-5">
            <AvatarImage src={user.avatar} alt={user.fullName} />
            <AvatarFallback className="text-[8px]">
              {initials(user.fullName)}
            </AvatarFallback>
          </Avatar>
        )}
        Profile
      </button>
    </nav>
  );
}
