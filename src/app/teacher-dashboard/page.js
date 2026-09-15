'use client';

import Link from 'next/link';

export default function TeacherDashboardPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1A1638' }}>Educator Class Dashboard</h1>
          <p style={{ color: '#6B7280', margin: '0.25rem 0 0 0' }}>Grade 11 Mathematics & Physics Class Analytics</p>
        </div>
        <Link href="/" className="btn btn-outline btn-sm">Logout</Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2DDF5' }}>
          <h3>👥 28 Students</h3>
          <p style={{ color: '#6B7280' }}>Total Enrolled</p>
        </div>
        <div className="card" style={{ background: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2DDF5' }}>
          <h3>💬 342 AI Chat Queries</h3>
          <p style={{ color: '#6B7280' }}>Saved to Supabase DB</p>
        </div>
        <div className="card" style={{ background: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2DDF5' }}>
          <h3>🎯 81% Class Accuracy</h3>
          <p style={{ color: '#6B7280' }}>Average Mastery Rate</p>
        </div>
      </div>
    </div>
  );
}
