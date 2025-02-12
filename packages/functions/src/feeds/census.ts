import type { IService, RSSFeed, StatusMessage } from '../types';
import { ProductFeed } from '../product';
import Parser from 'rss-parser';

export class Census extends ProductFeed<StatusMessage> {
  name = 'census';
  displayName = 'Census';
  logo = 'https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/llmjpn8a0pgu8szjmnyi';

  feedUrl = 'https://status.getcensus.com/history.rss';

  async getServices(): Promise<IService[]> {
    return [
      {
        name: 'sync-management-ui',
        displayName: 'Sync Management UI',
      },
      {
        name: 'sync-engine',
        displayName: 'Sync Engine',
      },
      {
        name: 'public-website',
        displayName: 'Public Website',
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
