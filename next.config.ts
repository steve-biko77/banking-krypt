import { withSentryConfig } from "@sentry/nextjs";
// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Option recommandée pour éviter les conflits dans les versions expérimentales
  // Forcer l'utilisation de webpack pour cette configuration critique
  // La configuration Webpack est parfois ignorée par Turbopack, mais nous tentons à nouveau.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclure 'fs' du bundle client.
      config.resolve.fallback = {
        ...config.resolve.fallback, 
        fs: false, 
      };
    }

    return config;
  },
  
  // NOTE: Nous conservons les scripts "dev": "next dev --turbopack" dans package.json,
  // car les retirer pourrait engendrer d'autres erreurs liées aux dépendances.
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "estiam-wg",

  project: "banking-app",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  }
});
