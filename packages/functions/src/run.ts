import { getTableColumns, eq } from 'drizzle-orm';
import { db } from './drizzle';
import type { ClassifiedMessage } from './types';
import { ConfigTable, SlackInstallationTable } from './drizzle/schema.sql';
import feeds from './feeds';
import { slack } from './slack';

export async function handler() {
  console.log(`[${new Date().toISOString()}] Running Status Check`);

  // Fetch new messages from all services
  // Classify messages
  // Store messages in database
  const newMessages = await feeds.reduce(
    async (acc, product) => {
      const messages = await product.refreshStatusMessages();
      const accResolved = await acc;
      return messages.length > 0
        ? {
            ...accResolved,
            [product.name]: messages,
          }
        : accResolved;
    },
    Promise.resolve({} as Record<string, ClassifiedMessage[]>)
  );

  // Notify relevant slack apps
  Object.entries(newMessages).forEach(async ([product, messages]) => {
    // const affectedServices = messages.map((message) => message.affectedServices).flat();
    console.log(`[${new Date().toISOString()}] Notifying users for ${product} of ${messages.length} new messages`);
    const installations = await db
      .select({
        ...getTableColumns(SlackInstallationTable),
        product: ConfigTable.product,
        services: ConfigTable.services,
      })
      .from(ConfigTable)
      .innerJoin(SlackInstallationTable, eq(ConfigTable.installationId, SlackInstallationTable.id))
      .where(eq(ConfigTable.product, product));

    messages.forEach((message) => {
      const toNotify = installations.filter((installation) =>
        installation.services.some((service) => message.affectedServices.includes(service))
      );
      toNotify.forEach(async (installation) => {
        const response = await slack.chat.postMessage({
          token: installation.botToken,
          channel: installation.incomingWebhook.channelId,
          text: message.content,
        });
        if (!response.ok) {
          console.error(
            `[${new Date().toISOString()}] Failed to notify ${product} for ${message.affectedServices.join(', ')}: ${response.error}`
          );
        }
      });
    });
  });
}
