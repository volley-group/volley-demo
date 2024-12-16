import { queryOptions } from '@tanstack/react-query';
import { hc } from '../lib/clients';

export const messagesQuery = (installationId: number) =>
  queryOptions({
    queryKey: ['messages', installationId],
    queryFn: () =>
      hc['status-messages'].$get({ query: { installationId: installationId.toString() } }).then((r) => r.json()),
  });
