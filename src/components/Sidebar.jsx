'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: '📊 Dashboard', href: '/dashboard' },
    { label: '🧩 Practice', href: '/practice' },
    { label: '📈 Progress', href: '/progress' },
    { label: '💬 Subject Chat', href: '/chat' },
    { label: '📝 Diagnostic Test', href: '/test' },
    { label: '⚙️ Settings', href: '/settings' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link href="/" className="logo-placeholder">LEARNIVO</Link>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link href={item.href} className={isActive ? 'active' : ''}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <Link href="/">🚪 Logout</Link>
      </div>
    </aside>
  );
}
