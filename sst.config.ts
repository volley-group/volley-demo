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
      },
    };
  },
  async run() {
    const isPermanentStage = $app.stage === 'production' || $app.stage === 'development';

    const slackClientId = new sst.Secret(`SlackClientId`);
    const slackClientSecret = new sst.Secret(`SlackClientSecret`);
    const slackSigningSecret = new sst.Secret(`SlackSigningSecret`);
    const clerkSecretKey = new sst.Secret(`ClerkSecretKey`);
    const claudeApiKey = new sst.Secret(`ClaudeApiKey`);
    const openaiApiKey = new sst.Secret(`OpenaiApiKey`);
    const config = new sst.Linkable('Config', {
      properties: {
        PERMANENT_STAGE: isPermanentStage,
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_Y29udGVudC1tdWxlLTI4LmNsZXJrLmFjY291bnRzLmRldiQ',
      },
    });

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

    const api = new sst.aws.Function(`API`, {
      handler: './packages/functions/src/api/index.handler',
      link: [database, config, openaiApiKey, clerkSecretKey, slackClientId, slackClientSecret, slackSigningSecret],
      url: {
        cors: {
          allowOrigins: ['*'],
          allowHeaders: ['*'],
          allowMethods: ['*'],
          allowCredentials: true,
        },
      },
      // vpc,
    });

    const webApp = new sst.aws.StaticSite(`Web`, {
      build: {
        command: 'pnpm --filter web run build',
        output: 'dist',
      },
      dev: { command: 'pnpm --filter web run dev' },
      environment: {
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_Y29udGVudC1tdWxlLTI4LmNsZXJrLmFjY291bnRzLmRldiQ',
      },
    });

    // new sst.aws.Cron('StatusRunner', {
    //   job: {
    //     handler: 'packages/functions/src/run.handler',
    //     link: [database, claudeApiKey, openaiApiKey, slackClientId, slackClientSecret, slackSigningSecret],
    //     vpc,
    //   },
    //   schedule: 'rate(1 minute)',
    // });

    if ($app.stage === 'production') {
      const databasePush = new sst.aws.Function(`DatabasePush`, {
        handler: './packages/functions/src/database-push.handler',
        link: [database],
        vpc,
      });

      new aws.lambda.Invocation(`DatabasePushInvocation`, {
        functionName: databasePush.name,
        input: JSON.stringify({
          now: new Date().toISOString(),
        }),
      });
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
    };
  },
});
