'use client';

import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Link from 'next/link';

export default function PracticePage() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main" style={{ paddingBottom: '2rem' }}>
        <Topbar title="Adaptive Practice & Quizzes" subtitle="Solve interactive practice problems tailored to your mastery level." />
        <div className="card" style={{ background: '#FFF', padding: '2rem', borderRadius: '16px', border: '1px solid #E2DDF5' }}>
          <h3>🧩 Practice Modules</h3>
          <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Select a topic below or practice with your Subject AI Tutor for real-time hint generation.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#FAF9FF', borderRadius: '12px', border: '1px solid #E2DDF5' }}>
              <h4>📐 Matrices & Determinants</h4>
              <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>10 Questions • 15 Mins</p>
              <Link href="/chat" className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>Start Practice ➔</Link>
            </div>
            <div style={{ padding: '1rem', background: '#FAF9FF', borderRadius: '12px', border: '1px solid #E2DDF5' }}>
              <h4>⚛️ Mechanics & Kinematics</h4>
              <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>8 Questions • 12 Mins</p>
              <Link href="/chat" className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>Start Practice ➔</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
