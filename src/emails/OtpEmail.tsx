// src/emails/OtpEmail.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface OtpEmailProps {
  otp: string;
}

export default function OtpEmail({ otp = '123456' }: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Nexus AI verification code: {otp}</Preview>
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
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Text
              style={{
                fontSize: '24px',
                fontWeight: 900,
                margin: 0,
                color: '#ffffff',
              }}
            >
              Nexus AI
            </Text>
          </Section>

          <Heading
            style={{
              fontSize: '20px',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#ffffff',
            }}
          >
            Verification Code
          </Heading>

          <Text
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '14px',
              marginBottom: '32px',
            }}
          >
            Enter this code to access your AI workspace. Expires in 10 minutes.
          </Text>

          <Section
            style={{
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            <Text
              style={{
                fontSize: '36px',
                fontWeight: 900,
                letterSpacing: '12px',
                color: '#A78BFA',
                margin: 0,
              }}
            >
              {otp}
            </Text>
          </Section>

          <Text
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '12px',
              textAlign: 'center',
              margin: 0,
            }}
          >
            If you didn&apos;t request this, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}