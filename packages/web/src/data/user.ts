import { queryOptions } from '@tanstack/react-query';
import { hc } from '../lib/clients';
import { atom, createStore } from 'jotai';

export const workspaceAtom = atom<number>();
export const userStore = createStore();
userStore.set(workspaceAtom, undefined);

export const userQuery = queryOptions({
  queryKey: ['user'],
  queryFn: () => hc['user'].$get().then((r) => r.json()),
});
