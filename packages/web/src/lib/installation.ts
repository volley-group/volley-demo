export const encodeState = (redirectUrl: string) => {
  return btoa(
    JSON.stringify({
      redirectUrl,
    })
  );
};

export const decodeState = (state: string) => {
  return JSON.parse(atob(state));
};

export const installationUrl = (state: string) =>
  `https://github.com/apps/${import.meta.env.VITE_GITHUB_APP_NAME}/installations/new?${new URLSearchParams({ state }).toString()}`;

export const installationSettingsUrl = (installationId: number) =>
  `https://github.com/settings/installations/${installationId}`;
