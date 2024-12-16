import { SignUp } from '@clerk/clerk-react';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/sign-up/$')({
  component: RouteComponent,
  loader: ({ context }) => {
    if (context.user?.id) throw redirect({ to: '/feed' });
  },
});

function RouteComponent() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <SignUp signInForceRedirectUrl={'/signed-in'} forceRedirectUrl={'/signed-in'} />
    </div>
  );
}
