# Mesa

## Setup

1. Install AWS CLI
   `brew install awscli`

2. Configure AWS CLI

```bash
echo <<EOF
[sso-session mesa]
sso_start_url = https://mesadev.awsapps.com/start
sso_region = us-east-1

[profile mesa-development]
sso_session = mesa
sso_account_id = 515966537449
sso_role_name = AdministratorAccess
region = us-east-1
EOF  >> ~/.aws/config
```

3. I will add you as a user to the AWS account, you must accept the email invite.
4. Create a Cloudflare account and tell me the email. I will invite you to the Cloudflare Org
5. Install dependencies from root of project
   `pnpm install`
6. create a `.env` file at root of project. We will fill in these secrets.

```
CLOUDFLARE_DEFAULT_ACCOUNT_ID=1c6b4aacc9d98840e3eb4e9ba73e4a66
CLOUDFLARE_API_TOKEN=
GITHUB_APP_ID=
GITHUB_APP_NAME=
```

7. In Cloudflare go to My Profile > API Tokens and create a new token with Zone.DNS permissions for all zones. Add that token to the `.env`
8. Create a custom GitHub app for your local development. Go to GitHub > Profile > Settings > Developer Settings > New GitHub App

   - Name it `Mesa Dev - [Your Name]`
   - Homepage url should be `https://withmesa.com`
   - Callback urls should be `https://moving-lab-23.clerk.accounts.dev/v1/oauth_callback`. Keep the two checkboxes UNCHECKED for requesting oauth and enabling device flow

   * Set post installation url to `http://localhost:5173/installation/callback` and check Redirect on Update
   * Mark webhooks as Active. The url should be in the form of `https://[profile].app.mesa.dev/api/github/webhook` the Profile part of the URL will be unique for every employee. This will be the name of your account profile in your operating system. This is also the name of your user directory on macos. For example my webhook url is `https://olivergilan.app.mesa.dev/api/github/webhook`
   * Create a webhook secret using by running `uuidgen` in your terminal and pasting it into the Secret field. Write this down separately, you will need it later.

   - Disable ssl verification

   * Under Permissions & Events select

     **Repository Permissions**

     - Commit statuses: Read Only
     - Contents: Read and Write
     - Metadata: Read Only
     - Pull Requests: Read and Write

     **Organization Permissions**

     - Members: Read Only

     **Account Permissions**

     - Email Addresses: Read Only

     **Events**

     - Installation Target
     - Pull Request
     - Pull request review
     - Pull request review comment
     - Pull request review thread

   * For where this can be installed, select only this account
   * Create the app

9. Once the app is created you will see the App ID and the app slug in the url which should be `mesa-dev-[yourname]`. Copy these into the .env file. You should have all your .env secrets now but we need more secrets which we will set with sst. If you look at `infra/config.ts` you will see the remaining secrets. In order to set these secrets you need to do the following.
10. In the GitHub app you just created generate a new client secret and write it down.
11. Scroll down to the Private Key section and generate a new private key. This will download a .pem file to your machine.
12. Authenticate with AWS `pnpm run sso`. **You will need to reauthenticate every 24 hours.**
13. You can view docs for setting sst secrets [here](https://sst.dev/docs/component/secret/)

- `pnpm sst secret set GithubAppClientID [Your App ClientID]` which you can find in the app you just created.
- `pnpm sst secret set ClerkSecretKey [secret key]` I will give this to you.
- `pnpm sst secret set GithubWebhookSecret [webhook secret]` This is the UUID you generated before.
- `pnpm sst secret set GithubAppSecret [client secret]` This is the new client secret you just created above
- `pnpm sst secret set GithubAppPK -- "$(cat [path to your .pem file])"`. This one is different because the private key is multiline so we need to load it in from the file. If you want to put the file in your root directory to make this easy make sure you delete it right after. You can always generate a new private key if u need.

You can validate your secrets are set by running `pnpm sst secret list`

11. Run project locally `pnpm run dev`

## Style Guide

- Be consistent
- Do not prematurely optimize
- kebab-case file names
- PascalCase component names
- camelCase hooks and utility functions
- Abbreviations like "PR" instead of Pull Request is generally bad. Stick to "Pull" to refer to pull requests (i.e. PullDescription instead of PRDescription)

## Stack

We use [SST](https://sst.dev/docs/) to orchestrate our infrastructure.
We have a single lambda function for our API that uses [Hono](https://hono.dev/) as our router and on the client we use Hono RPC client to call the backend.
We are currently using [Clerk](https://clerk.com/) for auth.
Our frontend is a Vite + React SPA with [Tanstack Router](https://tanstack.com/router/latest) for routing and [Tanstack Query (React Query)](https://tanstack.com/query/latest) for data fetching/caching. We use [shadcn](https://ui.shadcn.com/docs) for styling which includes Tailwind.

## TODO

**Pre Alpha**

- [x] Optimize data loading
- [ ] Assign reviewers
- [ ] Commenting
- [x] Keyboard navigation for everything
  - [x] Editing title and body
  - [x] Jumping from diff to diff
- [ ] Submit Review

**Private Alpha**

- [ ] Code folding
- [ ] Organizable files
- [ ] AI File organization
- [ ] Generated PR descriptions
- [ ] Labels & Assignees (Owners)
- [ ] Keyboard navigation for everything
  - [ ] Jumping from hunk to hunk
  - [ ] Leaving comment
  - [ ] Leaving review
  - [ ] Merging

**Private Beta**

- [ ] Formatting changes highlighting
- [ ] Reviewers for specific files
- [ ] ReviewBar
- [ ] Lintrule

**Public Beta**

- [ ] Commit rewriting
- [ ] PR Stacking
