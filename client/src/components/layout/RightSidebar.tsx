import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Trophy, Sparkles, Hash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { FollowButton } from "@/components/common/FollowButton";
import { api, type TrendingTech } from "@/lib/api";
import type { MatchResult, Hackathon } from "@/types";
import { formatCount, initials } from "@/lib/utils";

function SectionCard({
  title,
  icon: Icon,
  children,
  footer,
}: {
  title: string;
  icon: typeof TrendingUp;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      {children}
      {footer}
    </div>
  );
}

export function RightSidebar() {
  const [recs, setRecs] = useState<MatchResult[] | null>(null);
  const [tech, setTech] = useState<TrendingTech[] | null>(null);
  const [hacks, setHacks] = useState<Hackathon[] | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.getRecommendations().catch(() => []),
      api.getTrendingTech().catch(() => []),
      api.getHackathons().catch(() => []),
    ]).then(([r, t, h]) => {
      if (!active) return;
      setRecs(r.slice(0, 3));
      setTech(t.slice(0, 6));
      setHacks(h.slice(0, 2));
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <aside className="sticky top-0 hidden h-screen w-[320px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-border/60 px-5 py-6 xl:flex">
      {/* Who to follow */}
      <SectionCard title="Suggested developers" icon={Sparkles}>
        {!recs ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-3.5">
            {recs.map(({ user, matchScore, matchReasons }) => (
              <li key={user._id} className="flex items-center gap-3">
                <Link to={`/u/${user.username}`} className="shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.fullName} />
                    <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/u/${user.username}`}
                    className="block truncate text-sm font-semibold hover:underline"
                  >
                    {user.fullName}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="font-medium text-primary">
                      {matchScore}% match
                    </span>{" "}
                    · {matchReasons[0]}
                  </p>
                </div>
                <FollowButton user={user} />
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/explore"
          className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
        >
          See more
        </Link>
      </SectionCard>

      {/* Trending tech */}
      <SectionCard title="Trending technologies" icon={TrendingUp}>
        {!tech ? (
          <div className="space-y-2.5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            {tech.map((t, i) => (
              <li key={t.name}>
                <Link
                  to={`/explore?tech=${encodeURIComponent(t.name)}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-4 text-xs font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <Hash className="h-3.5 w-3.5 text-primary" />
                    {t.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatCount(t.posts)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* Hackathons */}
      <SectionCard title="Hackathons" icon={Trophy}>
        {!hacks ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <ul className="space-y-3">
            {hacks.map((h) => (
              <li key={h._id}>
                <Link
                  to="/hackathons"
                  className="block rounded-xl border border-border/60 p-3 transition-colors hover:bg-accent"
                >
                  <p className="text-sm font-semibold leading-tight">{h.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {h.mode} · {h.prize} prize
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatCount(h.participantsCount)} participants
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <p className="px-1 text-[11px] leading-relaxed text-muted-foreground/70">
        DevLoop · Built for developers. © {new Date().getFullYear()}
      </p>
    </aside>
  );
}
