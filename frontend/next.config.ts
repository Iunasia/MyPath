import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: '/admin.',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/universities.',
        destination: '/universities',
        permanent: true,
      },
      {
        source: '/scholarships.',
        destination: '/scholarships',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
