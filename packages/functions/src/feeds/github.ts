import type { ClassifiedMessage, IService, RSSFeed, StatusMessage } from '../types';
import { ProductFeed } from '../product';
import Parser from 'rss-parser';

export class GitHub extends ProductFeed {
  name = 'github';
  displayName = 'GitHub';
  logo = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';

  feedUrl = 'https://www.githubstatus.com/history.rss';

  async getServices(): Promise<IService[]> {
    return [
      {
        name: 'git',
        displayName: 'Git Operations',
      },
      {
        name: 'api',
        displayName: 'API Requests',
      },
      {
        name: 'pr',
        displayName: 'Pull Requests',
      },
      {
        name: 'packages',
        displayName: 'Packages',
      },
      {
        name: 'codespaces',
        displayName: 'Codespaces',
      },
      {
        name: 'webhooks',
        displayName: 'Webhooks',
      },
      {
        name: 'issues',
        displayName: 'Issues',
      },
      {
        name: 'actions',
        displayName: 'Actions',
      },
      {
        name: 'pages',
        displayName: 'Pages',
      },
      {
        name: 'copilot',
        displayName: 'Copilot',
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
      pubDate: new Date(item.pubDate),
    }));
  }
}
