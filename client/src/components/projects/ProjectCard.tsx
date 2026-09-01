import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GithubMark } from "@/components/common/BrandIcons";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Project } from "@/types";
import { cn, formatCount, initials } from "@/lib/utils";

interface Props {
  project: Project;
  className?: string;
}

/** Grid card used on Projects, Explore and the profile Projects tab. */
export function ProjectCard({ project, className }: Props) {
  const { toast } = useToast();
  const [starred, setStarred] = useState(!!project.starred);
  const [stars, setStars] = useState(project.starsCount);

  const toggleStar = async () => {
    const prev = { starred, stars };
    setStarred(!starred);
    setStars(stars + (starred ? -1 : 1));
    try {
      const res = await api.toggleStar(project._id);
      setStarred(res.starred);
      setStars(res.starsCount);
    } catch {
      setStarred(prev.starred);
      setStars(prev.stars);
      toast({ variant: "destructive", title: "Couldn't update your star" });
    }
  };

  const openRoles = project.collaboration?.open
    ? project.collaboration.roles
    : [];

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40",
        className
      )}
    >
      <Link to={`/projects/${project._id}`} className="block">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt=""
            loading="lazy"
            className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="aspect-[16/9] w-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-2">
          <Link
            to={`/projects/${project._id}`}
            className="min-w-0 flex-1 font-semibold leading-snug hover:underline"
          >
            {project.name}
          </Link>
          <button
            type="button"
            onClick={toggleStar}
            aria-pressed={starred}
            aria-label={starred ? "Unstar project" : "Star project"}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors",
              starred
                ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Star className={cn("h-3.5 w-3.5", starred && "fill-current")} />
            {formatCount(stars)}
          </button>
        </div>

        {project.tagline && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
            {project.tagline}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 4).map((t) => (
            <Badge key={t} variant="muted">
              {t}
            </Badge>
          ))}
          {project.techStack.length > 4 && (
            <Badge variant="muted">+{project.techStack.length - 4}</Badge>
          )}
        </div>

        {openRoles.length > 0 && (
          <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-emerald-400">
            <Users className="h-3.5 w-3.5" />
            Looking for {openRoles.slice(0, 2).join(", ")}
            {openRoles.length > 2 && ` +${openRoles.length - 2}`}
          </p>
        )}

        <footer className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
          <Link
            to={`/u/${project.owner.username}`}
            className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={project.owner.avatar} alt="" />
              <AvatarFallback className="text-[10px]">
                {initials(project.owner.fullName)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">@{project.owner.username}</span>
          </Link>

          <span className="ml-auto flex items-center gap-2.5 text-xs text-muted-foreground">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${project.name} on GitHub`}
                className="transition-colors hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
              </a>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatCount(project.viewsCount)}
            </span>
          </span>
        </footer>
      </div>
    </article>
  );
}
