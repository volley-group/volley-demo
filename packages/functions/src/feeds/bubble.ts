import type { IService, RSSFeed, StatusMessage } from '../types';
import { ProductFeed } from '../product';
import Parser from 'rss-parser';

export class Bubble extends ProductFeed<StatusMessage> {
  name = 'bubble';
  displayName = 'Bubble';
  logo = 'https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2Fmeta-q.cdn.bubble.io%2Ff1530294839424x143528842134401200%2FIcon-no-clearspace.png?w=128&h=&auto=compress&dpr=1&fit=max';

  feedUrl = 'https://status.bubble.io/history.rss';

  async getServices(): Promise<IService[]> {
    return [
      {
        name: 'editor',
        displayName: 'Editor',
      },
      {
        name: 'api',
        displayName: 'API',
      },
      {
        name: 'apps',
        displayName: 'Deployed Apps',
      },
      {
        name: 'database',
        displayName: 'Database',
      },
      {
        name: 'plugins',
        displayName: 'Plugins',
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