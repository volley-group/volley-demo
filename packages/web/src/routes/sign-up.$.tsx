import { SignUp } from '@clerk/clerk-react';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/sign-up/$')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.userId) throw redirect({ to: '/feed' });
  },
});

function RouteComponent() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <SignUp signInForceRedirectUrl={'/signed-in'} forceRedirectUrl={'/signed-in'} />
    </div>
  );
}
