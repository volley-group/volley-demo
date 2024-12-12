import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { ClassifiedMessage } from '@braid/functions/types';
import { useQuery } from '@tanstack/react-query';
import { hc } from '@/lib/clients';
import { Skeleton } from '../ui/skeleton';
import { useMemo } from 'react';

export function MessageCard({ message }: { message: ClassifiedMessage }) {
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
  const { isLoading, data } = useQuery({
    queryKey: ['products'],
    queryFn: () => hc['products'].$get().then((r) => r.json()),
  });

  if (isLoading || !data) {
    return (
      <Card className="overflow-hidden border-border/40 bg-card/60 backdrop-blur-[2px] transition-all hover:border-gray-300/20 hover:shadow-lg">
        <div className="p-6">
          {/* Service Alert Banner */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div>
                <Skeleton className="mb-1 h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div>
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </div>

            {/* Timestamp */}
            <div>
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const product = useMemo(() => {
    return data.products.find((p) => p.name === message.product)!;
  }, [data, message.product]);

  return (
    <Card className="overflow-hidden border-border/40 bg-card/60 backdrop-blur-[2px] transition-all hover:border-gray-300/20 hover:shadow-lg">
      <div className="p-6">
        {/* Service Alert Banner */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {product.logo && (
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/40 bg-background/80 p-2 shadow-sm">
                <img src={product.logo} alt={product.name} className="h-full w-full object-contain" />
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-muted-foreground">{product.name}</div>
              <div className="text-xl font-semibold text-foreground">{message.affectedServices.join(', ')}</div>
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
            <h3 className="mb-2 text-lg font-semibold text-foreground">{message.title}</h3>
            <p className="text-muted-foreground">{message.content}</p>
          </div>

          {/* Timestamp */}
          <div className="text-sm text-muted-foreground/80">
            <div>{format(message.pubDate, "MMM dd, yyyy 'at' HH:mm")}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
