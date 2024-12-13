import { Anthropic } from './anthropic';
import { Census } from './census';
import { DatadogUS1 } from './datadog-us1';
import { GCP } from './gcp';
import { GitHub } from './github';
import { OpenAI } from './openai';
import { SendGrid } from './sendgrid';
import { Snowflake } from './snowflake';
import { Stripe } from './stripe';
import { Temporal } from './temporal';

export default [
  new GitHub(),
  new GCP(),
  new SendGrid(),
  new DatadogUS1(),
  new Snowflake(),
  new Anthropic(),
  new OpenAI(),
  new Temporal(),
  new Census(),
  new Stripe(),
];
