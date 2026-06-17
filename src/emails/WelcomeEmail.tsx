// src/emails/WelcomeEmail.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl?: string;
}

export default function WelcomeEmail({
  userName = 'there',
  dashboardUrl = 'https://nexus-ai-workspace-3ux7.vercel.app/dashboard',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Nexus AI, {userName} — your workspace is ready.</Preview>
      <Body
        style={{
          backgroundColor: '#050816',
          fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
          margin: 0,
          padding: '40px 0',
        }}
      >
        <Container
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            backgroundColor: '#050816',
            color: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <Section
            style={{
              background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
              padding: '40px',
              textAlign: 'center',
            }}
          >
            <Text style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#ffffff' }}>
              Nexus AI
            </Text>
          </Section>

          <Section style={{ padding: '40px' }}>
            <Heading style={{ fontSize: '22px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
              Welcome, {userName} 👋
            </Heading>

            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '24px', marginBottom: '28px' }}>
              Your account is verified and your AI workspace is ready. You now have access to
              AI chat, research tools, career copilot, and autonomous agents.
            </Text>

            <Section style={{ textAlign: 'center', marginBottom: '8px' }}>
              <Button
                href={dashboardUrl}
                style={{
                  background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                  color: '#ffffff',
                  padding: '14px 28px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'inline-block',
                }}
              >
                Go to Dashboard
              </Button>
            </Section>
          </Section>

          <Section
            style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              padding: '20px 40px',
            }}
          >
            <Text style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>
              If you didn&apos;t create this account, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}