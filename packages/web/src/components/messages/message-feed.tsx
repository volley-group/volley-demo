import type { ClassifiedMessage } from '@braid/functions/types';
import { MessageCard } from './message-card';

export function MessageFeed({ messages }: { messages: ClassifiedMessage[] }) {
  return (
    <div className="w-full">
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No incidents found</p>
          </div>
        ) : (
          messages.map((message) => <MessageCard key={message.guid} message={message} />)
        )}
      </div>
    </div>
  );
}
