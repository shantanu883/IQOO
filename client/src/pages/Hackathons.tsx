import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ExternalLink,
  Search,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ChipSelect } from "@/components/common/ChipSelect";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Hackathon } from "@/types";

const STATUS_OPTIONS = ["All", "Upcoming", "Ongoing", "Completed"];
const LOCATION_OPTIONS = ["All", "Online", "In-Person", "Hybrid"];

export default function Hackathons() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  const fetchHackathons = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, string> = {};
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter !== "All") filters.status = statusFilter.toLowerCase();
      if (locationFilter !== "All") filters.location = locationFilter.toLowerCase();

      const data = await api.hackathons.list(filters);
      setHackathons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hackathons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, locationFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHackathons();
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Hackathons</h1>
              <p className="text-xs text-muted-foreground">
                Find hackathons and build your team
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
            placeholder="Search hackathons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4"
          />
        </form>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="mb-2 text-xs font-medium text-muted-foreground">Status</label>
            <ChipSelect
              options={STATUS_OPTIONS}
              selected={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
          <div className="flex-1">
            <label className="mb-2 text-xs font-medium text-muted-foreground">
              Location
            </label>
            <ChipSelect
              options={LOCATION_OPTIONS}
              selected={locationFilter}
              onChange={setLocationFilter}
            />
          </div>
        </div>
      </div>

      {/* Hackathons List */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load hackathons"
            message={error}
            action={{ label: "Try again", onClick: fetchHackathons }}
          />
        ) : hackathons.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No hackathons found"
            message={
              searchQuery
                ? `No hackathons matching "${searchQuery}"`
                : "No hackathons available right now. Check back soon!"
            }
          />
        ) : (
          <div className="space-y-4">
            {hackathons.map((hackathon, i) => (
              <HackathonCard key={hackathon._id} hackathon={hackathon} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface HackathonCardProps {
  hackathon: Hackathon;
  index: number;
}

function HackathonCard({ hackathon, index }: HackathonCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "upcoming":
        return "bg-blue-500/10 text-blue-500";
      case "ongoing":
        return "bg-green-500/10 text-green-500";
      case "completed":
        return "bg-gray-500/10 text-gray-500";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group overflow-hidden transition-colors hover:border-primary/35">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Link to={`/hackathons/${hackathon._id}`}>
                <h3 className="text-lg font-bold transition-colors group-hover:text-primary">
                  {hackathon.name}
                </h3>
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                by {hackathon.organizer}
              </p>
            </div>
            <Badge className={getStatusColor(hackathon.status)}>
              {hackathon.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
            {hackathon.description}
          </p>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{hackathon.location}</span>
            </div>

            {hackathon.teamSize && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Team size: {hackathon.teamSize}</span>
              </div>
            )}

            {hackathon.prize && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>{hackathon.prize}</span>
              </div>
            )}
          </div>

          {hackathon.technologies && hackathon.technologies.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {hackathon.technologies.slice(0, 5).map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {hackathon.technologies.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{hackathon.technologies.length - 5}
                </Badge>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="gradient" size="sm" asChild>
              <Link to={`/hackathons/${hackathon._id}`}>
                View Details
                <ExternalLink className="ml-2 h-3 w-3" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/hackathons/${hackathon._id}/team-finder`}>
                <Users className="mr-2 h-3 w-3" />
                Find Team
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
