// src/models/Settings.ts
/**
 * Settings document shape, stored in the existing `settings` collection.
 *
 * One document per user, keyed by userId (string form of the user's
 * Mongo _id — matches the `userId` claim in the JWT, see src/lib/auth.ts).
 *
 * Mirrors the local useState shapes already in src/app/settings/page.tsx
 * as closely as possible, so the API route can do a near-direct
 * load -> setState and setState -> save round trip without reshaping data
 * on the frontend.
 *
 * Deliberately NOT included here:
 *  - profile.email -> sourced from the `users` collection (single source
 *    of truth for email; settings should never fork it).
 *  - password fields -> never stored in settings; handled by
 *    /api/account/change-password against the `users` collection directly.
 */
import { ObjectId } from 'mongodb';

export interface ProfileSettings {
  name: string;
  bio: string;
  avatar: string; // URL or empty string
}

export interface VoiceSettings {
  enabled: boolean;
  continuousListening: boolean;
  voiceOutput: boolean;
  language: string; // e.g. 'en-US'
  rate: number; // 0.5–2
  pitch: number; // 0.5–2 (present in UI state, not currently exposed as a slider)
}

export interface ModelSettings {
  primary: string; // NVIDIA NIM model id, e.g. 'meta/llama-3.1-70b-instruct'
  fallback: string; // currently always 'openrouter' per existing UI default
  temperature: number; // 0–1
  maxTokens: number; // 256–4096
  streamResponses: boolean;
}

export interface NotificationSettings {
  researchComplete: boolean;
  agentUpdates: boolean;
  documentProcessed: boolean;
  weeklyDigest: boolean;
  emailNotifs: boolean;
  browserNotifs: boolean;
}

export interface ThemeSettings {
  mode: 'dark' | 'light' | 'system';
  accentColor: string; // 'violet' | 'blue' | 'emerald' | 'pink' | 'amber'
  reducedMotion: boolean;
  compactMode: boolean;
}

export interface SettingsDocument {
  _id?: ObjectId;
  userId: string;
  profile: ProfileSettings;
  voice: VoiceSettings;
  model: ModelSettings;
  notifications: NotificationSettings;
  theme: ThemeSettings;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Defaults applied when a user has no settings document yet (first load
 * after this feature ships, or brand-new signup). Matches the hardcoded
 * initial useState values already in page.tsx, MINUS the placeholder
 * 'Alex Johnson' / 'alex@example.com' sample data — those were dummy
 * values, not real defaults, and should not be written to real users.
 */
export function defaultSettings(userId: string, fallbackName = ''): Omit<SettingsDocument, '_id'> {
  const now = new Date();
  return {
    userId,
    profile: { name: fallbackName, bio: '', avatar: '' },
    voice: {
      enabled: true,
      continuousListening: false,
      voiceOutput: true,
      language: 'en-US',
      rate: 1,
      pitch: 1,
    },
    model: {
      primary: 'meta/llama-3.1-70b-instruct',
      fallback: 'openrouter',
      temperature: 0.7,
      maxTokens: 1024,
      streamResponses: true,
    },
    notifications: {
      researchComplete: true,
      agentUpdates: true,
      documentProcessed: true,
      weeklyDigest: false,
      emailNotifs: true,
      browserNotifs: true,
    },
    theme: {
      mode: 'dark',
      accentColor: 'violet',
      reducedMotion: false,
      compactMode: false,
    },
    createdAt: now,
    updatedAt: now,
  };
}