import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderGit2, Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ChipSelect } from "@/components/common/ChipSelect";
import { ProjectComposerDialog } from "@/components/projects/ProjectComposerDialog";
import { api } from "@/lib/api";
import type { Project } from "@/types";

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

const SORT_OPTIONS = ["Latest", "Trending", "Most Starred"];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, string> = {};
      if (selectedTech !== "All") filters.technology = selectedTech;
      if (searchQuery) filters.search = searchQuery;

      if (sortBy === "Trending") filters.sort = "trending";
      else if (sortBy === "Most Starred") filters.sort = "stars";
      else filters.sort = "recent";

      const data = await api.projects.list(filters);
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTech, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleProjectCreated = () => {
    setComposerOpen(false);
    fetchProjects();
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <FolderGit2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Projects</h1>
                <p className="text-xs text-muted-foreground">
                  Discover and showcase developer projects
                </p>
              </div>
            </div>
            <Button
              variant="gradient"
              size="sm"
              className="gap-2"
              onClick={() => setComposerOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Project</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 border-b border-border bg-muted/30 px-4 py-3 sm:px-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4"
          />
        </form>

        {/* Technology Filter */}
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

        {/* Sort */}
        <div>
          <label className="mb-2 text-xs font-medium text-muted-foreground">Sort by</label>
          <ChipSelect options={SORT_OPTIONS} selected={sortBy} onChange={setSortBy} />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load projects"
            message={error}
            action={{ label: "Try again", onClick: fetchProjects }}
          />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title={searchQuery ? "No projects found" : "No projects yet"}
            message={
              searchQuery
                ? `No projects found matching "${searchQuery}"`
                : "Be the first to showcase a project!"
            }
            action={
              !searchQuery
                ? {
                    label: "Create Project",
                    onClick: () => setComposerOpen(true),
                  }
                : undefined
            }
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {projects.map((project, i) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Project Composer Dialog */}
      <ProjectComposerDialog
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
}
