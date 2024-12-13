import type { IService, RSSFeed, StatusMessage } from '../types';
import { ProductFeed } from '../product';
import Parser from 'rss-parser';

export class Stripe extends ProductFeed<StatusMessage> {
  name = 'stripe';
  displayName = 'Stripe';
  logo =
    'https://images.stripeassets.com/fzn2n1nzq965/HTTOloNPhisV9P4hlMPNA/cacf1bb88b9fc492dfad34378d844280/Stripe_icon_-_square.svg?q=80&w=1082';

  feedUrl = 'https://www.stripestatus.com/history.rss';

  async getServices(): Promise<IService[]> {
    return [
      {
        name: 'payments',
        displayName: 'Global Payments',
      },
      {
        name: 'automation',
        displayName: 'Revenue & Finance Automation',
      },
      {
        name: 'banking',
        displayName: 'Banking-as-a-Service',
      },
      {
        name: 'core',
        displayName: 'Stripe Core Components',
      },
      {
        name: 'acquirers',
        displayName: 'Acquirers & Payment Methods',
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
