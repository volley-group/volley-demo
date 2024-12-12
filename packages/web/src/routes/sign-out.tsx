import { useAuth } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sign-out')({
  preload: false,
  component: () => {
    const { signOut } = useAuth();
    signOut();
  },
});
