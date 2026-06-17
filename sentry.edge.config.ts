// Sentry edge configuration
if (process.env.SENTRY_DSN) {
  import('@sentry/nextjs').then(({ init }) => {
    init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 1.0 });
  }).catch(() => {});
}
