import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/common/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Hackathon } from "@/types";

export default function HackathonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHackathon = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.getHackathon(id);
        setHackathon(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load hackathon");
      } finally {
        setLoading(false);
      }
    };
    fetchHackathon();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="p-6">
        <ErrorState
          title="Hackathon not found"
          description={error || "This hackathon doesn't exist"}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="border-b border-border">
        <div className="px-4 py-4 sm:px-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Hackathons
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        <h1 className="mb-2 text-3xl font-bold">{hackathon.name}</h1>
        <p className="mb-6 text-muted-foreground">by {hackathon.organizer}</p>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm text-muted-foreground">
                {hackathon.startDate && hackathon.endDate
                  ? `${formatDate(hackathon.startDate)} - ${formatDate(hackathon.endDate)}`
                  : "TBA"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm text-muted-foreground">{hackathon.location}</p>
            </div>
          </div>

          {hackathon.teamSize && (
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Team Size</p>
                <p className="text-sm text-muted-foreground">{hackathon.teamSize}</p>
              </div>
            </div>
          )}

          {hackathon.prize && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Prize</p>
                <p className="text-sm text-muted-foreground">{hackathon.prize}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">About</h2>
          <p className="text-muted-foreground">{hackathon.description}</p>
        </div>

        {hackathon.technologies && hackathon.technologies.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {hackathon.technologies.map((tech) => (
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="gradient">
            <ExternalLink className="mr-2 h-4 w-4" />
            Register Now
          </Button>
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Find Team
          </Button>
        </div>
      </div>
    </div>
  );
}
