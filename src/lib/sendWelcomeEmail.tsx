// src/lib/sendWelcomeEmail.tsx
import { Resend } from 'resend';
import WelcomeEmail from '@/emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, userName: string) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: email,
    subject: 'Welcome to Nexus AI 🎉',
    react: <WelcomeEmail userName={userName} />,
  });
}