import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export type Incident = {
  id: string;
  title: string;
  // status: 'investigating' | 'monitoring' | 'resolved';
  // severity: 'critical' | 'major' | 'minor';
  timestamp: Date;
  product: string;
  service: string;
  description: string;
  productIcon?: string;
};

interface IncidentCardProps {
  incident: Incident;
}

export function IncidentCard({ incident }: IncidentCardProps) {
  // const statusColors = {
  //   investigating: 'bg-destructive text-destructive-foreground',
  //   monitoring: 'bg-orange-500/10 text-orange-700',
  //   resolved: 'bg-green-500 text-green-950',
  // };

  // const severityColors = {
  //   critical: 'bg-red-500/10 text-red-700 border-red-200',
  //   major: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  //   minor: 'bg-gray-100 text-gray-700 border-gray-200',
  // };

  return (
    <Card className="overflow-hidden border-border/40 bg-card/60 backdrop-blur-[2px] transition-all hover:border-gray-300/20 hover:shadow-lg">
      <div className="p-6">
        {/* Service Alert Banner */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {incident.productIcon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/40 bg-background/80 p-2 shadow-sm">
                <img src={incident.productIcon} alt={incident.product} className="h-full w-full object-contain" />
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-muted-foreground">{incident.product}</div>
              <div className="text-xl font-semibold text-foreground">{incident.service}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* <Badge
              variant="secondary"
              className={`${statusColors[incident.status]} pointer-events-none px-3 py-1 capitalize shadow-sm`}
            >
              {incident.status}
            </Badge>
            <Badge
              variant="outline"
              className={`${severityColors[incident.severity]} pointer-events-none border px-3 py-1 capitalize shadow-sm`}
            >
              {incident.severity}
            </Badge> */}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">{incident.title}</h3>
            <p className="text-muted-foreground">{incident.description}</p>
          </div>

          {/* Timestamp */}
          <div className="text-sm text-muted-foreground/80">
            <div>{format(incident.timestamp, "MMM dd, yyyy 'at' HH:mm")}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
