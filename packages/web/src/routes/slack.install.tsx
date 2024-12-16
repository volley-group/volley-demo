import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/slack/install')({
  loader: async ({ context: { hc } }) =>
    await hc['installation-url']
      .$get()
      .then((r) => r.json())
      .then((url) => (window.location.href = url)),
});
