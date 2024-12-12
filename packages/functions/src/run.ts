import { getTableColumns, eq } from 'drizzle-orm';
import { db } from './drizzle';
import type { ClassifiedMessage } from './types';
import { ConfigTable, SlackInstallationTable } from './drizzle/schema.sql';
import feeds from './feeds';
import { slack } from './slack';

function convertToSlackFormat(content: string): string {
  return (
    content
      // Convert HTML tags to Slack markdown
      .replace(/<strong>/g, '*')
      .replace(/<\/strong>/g, '*')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<\/?p>/g, '\n')
      .replace(/<small>/g, '')
      .replace(/<\/small>/g, '')
      // Clean up var data tags
      .replace(/<var[^>]*>/g, '')
      .replace(/<\/var>/g, '')
      // Clean up multiple newlines
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim()
  );
}

function getStatusEmoji(title: string): string {
  const lowercaseTitle = title.toLowerCase();
  if (lowercaseTitle.includes('resolved')) return '✅';
  if (lowercaseTitle.includes('investigating')) return '🔍';
  if (lowercaseTitle.includes('monitoring')) return '👀';
  if (lowercaseTitle.includes('degraded') || lowercaseTitle.includes('slow')) return '⚠️';
  if (lowercaseTitle.includes('outage') || lowercaseTitle.includes('down')) return '🔴';
  if (lowercaseTitle.includes('maintenance')) return '🔧';
  return '🔔';
}

async function formatSlackMessage(message: ClassifiedMessage, productName: string) {
  const formattedContent = convertToSlackFormat(message.content);
  const statusEmoji = getStatusEmoji(message.title);

  // Get the product's display name and services
  const product = feeds.find((f) => f.name === productName);
  const displayName = product ? product.displayName : productName;

  // Get service display names
  const services = product ? await product.getServices() : [];
  const serviceDisplayNames = message.affectedServices.map((serviceName) => {
    const service = services.find((s) => s.name === serviceName);
    return service ? service.displayName : serviceName;
  });

  // Split content into chunks if needed (3000 char limit)
  const chunks = formattedContent.match(/[\s\S]{1,3000}/g) || [];

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${displayName} Status Update ${statusEmoji}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${message.title}*`,
      },
    },
  ];

  // Add divider after title
  blocks.push({ type: 'divider' });

  // Add each chunk as a separate section with proper markdown
  chunks.forEach((chunk) => {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: chunk,
      },
    });
  });

  // Add affected services with visual enhancement
  if (serviceDisplayNames.length > 0) {
    blocks.push(
      { type: 'divider' },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `🎯 *Affected Services:* ${serviceDisplayNames.join(' • ')}`,
          },
        ],
      }
    );
  }

  // Add timestamp footer
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `🕒 _Updated ${new Date(message.pubDate).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}_`,
      },
    ],
  });

  return {
    blocks,
    // Add a fallback text for notifications
    text: `${displayName} Status Update: ${message.title}`,
  };
}

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
  for (const [product, messages] of Object.entries(newMessages)) {
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

    for (const message of messages) {
      const toNotify = installations.filter((installation) =>
        installation.services.some((service) => message.affectedServices.includes(service))
      );

      for (const installation of toNotify) {
        try {
          const formattedMessage = await formatSlackMessage(message, product);
          const response = await slack.chat.postMessage({
            token: installation.botToken,
            channel: installation.incomingWebhook.channelId,
            ...formattedMessage,
          });

          if (!response.ok) {
            console.error(
              `[${new Date().toISOString()}] Failed to notify ${product} for ${message.affectedServices.join(', ')}: ${response.error}`
            );
          }
        } catch (error) {
          console.error(`Error sending Slack message:`, error);
        }
      }
    }
  }
}
