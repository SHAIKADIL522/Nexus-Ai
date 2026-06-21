
import { ObjectId } from 'mongodb';

export interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  password?: string; // hashed; absent for Google-only accounts
  avatar?: string;
  googleId?: string;
  provider?: 'email' | 'google';
  verified?: boolean; // OTP-verified; Google accounts are implicitly verified
  tokenVersion?: number; // see note above — treat undefined as 0
  createdAt: Date;
  updatedAt: Date;
}

/** Shape safe to send to the client — never include password or googleId. */
export interface PublicUser {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: 'email' | 'google';
}

export function toPublicUser(doc: UserDocument): PublicUser {
  return {
    userId: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    avatar: doc.avatar,
    provider: doc.provider,
  };
}