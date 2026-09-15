import '../../css/global.css';
import '../../css/dashboard.css';
import '../../css/chat.css';
import '../../css/intro-carousel.css';
import '../../css/landing.css';
import '../../css/onboarding.css';
import '../../css/profile-setup-redesign.css';
import '../../css/responsive.css';

export const metadata = {
  title: 'LEARNIVO — Subject AI Tutor & Adaptive Learning',
  description: 'AI-powered adaptive learning platform for students powered by Supabase & SNS Agent Workbench.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
