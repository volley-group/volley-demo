import type { ClassifiedMessage, IService, RSSFeed, StatusMessage } from '../types';
import { ProductFeed } from '../product';
import Parser from 'rss-parser';

interface GCPStatusMessage extends StatusMessage {
  id: string;
  affected_products: { title: string; id: string }[];
  external_desc: string;
  updates: { text: string }[];
  created: string;
}
export class GCP extends ProductFeed<GCPStatusMessage> {
  name = 'gcp';
  displayName = 'GCP';
  logo =
    'https://lh3.googleusercontent.com/VEnnK2SyklusfxZ3dIYjlQH3xSwK2BFSJ69TFQ9g8HjM6m3CouRlTia5FW3z3GS0x83WC9TylZCaA9Jf_2kmr7mXxI9_HYLZTFy_bg';

  feedUrl = 'https://www.githubstatus.com/history.rss';

  async getServices(): Promise<IService[]> {
    const response = await fetch('https://status.cloud.google.com/products.json');
    const { services } = (await response.json()) as { services: { title: string; id: string }[] };
    return services.map((service) => ({
      name: service.id,
      displayName: service.title,
      classifyMessage: this.classifyMessage,
    }));
  }

  async getFeed(): Promise<GCPStatusMessage[]> {
    const parser = new Parser<RSSFeed, GCPStatusMessage>({
      customFields: {
        item: ['id', 'affected_products', 'external_desc', 'updates', 'created'],
      },
    });
    const feed = await parser.parseURL(this.feedUrl);
    return feed.items.map((item) => ({
      id: item.id,
      guid: item.id,
      title: item.title,
      content: item.content,
      pubDate: new Date(item.pubDate).toISOString(),
      affected_products: item.affected_products,
      external_desc: item.external_desc,
      updates: item.updates,
      created: item.created,
    }));
  }

  async classifyMessage(message: GCPStatusMessage): Promise<ClassifiedMessage> {
    return {
      guid: message.id,
      title: message.external_desc,
      content: message.updates.pop()!.text,
      pubDate: message.created,
      product: this.name,
      affectedServices: message.affected_products.map((service) => service.id),
    };
  }
}
