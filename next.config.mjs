import { fileURLToPath } from 'url';
import { dirname } from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer }) {
    // Get the current directory from the ES module URL
    const currentDir = dirname(fileURLToPath(import.meta.url));
    
    // Handle path alias resolution for Webpack
    config.resolve.alias['@'] = currentDir; // Ensure '@' points to the root of your project
    return config;
  },
};

export default nextConfig;
