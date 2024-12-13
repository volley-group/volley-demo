import type { IService, RSSFeed, StatusMessage } from '../types';
import { ProductFeed } from '../product';
import Parser from 'rss-parser';

export class WorkOS extends ProductFeed<StatusMessage> {
  name = 'workos';
  displayName = 'WorkOS';
  logo = 'https://seeklogo.com/images/W/workos-icon-logo-4D02E60A6C-seeklogo.com.png';

  feedUrl = 'https://status.workos.com/history.rss';

  async getServices(): Promise<IService[]> {
    return [
      {
        name: 'sso',
        displayName: 'SSO',
      },
      {
        name: 'sync',
        displayName: 'Directory Sync',
      },
      {
        name: 'audit',
        displayName: 'Audit Logs',
      },
      {
        name: 'authkit',
        displayName: 'AuthKit',
      },
      {
        name: 'fga',
        displayName: 'FGA',
      },
      {
        name: 'dashboard',
        displayName: 'Dashboard',
      },
      {
        name: 'admin',
        displayName: 'Admin Portal',
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
