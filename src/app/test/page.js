'use client';

import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Link from 'next/link';

export default function TestPage() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main" style={{ paddingBottom: '2rem' }}>
        <Topbar title="Diagnostic Assessments" subtitle="Take adaptive tests to identify learning gaps and calibrate your study plan." />
        <div className="card" style={{ background: '#FFF', padding: '2rem', borderRadius: '16px', border: '1px solid #E2DDF5' }}>
          <h3>📝 Available Diagnostic Assessments</h3>
          <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Select an assessment to evaluate your knowledge across units.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1.25rem', background: '#FAF9FF', borderRadius: '12px', border: '1px solid #E2DDF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0 }}>Mathematics Unit 1 Diagnostic</h4>
                <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>15 Questions • 20 Mins</span>
              </div>
              <Link href="/chat" className="btn btn-primary btn-sm">Begin Test ➔</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
