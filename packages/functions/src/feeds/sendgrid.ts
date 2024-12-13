import type { IService, RSSFeed, StatusMessage } from '../types';
import { ProductFeed } from '../product';
import Parser from 'rss-parser';

export class SendGrid extends ProductFeed<StatusMessage> {
  name = 'sendgrid';
  displayName = 'SendGrid';
  logo =
    'https://sendgrid.com/content/dam/sendgrid/legacy/themes/sgdotcom/pages/resource/brand/img/SendGrid-Logomark-Color.png';

  feedUrl = 'https://status.sendgrid.com/history.rss';

  async getServices(): Promise<IService[]> {
    return [
      {
        name: 'mail',
        displayName: 'Mail Sending',
      },
      {
        name: 'campaigns',
        displayName: 'Marketing Campaigns',
      },
      {
        name: 'webhooks',
        displayName: 'Webhooks',
      },
      {
        name: 'api',
        displayName: 'API',
      },
      {
        name: 'website',
        displayName: 'Website',
      },
      {
        name: 'stats',
        displayName: 'Statistics',
      },
      {
        name: 'activity',
        displayName: 'Email Activity',
      },
      {
        name: 'partners',
        displayName: 'Partners',
      },
      {
        name: 'billing',
        displayName: 'Billing',
      },
      {
        name: 'legacy-campaigns',
        displayName: 'Legacy Marketing Campaigns',
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
