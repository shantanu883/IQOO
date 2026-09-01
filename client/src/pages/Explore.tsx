import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Code2, FolderGit2, Users, Sparkles, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/feed/PostCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyState } from "@/components/common/EmptyState";
import { PostSkeleton } from "@/components/feed/PostSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { ChipSelect } from "@/components/common/ChipSelect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/common/FollowButton";
import { useAppOutlet } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import type { Post, Project, User } from "@/types";
import { Link } from "react-router-dom";

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

export default function Explore() {
  const { feedVersion } = useAppOutlet();
  const [activeTab, setActiveTab] = useState("code");
  const [selectedTech, setSelectedTech] = useState("All");

  // Trending code posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  // Trending projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Trending developers
  const [developers, setDevelopers] = useState<User[]>([]);
  const [devsLoading, setDevsLoading] = useState(false);
  const [devsError, setDevsError] = useState<string | null>(null);

  // Fetch trending code
  useEffect(() => {
    const fetchPosts = async () => {
      setPostsLoading(true);
      setPostsError(null);
      try {
        const filters: Record<string, string> = { sort: "trending" };
        if (selectedTech !== "All") filters.technology = selectedTech;
        const data = await api.posts.getFeed(filters);
        setPosts(data);
      } catch (err) {
        setPostsError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setPostsLoading(false);
      }
    };
    if (activeTab === "code") fetchPosts();
  }, [activeTab, selectedTech, feedVersion]);

  // Fetch trending projects
  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      setProjectsError(null);
      try {
        const filters: Record<string, string> = { sort: "trending" };
        if (selectedTech !== "All") filters.technology = selectedTech;
        const data = await api.projects.list(filters);
        setProjects(data);
      } catch (err) {
        setProjectsError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setProjectsLoading(false);
      }
    };
    if (activeTab === "projects") fetchProjects();
  }, [activeTab, selectedTech]);

  // Fetch trending developers
  useEffect(() => {
    const fetchDevelopers = async () => {
      setDevsLoading(true);
      setDevsError(null);
      try {
        const filters: Record<string, string> = { sort: "trending" };
        if (selectedTech !== "All") filters.technology = selectedTech;
        const data = await api.users.discover(filters);
        setDevelopers(data);
      } catch (err) {
        setDevsError(err instanceof Error ? err.message : "Failed to load developers");
      } finally {
        setDevsLoading(false);
      }
    };
    if (activeTab === "developers") fetchDevelopers();
  }, [activeTab, selectedTech]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Explore</h1>
              <p className="text-xs text-muted-foreground">
                Discover trending content from the developer community
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-[73px] z-10 border-b border-border bg-background/95 backdrop-blur-sm">
          <TabsList className="grid h-auto w-full grid-cols-4 rounded-none border-b-0 bg-transparent p-0">
            <TabsTrigger
              value="code"
              className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Code2 className="h-4 w-4" />
              <span className="hidden sm:inline">Code</span>
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <FolderGit2 className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger
              value="developers"
              className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Developers</span>
            </TabsTrigger>
            <TabsTrigger
              value="hackathons"
              className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Hackathons</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Technology Filter */}
        <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-6">
          <ChipSelect
            options={TECHNOLOGIES}
            selected={selectedTech}
            onChange={setSelectedTech}
          />
        </div>

        {/* Trending Code */}
        <TabsContent value="code" className="mt-0">
          <div className="divide-y divide-border">
            {postsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
            ) : postsError ? (
              <div className="p-4 sm:p-6">
                <ErrorState
                  title="Failed to load posts"
                  message={postsError}
                  action={{ label: "Try again", onClick: () => setActiveTab("code") }}
                />
              </div>
            ) : posts.length === 0 ? (
              <div className="p-4 sm:p-6">
                <EmptyState
                  icon={Code2}
                  title="No trending code"
                  message={
                    selectedTech === "All"
                      ? "Be the first to share code!"
                      : `No code posts found for ${selectedTech}`
                  }
                />
              </div>
            ) : (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            )}
          </div>
        </TabsContent>

        {/* Trending Projects */}
        <TabsContent value="projects" className="mt-0">
          <div className="p-4 sm:p-6">
            {projectsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 animate-pulse rounded-xl border border-border bg-card"
                  />
                ))}
              </div>
            ) : projectsError ? (
              <ErrorState
                title="Failed to load projects"
                message={projectsError}
                action={{ label: "Try again", onClick: () => setActiveTab("projects") }}
              />
            ) : projects.length === 0 ? (
              <EmptyState
                icon={FolderGit2}
                title="No trending projects"
                message={
                  selectedTech === "All"
                    ? "Be the first to showcase a project!"
                    : `No projects found for ${selectedTech}`
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Trending Developers */}
        <TabsContent value="developers" className="mt-0">
          <div className="p-4 sm:p-6">
            {devsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-xl border border-border bg-card"
                  />
                ))}
              </div>
            ) : devsError ? (
              <ErrorState
                title="Failed to load developers"
                message={devsError}
                action={{ label: "Try again", onClick: () => setActiveTab("developers") }}
              />
            ) : developers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No developers found"
                message={
                  selectedTech === "All"
                    ? "No developers to show"
                    : `No developers found for ${selectedTech}`
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {developers.map((dev) => (
                  <DeveloperCard key={dev._id} developer={dev} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Hackathons Tab */}
        <TabsContent value="hackathons" className="mt-0">
          <div className="p-4 sm:p-6">
            <div className="text-center">
              <EmptyState
                icon={Trophy}
                title="Hackathons coming soon"
                message="Check the Hackathons page for upcoming events"
                action={{
                  label: "View Hackathons",
                  onClick: () => (window.location.href = "/hackathons"),
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface DeveloperCardProps {
  developer: User;
}

function DeveloperCard({ developer }: DeveloperCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/35"
    >
      <div className="flex items-start gap-4">
        <Link to={`/profile/${developer.username}`}>
          <Avatar className="h-12 w-12 transition-transform group-hover:scale-105">
            <AvatarImage src={developer.avatar} alt={developer.name} />
            <AvatarFallback>{developer.name?.charAt(0) || "?"}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 overflow-hidden">
          <Link to={`/profile/${developer.username}`}>
            <h3 className="truncate font-semibold transition-colors group-hover:text-primary">
              {developer.name}
            </h3>
          </Link>
          <p className="truncate text-sm text-muted-foreground">@{developer.username}</p>
        </div>
        <FollowButton userId={developer._id} />
      </div>

      {developer.bio && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{developer.bio}</p>
      )}

      {developer.technologies && developer.technologies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {developer.technologies.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {developer.technologies.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{developer.technologies.length - 3}
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
    </motion.div>
  );
}
