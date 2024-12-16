import { queryOptions } from '@tanstack/react-query';
import { hc } from '../lib/clients';

export const messagesQuery = queryOptions({
  queryKey: ['messages'],
  queryFn: () => hc['status-messages'].$get().then((r) => r.json()),
});
