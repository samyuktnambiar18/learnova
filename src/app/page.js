'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing-layout">
      {/* Header */}
      <header className="header container">
        <div className="logo-placeholder">LEARNIVO</div>
        <nav className="nav-links">
          <Link href="#features">Features</Link>
          <Link href="#subjects">Subjects</Link>
          <Link href="/chat">AI Chat</Link>
        </nav>
        <div className="auth-buttons">
          <Link href="/student-login" className="btn btn-outline">Student Login</Link>
          <Link href="/teacher-login" className="btn btn-primary">Teacher Portal</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem' }}>
          Personalized AI Tutoring for Every Student
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto 2rem' }}>
          Master Mathematics, Physics, and Chemistry with adaptive learning paths, real-time AI guidance powered by SNS Agent Workbench, and Supabase chat persistence.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/student-login" className="btn btn-primary btn-lg">
            Get Started as Student ➔
          </Link>
          <Link href="/chat" className="btn btn-outline btn-lg">
            Try Subject AI Chat 💬
          </Link>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="container" style={{ padding: '3rem 1rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2.5rem' }}>Platform Highlights</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="stat-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--primary-purple)' }}>🧠 SNS Subject AI Tutor</h3>
            <p style={{ color: 'var(--secondary-text)' }}>Ask step-by-step questions on any topic and receive tailored video resources and interactive markdown breakdowns.</p>
          </div>
          <div className="stat-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--primary-purple)' }}>⚡ Supabase Persistence</h3>
            <p style={{ color: 'var(--secondary-text)' }}>Every user turn and AI response is automatically stored in Supabase database tables for instant history restoration.</p>
          </div>
          <div className="stat-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--primary-purple)' }}>📊 Adaptive Practice & Progress</h3>
            <p style={{ color: 'var(--secondary-text)' }}>Track your XP, streak, accuracy, and unit mastery with automated diagnostic assessments.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
