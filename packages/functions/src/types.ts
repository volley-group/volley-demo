import type { StatusMessageTable } from './drizzle/schema.sql';

export type RSSFeed = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export interface IProductFeed {
  name: string;
  displayName: string;
  logo: string;
  getServices: () => Promise<IService[]>;
  getFeed: (latestMessage?: ClassifiedMessage) => Promise<StatusMessage[]>;
  classifyMessage: (message: StatusMessage) => Promise<ClassifiedMessage>;
}

export interface IService {
  name: string;
  displayName: string;
}

export type StatusMessage = Omit<typeof StatusMessageTable.$inferSelect, 'product' | 'affectedServices'>;
export type ClassifiedMessage = typeof StatusMessageTable.$inferSelect;

export type AlertConfiguration = {
  product: string;
  services: string[];
};
