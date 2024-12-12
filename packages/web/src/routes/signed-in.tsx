import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/signed-in')({
  component: Component,
  loader: async ({ context: { hc } }) => {
    const { to } = await hc['handle-sign-in'].$get().then((r) => r.json());
    throw redirect({ to });
  },
});

function Component() {
  const { hc } = Route.useRouteContext();
  const navigate = useNavigate();
  useEffect(() => {
    hc['handle-sign-in']
      .$get()
      .then((r) => r.json())
      .then(({ to }) => {
        console.log(to);
        navigate({ to: '/feed' });
      });
  }, []);
}
