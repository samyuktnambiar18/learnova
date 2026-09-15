/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  async redirects() {
    return [
      {
        source: '/pages/chat.html',
        destination: '/chat',
        permanent: true,
      },
      {
        source: '/pages/student-dashboard.html',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/pages/student-login.html',
        destination: '/student-login',
        permanent: true,
      },
      {
        source: '/pages/onboarding.html',
        destination: '/onboarding',
        permanent: true,
      },
      {
        source: '/pages/practice.html',
        destination: '/practice',
        permanent: true,
      },
      {
        source: '/pages/progress.html',
        destination: '/progress',
        permanent: true,
      },
      {
        source: '/pages/test.html',
        destination: '/test',
        permanent: true,
      },
      {
        source: '/pages/settings.html',
        destination: '/settings',
        permanent: true,
      },
      {
        source: '/pages/teacher-login.html',
        destination: '/teacher-login',
        permanent: true,
      },
      {
        source: '/pages/teacher-dashboard.html',
        destination: '/teacher-dashboard',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
