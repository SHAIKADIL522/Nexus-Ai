import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Nexus AI — Your Personal AI Operating System',
  description: 'Production-ready AI OS: Chat, Research, Knowledge Vault, Voice AI, Career Copilot, Agents — powered by NVIDIA NIM.',
  openGraph: {
    title: 'Nexus AI — Personal AI Operating System',
    description: 'Full-stack AI OS powered by NVIDIA NIM.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap"
         rel="stylesheet"
          />
      </head>
       <body
          className="text-white antialiased"
          style={{
          background: "#020202",
         fontFamily: "'Inter', sans-serif"
        }}
>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(20,20,35,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(124,58,237,0.25)',
              color: '#C4B5FD',
              fontSize: '13px',
              borderRadius: '14px',
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}