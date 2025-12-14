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

export default nextConfig;