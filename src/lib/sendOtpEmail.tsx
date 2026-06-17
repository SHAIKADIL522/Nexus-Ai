// src/lib/sendOtpEmail.tsx
import { Resend } from 'resend';
import OtpEmail from '@/emails/OtpEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email: string, otp: string) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: email,
    subject: 'Your Nexus AI verification code',
    react: <OtpEmail otp={otp} />,
  });
}