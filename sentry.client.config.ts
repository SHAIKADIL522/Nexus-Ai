// Sentry client-side configuration
// Only activates when NEXT_PUBLIC_SENTRY_DSN is set
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  import('@sentry/nextjs').then(({ init, replayIntegration }) => {
    init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      integrations: [replayIntegration({ maskAllText: true, blockAllMedia: true })],
    });
  }).catch(() => {/* Sentry not installed */});
}
