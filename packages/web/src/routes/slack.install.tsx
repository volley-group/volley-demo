import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/slack/install')({
  loader: async ({ context: { trpc } }) =>
    await trpc.getInstallationUrl.query().then((url) => (window.location.href = url)),
  // component: () => {
  //   useEffect(() => {
  //     installationUrl().then((url) => {
  //       window.location.href = url;
  //     });
  //   }, []);
  // },
});
