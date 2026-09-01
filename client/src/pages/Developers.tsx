import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/common/FollowButton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ChipSelect } from "@/components/common/ChipSelect";
import { api } from "@/lib/api";
import type { User } from "@/types";

const TECHNOLOGIES = [
  "All",
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "React",
  "Node.js",
  "C++",
  "Go",
  "Rust",
  "Flutter",
  "AI/ML",
  "DevOps",
  "Cloud",
];

const EXPERIENCE_LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

export default function Developers() {
  const [developers, setDevelopers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState("All");
  const [experienceLevel, setExperienceLevel] = useState("All");

  const fetchDevelopers = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, string> = {};
      if (searchQuery) filters.search = searchQuery;
      if (selectedTech !== "All") filters.technology = selectedTech;
      if (experienceLevel !== "All") filters.experience = experienceLevel.toLowerCase();

      const data = await api.users.discover(filters);
      setDevelopers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load developers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTech, experienceLevel]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDevelopers();
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Discover Developers</h1>
              <p className="text-xs text-muted-foreground">
                Find developers with matching skills and interests
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 border-b border-border bg-muted/30 px-4 py-3 sm:px-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search developers by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4"
          />
        </form>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 text-xs font-medium text-muted-foreground">
              Technology
            </label>
            <ChipSelect
              options={TECHNOLOGIES}
              selected={selectedTech}
              onChange={setSelectedTech}
            />
          </div>
          <div>
            <label className="mb-2 text-xs font-medium text-muted-foreground">
              Experience
            </label>
            <ChipSelect
              options={EXPERIENCE_LEVELS}
              selected={experienceLevel}
              onChange={setExperienceLevel}
            />
          </div>
        </div>
      </div>

      {/* Developers Grid */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load developers"
            message={error}
            action={{ label: "Try again", onClick: fetchDevelopers }}
          />
        ) : developers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No developers found"
            message={
              searchQuery
                ? `No developers matching "${searchQuery}"`
                : "Try adjusting your filters"
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {developers.map((dev, i) => (
              <DeveloperCard key={dev._id} developer={dev} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface DeveloperCardProps {
  developer: User;
  index: number;
}

function DeveloperCard({ developer, index }: DeveloperCardProps) {
  // Calculate simple match score based on profile completeness
  const matchScore = Math.min(
    95,
    40 +
      (developer.bio ? 15 : 0) +
      (developer.technologies?.length || 0) * 5 +
      (developer.github ? 10 : 0) +
      (developer.stats?.projects || 0) * 2
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/35"
    >
      {/* Match Score */}
      {matchScore >= 70 && (
        <div className="mb-3 flex items-center gap-1.5 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-primary">{matchScore}% Match</span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <Link to={`/profile/${developer.username}`}>
          <Avatar className="h-14 w-14 transition-transform group-hover:scale-105">
            <AvatarImage src={developer.avatar} alt={developer.name} />
            <AvatarFallback className="text-lg">
              {developer.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 overflow-hidden">
          <Link to={`/profile/${developer.username}`}>
            <h3 className="truncate font-semibold transition-colors group-hover:text-primary">
              {developer.name}
            </h3>
          </Link>
          <p className="truncate text-sm text-muted-foreground">@{developer.username}</p>
          {developer.experience && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {developer.experience}
            </Badge>
          )}
        </div>
      </div>

      {developer.bio && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{developer.bio}</p>
      )}

      {developer.technologies && developer.technologies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {developer.technologies.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
          {developer.technologies.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{developer.technologies.length - 4}
            </Badge>
          )}
        </div>
      )}

      {developer.stats && (
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            <strong className="text-foreground">{developer.stats.followers || 0}</strong>{" "}
            followers
          </span>
          <span>
            <strong className="text-foreground">{developer.stats.projects || 0}</strong>{" "}
            projects
          </span>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/profile/${developer.username}`}>View Profile</Link>
        </Button>
        <FollowButton userId={developer._id} size="sm" />
      </div>
    </motion.div>
  );
}
