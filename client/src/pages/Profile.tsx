import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Link as LinkIcon, Calendar, Github } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/feed/PostCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { StreakHeatmap } from "@/components/profile/StreakHeatmap";
import { FollowButton } from "@/components/common/FollowButton";
import { Spinner } from "@/components/common/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { User, Post, Project } from "@/types";

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      setLoading(true);
      setError(null);
      try {
        const userData = await api.getUser(username);
        setUser(userData);
        // Fetch user's posts and projects
        const [postsData, projectsData] = await Promise.all([
          api.getUserPosts(username),
          api.getUserProjects(username),
        ]);
        setPosts(postsData);
        setProjects(projectsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <ErrorState title="Profile not found" description={error || "User doesn't exist"} />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Profile Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="text-2xl">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>
                {isOwnProfile ? (
                  <Button variant="outline">Edit Profile</Button>
                ) : (
                  <FollowButton user={user} />
                )}
              </div>

              {user.bio && <p className="mt-3 text-sm">{user.bio}</p>}

              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.location}
                  </span>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {user.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {user.github && (
                  <a
                    href={`https://github.com/${user.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <Github className="h-4 w-4" />
                    {user.github}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>

              {user.technologies && user.technologies.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {user.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-3 flex gap-4 text-sm">
                <span>
                  <strong className="text-foreground">
                    {user.followersCount || 0}
                  </strong>{" "}
                  followers
                </span>
                <span>
                  <strong className="text-foreground">
                    {user.followingCount || 0}
                  </strong>{" "}
                  following
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl">
            <TabsList className="grid h-auto w-full grid-cols-4 rounded-none border-b-0 bg-transparent p-0">
              <TabsTrigger
                value="posts"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="streak"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Streak
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                About
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          <TabsContent value="posts" className="mt-0">
            <div className="divide-y divide-border">
              {posts.length === 0 ? (
                <EmptyState title="No posts yet" description="No posts to show" />
              ) : (
                posts.map((post) => <PostCard key={post._id} post={post} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-0">
            <div className="p-4 sm:p-6">
              {projects.length === 0 ? (
                <EmptyState title="No projects yet" description="No projects to show" />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {projects.map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="streak" className="mt-0">
            <div className="p-4 sm:p-6">
              <h2 className="mb-4 text-xl font-semibold">Build Streak</h2>
              <StreakHeatmap username={username!} />
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-0">
            <div className="p-4 sm:p-6">
              <h2 className="mb-2 text-xl font-semibold">About</h2>
              <p className="text-muted-foreground">
                {user.bio || "No bio available"}
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
