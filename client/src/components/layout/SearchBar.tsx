import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, User as UserIcon, Code2, FolderGit2, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import type { SearchResults } from "@/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { initials, cn } from "@/lib/utils";

/** Global search with a live grouped dropdown. */
export function SearchBar({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounced = useDebouncedValue(query, 250);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    if (debounced.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .search(debounced)
      .then((r) => active && setResults(r))
      .catch(() => active && setResults(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [debounced]);

  // Close on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    setQuery("");
    navigate(to);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const hasResults =
    results &&
    (results.people.length ||
      results.posts.length ||
      results.projects.length ||
      results.hackathons.length);

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <form onSubmit={submit}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search developers, posts, projects…"
            className="h-10 w-full rounded-full border border-border bg-muted/60 pl-9 pr-9 text-sm outline-none transition-colors focus:border-primary/50 focus:bg-background"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-12 z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-popover p-2 shadow-card">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          )}

          {!loading && !hasResults && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results for “{query}”.
            </div>
          )}

          {!loading && results && (
            <div className="space-y-1">
              {results.people.length > 0 && (
                <Group label="Developers" icon={UserIcon}>
                  {results.people.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => go(`/u/${u.username}`)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={u.avatar} alt={u.fullName} />
                        <AvatarFallback>{initials(u.fullName)}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {u.fullName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          @{u.username}
                        </span>
                      </span>
                    </button>
                  ))}
                </Group>
              )}

              {results.posts.length > 0 && (
                <Group label="Posts" icon={Code2}>
                  {results.posts.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => go(`/post/${p._id}`)}
                      className="block w-full truncate rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent"
                    >
                      {p.caption.slice(0, 70)}
                    </button>
                  ))}
                </Group>
              )}

              {results.projects.length > 0 && (
                <Group label="Projects" icon={FolderGit2}>
                  {results.projects.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => go(`/projects/${p._id}`)}
                      className="block w-full truncate rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent"
                    >
                      {p.name}
                    </button>
                  ))}
                </Group>
              )}

              {results.hackathons.length > 0 && (
                <Group label="Hackathons" icon={Trophy}>
                  {results.hackathons.map((h) => (
                    <button
                      key={h._id}
                      onClick={() => go("/hackathons")}
                      className="block w-full truncate rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent"
                    >
                      {h.name}
                    </button>
                  ))}
                </Group>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Group({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof UserIcon;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      {children}
    </div>
  );
}
