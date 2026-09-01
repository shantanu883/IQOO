import { useState } from "react";
import { Check, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  user: Pick<User, "_id" | "username"> & { following?: boolean };
  size?: "sm" | "default";
  className?: string;
  onChange?: (following: boolean, followersCount: number) => void;
}

/** Optimistic follow/unfollow toggle. Hides itself for the current user. */
export function FollowButton({
  user,
  size = "sm",
  className,
  onChange,
}: FollowButtonProps) {
  const { user: me } = useAuth();
  const [following, setFollowing] = useState(!!user.following);
  const [busy, setBusy] = useState(false);

  if (me && me._id === user._id) return null;

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next); // optimistic
    try {
      const res = await api.toggleFollow({
        _id: user._id,
        username: user.username,
      });
      setFollowing(res.following);
      onChange?.(res.following, res.followersCount);
    } catch {
      setFollowing(!next); // revert
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      size={size}
      variant={following ? "outline" : "default"}
      disabled={busy}
      onClick={toggle}
      className={cn("gap-1.5", className)}
    >
      {following ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5" />
          Follow
        </>
      )}
    </Button>
  );
}
