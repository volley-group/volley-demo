import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: () => {},
  loader: () => {
    throw redirect({ to: '/feed' });
  },
});
