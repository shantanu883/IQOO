import { useState, type FormEvent } from "react";
import { X, Loader2, Upload, Link as LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChipSelect } from "@/components/common/ChipSelect";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const TECHNOLOGIES = [
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

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "AI/ML",
  "DevOps",
  "Cloud",
  "Data Science",
  "Cybersecurity",
  "Game Development",
  "Blockchain",
  "Other",
];

interface ProjectComposerDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProjectComposerDialog({
  open,
  onClose,
  onSuccess,
}: ProjectComposerDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [category, setCategory] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Project name required",
        description: "Please enter a project name",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Description required",
        description: "Please enter a project description",
      });
      return;
    }

    if (selectedTechs.length === 0) {
      toast({
        variant: "destructive",
        title: "Tech stack required",
        description: "Please select at least one technology",
      });
      return;
    }

    setLoading(true);
    try {
      await api.projects.create({
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        coverImage: coverImage.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        liveUrl: liveUrl.trim() || undefined,
        techStack: selectedTechs,
        category: category || "Other",
      });

      toast({
        title: "Project created!",
        description: "Your project has been published successfully.",
      });

      // Reset form
      setName("");
      setTagline("");
      setDescription("");
      setCoverImage("");
      setGithubUrl("");
      setLiveUrl("");
      setSelectedTechs([]);
      setCategory("");

      onSuccess?.();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to create project",
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTech = (tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create Project</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="My Awesome Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              disabled={loading}
            />
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              placeholder="A brief one-liner about your project"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={150}
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="What does your project do? What problem does it solve?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={1000}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">{description.length}/1000</p>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="coverImage"
                placeholder="https://example.com/image.png"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
          </div>

          {/* GitHub URL */}
          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub Repository</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="githubUrl"
                placeholder="https://github.com/username/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
          </div>

          {/* Live URL */}
          <div className="space-y-2">
            <Label htmlFor="liveUrl">Live Demo URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="liveUrl"
                placeholder="https://myproject.com"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <Label>
              Tech Stack <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {TECHNOLOGIES.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTech(tech)}
                  disabled={loading}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selectedTechs.includes(tech)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <ChipSelect
              options={CATEGORIES}
              selected={category || CATEGORIES[0]}
              onChange={setCategory}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
