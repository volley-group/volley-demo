import OpenAI from 'openai';
import { Resource } from 'sst';

export const openai = new OpenAI({
  apiKey: Resource.OpenaiApiKey.value,
});
