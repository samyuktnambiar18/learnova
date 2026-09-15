'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { getStoredStudent } from '@/lib/profile';

export default function DashboardPage() {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    setStudent(getStoredStudent());
  }, []);

  if (!student) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main" style={{ paddingBottom: '2rem' }}>
        <Topbar 
          title={`Welcome Back, ${student.name.split(' ')[0]}! 👋`} 
          subtitle="Here is your learning summary and AI subject tutor progress." 
        />

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">⚡</span>
            <div className="stat-info">
              <h3>{student.xp || 1240} XP</h3>
              <p>Total Learning Points</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🔥</span>
            <div className="stat-info">
              <h3>{student.streak || 12} Days</h3>
              <p>Active Learning Streak</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🎯</span>
            <div className="stat-info">
              <h3>{student.accuracy || '78%'}</h3>
              <p>Average Accuracy</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">📚</span>
            <div className="stat-info">
              <h3>{student.courses ? student.courses.length : 3} Enrolled</h3>
              <p>Active Subjects</p>
            </div>
          </div>
        </div>

        {/* Subjects & Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="card" style={{ background: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2DDF5' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: '#1A1638' }}>My Enrolled Courses</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(student.courses || []).map(course => (
                <div key={course.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#FAF9FF', borderRadius: '12px', border: '1px solid #E2DDF5' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#1A1638' }}>{course.name} ({course.code})</h4>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>{(course.units || []).length} Units Mastery</span>
                  </div>
                  <Link href="/chat" className="btn btn-primary btn-sm">
                    Ask Subject AI 💬
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2DDF5' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: '#1A1638' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/chat" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                💬 Open Subject AI Tutor
              </Link>
              <Link href="/practice" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                🧩 Solve Practice Quiz
              </Link>
              <Link href="/test" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                📝 Take Diagnostic Test
              </Link>
              <Link href="/progress" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                📈 View Detailed Progress
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
