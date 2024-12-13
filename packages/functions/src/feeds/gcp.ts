import type { ClassifiedMessage, IService, StatusMessage } from '../types';
import { ProductFeed } from '../product';

interface GCPStatusMessage extends StatusMessage {
  affected_products: { title: string; id: string }[];
}

interface GCPIncident {
  id: string;
  created: string;
  external_desc: string;
  affected_products: {
    title: string;
    id: string;
  }[];
  updates: {
    created: string;
    text: string;
  }[];
}
export class GCP extends ProductFeed<GCPStatusMessage> {
  name = 'gcp';
  displayName = 'GCP';
  logo =
    'https://lh3.googleusercontent.com/VEnnK2SyklusfxZ3dIYjlQH3xSwK2BFSJ69TFQ9g8HjM6m3CouRlTia5FW3z3GS0x83WC9TylZCaA9Jf_2kmr7mXxI9_HYLZTFy_bg';

  feedUrl = 'https://status.cloud.google.com/en/feed.atom';

  async getServices(): Promise<IService[]> {
    const response = await fetch('https://status.cloud.google.com/products.json');
    const { products } = (await response.json()) as { products: { title: string; id: string }[] };
    return products.map((service) => ({
      name: service.id,
      displayName: service.title,
      classifyMessage: this.classifyMessage,
    }));
  }

  async getFeed(): Promise<GCPStatusMessage[]> {
    const response = await fetch('https://status.cloud.google.com/incidents.json');
    const incidents = (await response.json()) as GCPIncident[];
    const messages = incidents.flatMap((incident) =>
      incident.updates.map((update) => ({
        guid: `${incident.id}-${update.created}`,
        title: incident.external_desc,
        content: update.text,
        pubDate: update.created,
        affected_products: incident.affected_products,
      }))
    );
    return messages.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()).slice(0, 10);
  }

  async classifyMessage(message: GCPStatusMessage): Promise<ClassifiedMessage> {
    const affectedServices = message.affected_products.map((product) => product.id);
    return {
      ...message,
      product: this.name,
      affectedServices,
    };
  }
}
