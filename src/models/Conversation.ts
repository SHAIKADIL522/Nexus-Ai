
import { ObjectId } from 'mongodb';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: Date;
}

export interface ConversationDocument {
  _id?: ObjectId;
  userId: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/** Shape sent to the client — _id normalized to a string `id` field. */
export interface PublicConversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export function toPublicConversation(doc: ConversationDocument): PublicConversation {
  return {
    id: doc._id?.toString() ?? '',
    title: doc.title,
    messages: doc.messages,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}