import type { IService, RSSFeed, StatusMessage } from '../types';
import { ProductFeed } from '../product';
import Parser from 'rss-parser';

export class Snowflake extends ProductFeed<StatusMessage> {
  name = 'snowflake';
  displayName = 'Snowflake';
  logo = 'https://companieslogo.com/img/orig/SNOW-35164165.png?t=1720244494';

  feedUrl = 'https://status.snowflake.com/history.rss';

  async getServices(): Promise<IService[]> {
    return [
      {
        name: 'database',
        displayName: 'Snowflake Data Warehouse',
      },
      {
        name: 'snowpipe',
        displayName: 'Snowpipe',
      },
      {
        name: 'replication',
        displayName: 'Replication',
      },
      {
        name: 'snowsight',
        displayName: 'Snowsight',
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
