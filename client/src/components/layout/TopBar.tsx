import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  PenSquare,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchBar } from "./SearchBar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useNotifications } from "@/context/NotificationsContext";
import { initials } from "@/lib/utils";

export function TopBar({ onCreate }: { onCreate: () => void }) {
  const { user, logout, demoMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unread } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-lg md:px-6">
      <Link to="/" className="lg:hidden">
        <Logo size="sm" showText={false} />
      </Link>

      <SearchBar className="max-w-md flex-1" />

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="hidden sm:inline-flex"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          asChild
          className="relative"
          aria-label="Notifications"
        >
          <Link to="/notifications">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        </Button>

        <Button
          variant="gradient"
          size="sm"
          onClick={onCreate}
          className="hidden gap-2 sm:inline-flex"
        >
          <PenSquare className="h-4 w-4" />
          Create
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-0.5 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {user.fullName}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    @{user.username}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/u/${user.username}`)}>
                <UserIcon /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme} className="sm:hidden">
                {theme === "dark" ? <Sun /> : <Moon />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </DropdownMenuItem>
              {demoMode && (
                <>
                  <DropdownMenuSeparator />
                  <div className="flex items-center gap-2 px-2.5 py-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Demo mode — sample data
                  </div>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
