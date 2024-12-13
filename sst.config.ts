/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: 'braid',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      providers: {
        aws: {
          region: 'us-east-1',
          profile: process.env['GITHUB_ACTIONS']
            ? undefined
            : input?.stage === 'production'
              ? 'mesa-production'
              : 'mesa-development',
        },
        cloudflare: true,
      },
    };
  },
  async run() {
    const isPermanentStage = $app.stage === 'production' || $app.stage === 'development';

    const slackClientId = new sst.Secret(`SlackClientId`);
    const slackClientSecret = new sst.Secret(`SlackClientSecret`);
    const clerkSecretKey = new sst.Secret(`ClerkSecretKey`);
    const clerkPublicKey = new sst.Secret(`ClerkPublicKey`);
    const openaiApiKey = new sst.Secret(`OpenaiApiKey`);

    const vpc = isPermanentStage
      ? new sst.aws.Vpc(`VPC`, { bastion: true, nat: 'ec2' })
      : sst.aws.Vpc.get(`VPC`, 'vpc-0d9ca494252bc8b37');

    const database =
      isPermanentStage || $dev
        ? new sst.aws.Postgres(`Database`, {
            vpc,
            proxy: true,
            dev: {
              database: 'braid',
              host: 'localhost',
              port: 54326,
              username: 'postgres',
              password: 'postgres',
            },
          })
        : sst.aws.Postgres.get(`Database`, {
            id: `DevDatabaseInstance`,
            proxyId: `DevDatabaseProxy`,
          });

    const domain =
      {
        production: 'app.usebraid.com',
        dev: `dev.app.usebraid.com`,
      }[$app.stage] || $app.stage + '.app.usebraid.com';

    // export const zone = cloudflare.getZoneOutput({
    //   name: 'mesa.dev',
    // });

    const appDomain = {
      name: domain,
      redirects: [`www.${domain}`],
      dns: sst.cloudflare.dns(),
    };

    const config = new sst.Linkable('Config', {
      properties: {
        PERMANENT_STAGE: isPermanentStage,
        VITE_CLERK_PUBLISHABLE_KEY: clerkPublicKey.value,
        DOMAIN: domain,
        LIVE: $dev,
      },
    });

    const api = new sst.aws.Function(`API`, {
      handler: './packages/functions/src/api/index.handler',
      link: [database, config, openaiApiKey, clerkSecretKey, slackClientId, slackClientSecret],
      url: {
        cors: {
          allowOrigins: ['*'],
          allowHeaders: ['*'],
          allowMethods: ['*'],
          allowCredentials: true,
        },
      },
      vpc,
    });

    const webApp = new sst.aws.StaticSite(`Web`, {
      build: {
        command: 'pnpm --filter web run build',
        output: './packages/web/dist',
      },
      dev: { command: 'pnpm --filter web run dev' },
      environment: {
        VITE_CLERK_PUBLISHABLE_KEY: clerkPublicKey.value,
        VITE_STAGE: $app.stage,
      },
    });

    new sst.aws.Cron('StatusRunner', {
      job: {
        handler: 'packages/functions/src/run.handler',
        link: [database, openaiApiKey, slackClientId, slackClientSecret],
        vpc,
      },
      schedule: 'rate(1 minute)',
    });

    const router = new sst.aws.Router('Router', {
      domain: appDomain,
      routes: {
        ...($dev ? {} : { '/*': webApp.url }),
        '/api/*': api.url,
      },
    });

    if ($app.stage === 'production') {
      const databasePush = new sst.aws.Function(`DatabasePush`, {
        handler: './packages/functions/src/database-push.handler',
        link: [database],
        vpc,
      });

      // new aws.lambda.Invocation(`DatabasePushInvocation`, {
      //   functionName: databasePush.name,
      //   input: JSON.stringify({
      //     now: new Date().toISOString(),
      //   }),
      //   triggers: {
      //     version: '1',
      //   },
      // });
    }

    new sst.x.DevCommand('Studio', {
      link: [database],
      dev: {
        command: 'pnpm --filter functions run db:studio',
        autostart: true,
      },
    });

    new sst.x.DevCommand('Compose', {
      dev: {
        command: 'docker compose -f ./packages/functions/compose.yml up',
        autostart: true,
      },
    });

    return {
      web: webApp.url,
      api: api.url,
      router: router.url,
    };
  },
});
