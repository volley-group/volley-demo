import { WebClient } from '@slack/web-api';

export const slack = new WebClient();

export const scopes = [
  'chat:write',
  'chat:write.customize',
  'incoming-webhook',
  'channels:read',
  'channels:join',
  'app_mentions:read',
];
export const userScopes = ['openid', 'profile', 'email'];
