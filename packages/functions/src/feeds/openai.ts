import type { IService, RSSFeed, StatusMessage } from '../types';
import { ProductFeed } from '../product';
import Parser from 'rss-parser';

export class OpenAI extends ProductFeed<StatusMessage> {
  name = 'openai';
  displayName = 'OpenAI';
  logo = 'https://openai.com/favicon.ico';

  feedUrl = 'https://status.openai.com/history.rss';

  async getServices(): Promise<IService[]> {
    return [
      {
        name: 'api',
        displayName: 'API',
      },
      {
        name: 'chat',
        displayName: 'ChatGPT',
      },
      {
        name: 'playground',
        displayName: 'Playground',
      },
      {
        name: 'dalle',
        displayName: 'DALL·E',
      },
      {
        name: 'dashboard',
        displayName: 'Dashboard',
      },
      {
        name: 'assistants',
        displayName: 'Assistants API',
      },
    ];
  }

  async getFeed(): Promise<StatusMessage[]> {
    const parser = new Parser<RSSFeed, StatusMessage>();
    const feed = await parser.parseURL(this.feedUrl);
    return feed.items.map((item) => ({
      guid: item.guid,
      title: item.title,
      content: item.content,
      pubDate: new Date(item.pubDate).toISOString(),
    }));
  }
} 