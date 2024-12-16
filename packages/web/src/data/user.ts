import { queryOptions } from '@tanstack/react-query';
import { hc } from '../lib/clients';

export const userIdQuery = queryOptions({
  queryKey: ['userId'],
  queryFn: () => hc['userId'].$get().then((r) => r.json()),
});

export const userQuery = queryOptions({
  queryKey: ['user'],
  queryFn: () => hc['user'].$get().then((r) => r.json()),
});
