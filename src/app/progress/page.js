'use client';

import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function ProgressPage() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main" style={{ paddingBottom: '2rem' }}>
        <Topbar title="Student Analytics & Progress" subtitle="Review your performance metrics, XP breakdown, and topic mastery." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ background: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2DDF5' }}>
            <h3>📈 Mathematics Mastery</h3>
            <div style={{ margin: '1rem 0', height: '10px', background: '#E2DDF5', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: '85%', height: '100%', background: '#6D3FEA' }}></div>
            </div>
            <span style={{ fontSize: '0.9rem', color: '#6D3FEA', fontWeight: 700 }}>85% Concept Proficiency</span>
          </div>

          <div className="card" style={{ background: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2DDF5' }}>
            <h3>⚛️ Physics Mastery</h3>
            <div style={{ margin: '1rem 0', height: '10px', background: '#E2DDF5', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: '72%', height: '100%', background: '#8E5DFF' }}></div>
            </div>
            <span style={{ fontSize: '0.9rem', color: '#6D3FEA', fontWeight: 700 }}>72% Concept Proficiency</span>
          </div>
        </div>
      </main>
    </div>
  );
}
