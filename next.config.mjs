/** @type {import('next').NextConfig} */
export default {
  // Checks build separately so they can't corrupt a running or later dev server.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: { serverComponentsExternalPackages: ['better-sqlite3', 'pdf-parse'] },
};
