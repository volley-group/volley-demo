import type { IService, RSSFeed, StatusMessage } from '../types';
import { ProductFeed } from '../product';
import Parser from 'rss-parser';

export class Temporal extends ProductFeed<StatusMessage> {
  name = 'temporal';
  displayName = 'Temporal';
  logo = 'https://marketplace-assets.digitalocean.com/logos/temporal.png';

  feedUrl = 'https://status.temporal.io/history.rss';

  async getServices(): Promise<IService[]> {
    return [
      {
        name: 'aws',
        displayName: 'Amazon Web Services',
      },
      {
        name: 'gcp',
        displayName: 'Google Cloud Provider',
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
