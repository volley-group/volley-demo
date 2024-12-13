import type { IService, RSSFeed, StatusMessage } from '../types';
import { ProductFeed } from '../product';
import Parser from 'rss-parser';

export class Temporal extends ProductFeed<StatusMessage> {
  name = 'temporal';
  displayName = 'Temporal';
  logo =
    'https://dka575ofm4ao0.cloudfront.net/pages-transactional_logos/retina/258979/Temporal_LogoLockup_Horizontal_dark.png';

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
