'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TeacherLoginPage() {
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    router.push('/teacher-dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF9FF' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#FFF', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(109, 63, 234, 0.1)' }}>
        <h2 style={{ color: '#6D3FEA', margin: '0 0 0.5rem 0' }}>Teacher Portal Login</h2>
        <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Access class analytics and AI subject tutor progress.</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Email</label>
            <input type="email" placeholder="teacher@learnivo.com" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2DDF5' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Password</label>
            <input type="password" placeholder="••••••••" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2DDF5' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Log In to Educator Portal ➔</button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <Link href="/" style={{ color: '#6D3FEA' }}>← Back to Main Page</Link>
        </div>
      </div>
    </div>
  );
}
