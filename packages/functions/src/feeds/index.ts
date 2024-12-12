import { ProductFeed } from '../product';
import { readdirSync } from 'node:fs';
import path from 'node:path';
export const getFeeds = async (): Promise<ProductFeed[]> => {
  const products: ProductFeed[] = [];
  for (const value of readdirSync(path.join(__dirname))) {
    console.log(value);
    if (value === 'index.ts') continue;

    const result = await import(path.join(__dirname, value));
    products.push(new (Object.values(result)[0] as any)() as ProductFeed);
  }
  return products;
};
