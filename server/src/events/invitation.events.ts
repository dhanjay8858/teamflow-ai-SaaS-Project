import { EventEmitter } from 'events';
import { InvitationCreatedEventPayload } from '../types/invitation.types.js';

interface InvitationEventsMap {
  'invitation.created': (payload: InvitationCreatedEventPayload) => void;
  'invitation.resent': (payload: InvitationCreatedEventPayload) => void;
}

export declare interface TypedInvitationEventEmitter {
  on<K extends keyof InvitationEventsMap>(event: K, listener: InvitationEventsMap[K]): this;
  emit<K extends keyof InvitationEventsMap>(event: K, ...args: Parameters<InvitationEventsMap[K]>): boolean;
}

class InvitationEventEmitter extends EventEmitter {}

export const invitationEvents = new InvitationEventEmitter() as TypedInvitationEventEmitter;

// Logging stub for future email delivery queue plugin integration
invitationEvents.on('invitation.created', (event) => {
  console.log(`✉️ [Event: invitation.created] Email queued for ${event.email} (Token: ${event.rawToken})`);
});

invitationEvents.on('invitation.resent', (event) => {
  console.log(`✉️ [Event: invitation.resent] New token generated for ${event.email} (Token: ${event.rawToken})`);
});
