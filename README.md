# Braid

Unify and filter Slack alerts for external vendors. Many products provide an RSS feed or slack bot for their entire platform but often fail to provide separate feeds or any filtering mechanism for just specific services in their platform. This can leave you with an #ops channel that is flooded with alerts for obscure GitHub or GCP services that you do not use nor care about. [Braid](https://usebraid.com) allows you to subscribe to products status page feeds and filter the messages for specific services.

This project is self-hostable but you can also use the [hosted version](https://app.usebraid.com/sign-up) for free.

## Stack

- We use [SST](https://sst.dev/docs/) to orchestrate our infrastructure and manage most of our environment variables.
- We use Slack for our Slack Bot, obviously. For self hosting, create your own [here](https://api.slack.com/quickstart)
- You will need your own AWS and Cloudflare accounts for SST to deploy to (You can deploy this entire thing to just cloudflare or just AWS if you desire but you'll need to make some modifications). Right now Cloudflare is just for managing the domain but in theory you could use Route53 or just not use a custom domain at all
- We have a single lambda function for our API that uses [Hono](https://hono.dev/) as our router and on the client we use Hono RPC client and Tanstack/React-Query to call the backend.
- We are currently using [Clerk](https://clerk.com/) for auth but you can use whatever you want.
- Our frontend is a Vite + React SPA with [Tanstack Router](https://tanstack.com/router/latest) for routing and [Tanstack Query (React Query)](https://tanstack.com/query/latest) for data fetching/caching. We use [shadcn](https://ui.shadcn.com/docs) for styling which includes Tailwind.
- Docker is used to run Postgres locally

## Setup

You must use your own cloudflare and aws accounts to run this yourself

1. Install AWS CLI
   `brew install awscli`

2. Configure AWS CLI with [SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)
3. Install dependencies from root of project
   `pnpm install`
4. create a `.env` file at root of project

```
CLOUDFLARE_DEFAULT_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

7. In Cloudflare go to My Profile > API Tokens and create a new token with Zone.DNS permissions for all zones. Add that token to the `.env`
8. Authenticate with AWS `pnpm run sso`. **You will need to reauthenticate every 24 hours.**
9. You can view docs for setting sst secrets [here](https://sst.dev/docs/component/secret/)

- `pnpm sst secret set ClerkSecretKey [secret key]`
- `pnpm sst secret set SlackClientId [secret key]`
- `pnpm sst secret set SlackClientSecret [secret key]`
- `pnpm sst secret set SlackSigningSecret [secret key]`
- `pnpm sst secret set ClaudeApiKey [secret key]`

You can validate your secrets are set by running `pnpm sst secret list`

11. Run project locally `pnpm run dev`

## Roadmap

- [ ] Represent and filter certain product services by region
- [ ] Handle multiple Slack orgs
