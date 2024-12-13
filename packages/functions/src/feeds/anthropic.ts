import type { ClassifiedMessage, IService, RSSFeed, StatusMessage } from '../types';
import { ProductFeed } from '../product';
import Parser from 'rss-parser';

export class Anthropic extends ProductFeed<StatusMessage> {
  name = 'anthropic';
  displayName = 'Anthropic';
  logo = 'https://dka575ofm4ao0.cloudfront.net/pages-transactional_logos/retina/362807/anthropic-logo.png';

  feedUrl = 'https://status.anthropic.com/history.rss';

  async getServices(): Promise<IService[]> {
    return [
      { displayName: 'claude.ai', name: 'claude_ai' },
      { displayName: 'console.anthropic.com', name: 'console_anthropic_com' },
      { displayName: 'api.anthropic.com', name: 'api_anthropic_com' },
      { displayName: 'api.anthropic.com - Beta Features', name: 'api_anthropic_com_beta_features' },
      { displayName: 'anthropic.com', name: 'anthropic_com' },
      { displayName: 'Claude on Vertex AI', name: 'claude_on_vertex_ai' },
      { displayName: 'Claude on AWS Bedrock', name: 'claude_on_aws_bedrock' },
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
