import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Incident } from "src/types/incident";

export function StatusBadge({ status }: { status: Incident["status"] }) {
  const variants = {
    investigating: "bg-warning text-warning-foreground hover:bg-warning/80",
    identified: "bg-info text-info-foreground hover:bg-info/80",
    monitoring: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    resolved: "bg-success text-success-foreground hover:bg-success/80",
  };

  return <Badge className={cn("capitalize", variants[status])}>{status}</Badge>;
}

export function ServiceBadge({ service }: { service: Incident["service"] }) {
  return (
    <Badge variant="outline" className="font-medium">
      {service}
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: Incident["severity"] }) {
  const variants = {
    critical: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    major: "bg-warning text-warning-foreground hover:bg-warning/80",
    minor: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  };

  return <Badge className={cn("capitalize", variants[severity])}>{severity}</Badge>;
}
