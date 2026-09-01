import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Star,
  Users,
  Eye,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/common/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.getProject(id);
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <ErrorState
          title="Project not found"
          description={error || "This project doesn't exist"}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="px-4 py-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-3 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        {/* Cover Image */}
        {project.coverImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 overflow-hidden rounded-xl"
          >
            <img
              src={project.coverImage}
              alt={project.name}
              className="h-64 w-full object-cover"
            />
          </motion.div>
        )}

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h1 className="mb-2 text-3xl font-bold">{project.name}</h1>
          {project.tagline && (
            <p className="text-lg text-muted-foreground">{project.tagline}</p>
          )}

          {/* Author */}
          <div className="mt-4 flex items-center gap-3">
            <Link to={`/profile/${project.author.username}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={project.author.avatar} />
                <AvatarFallback>{project.author.username.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link
                to={`/profile/${project.author.username}`}
                className="font-semibold hover:underline"
              >
                {project.author.username}
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatDate(project.createdAt)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {project.liveUrl && (
              <Button variant="gradient" asChild>
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Live Demo
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button variant="outline" asChild>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  View Code
                </a>
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {project.stars || 0} stars
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {project.views || 0} views
            </span>
          </div>
        </motion.div>

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="mb-3 text-xl font-semibold">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="mb-3 text-xl font-semibold">About</h2>
          <p className="whitespace-pre-wrap text-muted-foreground">{project.description}</p>
        </motion.div>

        {/* Collaboration */}
        {project.lookingForCollaborators && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-primary/30 bg-primary/5 p-6"
          >
            <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
              <Users className="h-5 w-5 text-primary" />
              Looking for Collaborators
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              This project is open to collaboration. Reach out if you're interested!
            </p>
            <Button variant="gradient">Request to Collaborate</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
