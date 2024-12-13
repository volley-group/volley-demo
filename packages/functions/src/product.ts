import { eq } from 'drizzle-orm';
import type { ClassifiedMessage, IService, StatusMessage, IProductFeed } from './types';
import { desc } from 'drizzle-orm';
import { db } from './drizzle';
import { StatusMessageTable } from './drizzle/schema.sql';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { openai } from './openai';

export abstract class ProductFeed<T extends StatusMessage> implements IProductFeed {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly logo: string;

  abstract getServices(): Promise<IService[]>;
  abstract getFeed(): Promise<T[]>;

  async toJson() {
    const services = await this.getServices();
    return {
      name: this.name,
      displayName: this.displayName,
      logo: this.logo,
      services: services,
    };
  }

  async refreshStatusMessages(): Promise<ClassifiedMessage[]> {
    const latestMessage = await db
      .select()
      .from(StatusMessageTable)
      .where(eq(StatusMessageTable.product, this.name))
      .orderBy(desc(StatusMessageTable.pubDate))
      .limit(1)
      .then((r) => r[0]);

    const services = await this.getServices();
    const feeds = services.map((service) => service.feedUrl).filter((f) => f !== undefined);
    const messages = await this.getFeed();
    if (messages.length === 0) return [];

    const latestMessages = latestMessage
      ? messages.filter((message) => new Date(message.pubDate) > new Date(latestMessage.pubDate))
      : messages;

    const classifiedMessages = await Promise.all(latestMessages.map((message) => this.classifyMessage(message)));
    if (classifiedMessages.length > 0) {
      await db.insert(StatusMessageTable).values(classifiedMessages);
    }

    return classifiedMessages;
  }

  async classifyMessage(message: T): Promise<ClassifiedMessage> {
    const services = await this.getServices();
    const availableServiceNames = services.map((service) => service.name);

    const prompt = `Given this status message title: "${message.title}"
      And this content: "${message.content}"
      And this list of available services: ${availableServiceNames.join(', ')}
      Please return only the names of services that are likely affected by this status message.
      Return the response as a JSON array of strings. If none of the given services are likely affected, return an empty array.`;

    const affectedServicesSchema = z.object({
      affectedServices: z.array(z.enum(['unknown', ...availableServiceNames])),
    });
    console.log('calling openai');
    const chatCompletion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini-2024-07-18',
      messages: [{ role: 'user', content: prompt }],
      response_format: zodResponseFormat(affectedServicesSchema, 'affectedServices'),
    });

    if (
      chatCompletion.choices[0].finish_reason === 'content_filter' ||
      chatCompletion.choices[0].finish_reason === 'length' ||
      chatCompletion.choices[0].message.refusal
    ) {
      console.error(
        'OpenAI API request failed:',
        chatCompletion.choices[0].finish_reason,
        chatCompletion.choices[0].message.content,
        chatCompletion.choices[0].message.refusal
      );
      return {
        ...message,
        product: this.name,
        affectedServices: [],
      };
    }
    const { affectedServices } = chatCompletion.choices[0].message.parsed!;

    return {
      ...message,
      product: this.name,
      affectedServices:
        affectedServices.length === 1 && affectedServices[0] === 'unknown'
          ? []
          : affectedServices.filter((service) => service !== 'unknown'),
    };
  }
}
