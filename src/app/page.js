'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

  // 3D Cursor Head Tracking state
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // Auto-play timer (3.5 seconds per slide)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 3500);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const handleMouseMove = (e) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const normX = (e.clientX - width / 2) / (width / 2);
    const normY = (e.clientY - height / 2) / (height / 2);
    const maxDegree = 12;
    setRotateY(normX * maxDegree);
    setRotateX(-normY * maxDegree);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((currentSlide - 1 + totalSlides) % totalSlides);
  };

  const handleExploreClick = () => {
    router.push('/student-login');
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="intro-experience-wrapper" 
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF9FF 0%, #F4EFFE 45%, #EFE8FF 100%)',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 3.5rem', zIndex: 20 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem', fontWeight: 800, color: '#6D3FEA', textDecoration: 'none' }}>
          LEARNIVO
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/student-login" className="btn btn-outline btn-sm" style={{ padding: '0.5rem 1.25rem', borderRadius: '20px', fontWeight: 700, textDecoration: 'none', color: '#6D3FEA', border: '1.5px solid #6D3FEA' }}>
            Log In
          </Link>
          <button 
            type="button" 
            onClick={handleExploreClick}
            className="btn btn-primary btn-sm" 
            style={{ padding: '0.5rem 1.35rem', borderRadius: '20px', fontWeight: 700, background: '#6D3FEA', color: '#FFF', border: 'none', cursor: 'pointer' }}
          >
            Explore LEARNIVO →
          </button>
        </div>
      </header>

      {/* Main Viewport Grid */}
      <div style={{ position: 'relative', flex: 1, maxWidth: '1350px', width: '92%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        
        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          aria-label="Previous Slide"
          style={{
            position: 'absolute',
            left: '-1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#FFF',
            border: '1px solid #E2DDF5',
            boxShadow: '0 8px 24px rgba(109, 63, 234, 0.12)',
            color: '#6D3FEA',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 25
          }}
        >
          ‹
        </button>

        <button 
          onClick={nextSlide}
          aria-label="Next Slide"
          style={{
            position: 'absolute',
            right: '-1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#FFF',
            border: '1px solid #E2DDF5',
            boxShadow: '0 8px 24px rgba(109, 63, 234, 0.12)',
            color: '#6D3FEA',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 25
          }}
        >
          ›
        </button>

        {/* SLIDE TRACK */}
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
          
          {/* SLIDE 1: PERSONALIZED LEARNING */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: '45% 55%',
            gap: '2.5rem',
            alignItems: 'center',
            opacity: currentSlide === 0 ? 1 : 0,
            visibility: currentSlide === 0 ? 'visible' : 'hidden',
            transition: 'all 0.6s ease',
            pointerEvents: currentSlide === 0 ? 'auto' : 'none'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <span style={{ display: 'inline-flex', padding: '0.4rem 1rem', borderRadius: '20px', background: 'rgba(109, 63, 234, 0.08)', color: '#6D3FEA', fontWeight: 700, fontSize: '0.85rem', width: 'fit-content' }}>
                Personalized Learning
              </span>
              <h1 style={{ fontSize: '3.6rem', fontWeight: 800, color: '#1A1638', margin: 0, lineHeight: 1.1 }}>
                Learning built<br /><span style={{ color: '#6D3FEA' }}>around you.</span>
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#6B7280', margin: 0, maxWidth: '460px' }}>
                Your learning experience adapts to your courses, progress and pace.
              </p>
              <button onClick={handleExploreClick} style={{ padding: '0.85rem 2rem', borderRadius: '25px', background: '#6D3FEA', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '1rem', width: 'fit-content', cursor: 'pointer', marginTop: '0.5rem' }}>
                Explore LEARNIVO →
              </button>
            </div>

            <div style={{ perspective: '1000px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '100%',
                maxWidth: '560px',
                background: '#FFF',
                borderRadius: '24px',
                padding: '1.75rem',
                border: '1px solid #E2DDF5',
                boxShadow: '0 20px 50px rgba(109, 63, 234, 0.12)',
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transition: 'transform 0.1s ease-out'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1A1638' }}>Enrolled Syllabus Courses</h4>
                  <span style={{ background: '#EFEBFD', color: '#6D3FEA', padding: '0.3rem 0.75rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.8rem' }}>
                    3 Active Courses
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ background: '#FAF9FF', border: '1px solid #E2DDF5', padding: '0.75rem 1rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#1A1638' }}>Mathematics</h5>
                      <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>5 Units · 24 Topics</span>
                    </div>
                    <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.85rem' }}>85% Progress</span>
                  </div>

                  <div style={{ background: '#FAF9FF', border: '1px solid #E2DDF5', padding: '0.75rem 1rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#1A1638' }}>Physics</h5>
                      <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>4 Units · 18 Topics</span>
                    </div>
                    <span style={{ color: '#6D3FEA', fontWeight: 700, fontSize: '0.85rem' }}>72% Progress</span>
                  </div>

                  <div style={{ background: '#FAF9FF', border: '1px solid #E2DDF5', padding: '0.75rem 1rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#1A1638' }}>Chemistry</h5>
                      <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>3 Units · 15 Topics</span>
                    </div>
                    <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>64% Progress</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 2: AI SUBJECT TUTOR */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: '45% 55%',
            gap: '2.5rem',
            alignItems: 'center',
            opacity: currentSlide === 1 ? 1 : 0,
            visibility: currentSlide === 1 ? 'visible' : 'hidden',
            transition: 'all 0.6s ease',
            pointerEvents: currentSlide === 1 ? 'auto' : 'none'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <span style={{ display: 'inline-flex', padding: '0.4rem 1rem', borderRadius: '20px', background: 'rgba(109, 63, 234, 0.08)', color: '#6D3FEA', fontWeight: 700, fontSize: '0.85rem', width: 'fit-content' }}>
                AI Subject Tutor
              </span>
              <h1 style={{ fontSize: '3.6rem', fontWeight: 800, color: '#1A1638', margin: 0, lineHeight: 1.1 }}>
                Meet your AI<br /><span style={{ color: '#6D3FEA' }}>study companion.</span>
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#6B7280', margin: 0, maxWidth: '460px' }}>
                Ask questions, explore concepts and get step-by-step explanations powered by SNS Agent Workbench.
              </p>
              <button onClick={handleExploreClick} style={{ padding: '0.85rem 2rem', borderRadius: '25px', background: '#6D3FEA', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '1rem', width: 'fit-content', cursor: 'pointer', marginTop: '0.5rem' }}>
                Explore LEARNIVO →
              </button>
            </div>

            <div style={{ perspective: '1000px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '100%',
                maxWidth: '560px',
                background: '#FFF',
                borderRadius: '24px',
                padding: '1.75rem',
                border: '1px solid #E2DDF5',
                boxShadow: '0 20px 50px rgba(109, 63, 234, 0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transition: 'transform 0.1s ease-out'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #F0ECFC', paddingBottom: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#EFEBFD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    ✨
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#1A1638' }}>Subject AI Assistant</h4>
                    <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>Algebra & Physics Tutor</span>
                  </div>
                </div>

                <div style={{ alignSelf: 'flex-end', background: '#6D3FEA', color: '#FFF', padding: '0.75rem 1.1rem', borderRadius: '14px 14px 2px 14px', fontSize: '0.9rem', maxWidth: '85%' }}>
                  Explain quantum entanglement in simple words
                </div>

                <div style={{ background: '#FAF9FF', border: '1px solid #E2DDF5', padding: '1rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.45, color: '#1A1638' }}>
                    Quantum entanglement occurs when two particles become deeply interconnected...
                  </div>

                  <div style={{ background: '#FFFFFF', border: '1px solid #E4D9FD', borderRadius: '10px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6D3FEA', textTransform: 'uppercase' }}>
                      🎥 Recommended Learning Resource
                    </div>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#1A1638' }}>
                      Quantum Entanglement: Explained in REALLY SIMPLE Words
                    </h5>
                    <div style={{ background: '#FF0000', color: '#FFFFFF', fontWeight: 700, padding: '0.4rem 0.85rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', alignSelf: 'flex-start' }}>
                      <span>▶</span> Watch on YouTube
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 3: SMART PRACTICE */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: '45% 55%',
            gap: '2.5rem',
            alignItems: 'center',
            opacity: currentSlide === 2 ? 1 : 0,
            visibility: currentSlide === 2 ? 'visible' : 'hidden',
            transition: 'all 0.6s ease',
            pointerEvents: currentSlide === 2 ? 'auto' : 'none'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <span style={{ display: 'inline-flex', padding: '0.4rem 1rem', borderRadius: '20px', background: 'rgba(109, 63, 234, 0.08)', color: '#6D3FEA', fontWeight: 700, fontSize: '0.85rem', width: 'fit-content' }}>
                Smart Practice
              </span>
              <h1 style={{ fontSize: '3.6rem', fontWeight: 800, color: '#1A1638', margin: 0, lineHeight: 1.1 }}>
                Practice<br /><span style={{ color: '#6D3FEA' }}>what matters.</span>
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#6B7280', margin: 0, maxWidth: '460px' }}>
                Get questions based on your subjects and the topics you're learning.
              </p>
              <button onClick={handleExploreClick} style={{ padding: '0.85rem 2rem', borderRadius: '25px', background: '#6D3FEA', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '1rem', width: 'fit-content', cursor: 'pointer', marginTop: '0.5rem' }}>
                Explore LEARNIVO →
              </button>
            </div>

            <div style={{ perspective: '1000px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '100%',
                maxWidth: '560px',
                background: '#FFF',
                borderRadius: '24px',
                padding: '1.75rem',
                border: '1px solid #E2DDF5',
                boxShadow: '0 20px 50px rgba(109, 63, 234, 0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transition: 'transform 0.1s ease-out'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: '#EFEAFB', color: '#6D3FEA', padding: '0.3rem 0.8rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem' }}>
                    Matrices & Determinants
                  </span>
                  <span style={{ background: '#10B981', color: '#FFF', padding: '0.3rem 0.8rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem' }}>
                    +50 XP
                  </span>
                </div>

                <h4 style={{ margin: '0.25rem 0', fontSize: '1.15rem', color: '#1A1638' }}>
                  Calculate the determinant of matrix A:
                </h4>

                <div style={{ background: '#FAF9FF', border: '1px solid #E2DDF5', padding: '0.85rem 1.15rem', borderRadius: '10px', fontWeight: 700, color: '#6D3FEA', fontSize: '1.2rem', textAlign: 'center' }}>
                  det(A) = (a × d) - (b × c)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: '#EFEBFD', border: '2px solid #6D3FEA', color: '#6D3FEA', padding: '0.75rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
                    ✓ ad - bc (Correct)
                  </div>
                  <div style={{ background: '#FAF9FF', border: '1px solid #E2DDF5', color: '#6B7280', padding: '0.75rem', borderRadius: '10px', fontSize: '0.95rem', textAlign: 'center' }}>
                    ac + bd
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 4: PROGRESS TRACKING */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: '45% 55%',
            gap: '2.5rem',
            alignItems: 'center',
            opacity: currentSlide === 3 ? 1 : 0,
            visibility: currentSlide === 3 ? 'visible' : 'hidden',
            transition: 'all 0.6s ease',
            pointerEvents: currentSlide === 3 ? 'auto' : 'none'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <span style={{ display: 'inline-flex', padding: '0.4rem 1rem', borderRadius: '20px', background: 'rgba(109, 63, 234, 0.08)', color: '#6D3FEA', fontWeight: 700, fontSize: '0.85rem', width: 'fit-content' }}>
                Progress Tracking
              </span>
              <h1 style={{ fontSize: '3.6rem', fontWeight: 800, color: '#1A1638', margin: 0, lineHeight: 1.1 }}>
                See how far<br /><span style={{ color: '#6D3FEA' }}>you've come.</span>
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#6B7280', margin: 0, maxWidth: '460px' }}>
                Track your progress across courses, units and topics.
              </p>
              <button onClick={handleExploreClick} style={{ padding: '0.85rem 2rem', borderRadius: '25px', background: '#6D3FEA', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '1rem', width: 'fit-content', cursor: 'pointer', marginTop: '0.5rem' }}>
                Explore LEARNIVO →
              </button>
            </div>

            <div style={{ perspective: '1000px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '100%',
                maxWidth: '560px',
                background: '#FFF',
                borderRadius: '24px',
                padding: '1.75rem',
                border: '1px solid #E2DDF5',
                boxShadow: '0 20px 50px rgba(109, 63, 234, 0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transition: 'transform 0.1s ease-out'
              }}>
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1A1638' }}>Topic Mastery Breakdown</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      <span>Matrices & Determinants</span>
                      <span style={{ color: '#6D3FEA' }}>85% Mastered</span>
                    </div>
                    <div style={{ height: '8px', background: '#EFEBFD', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: '85%', height: '100%', background: '#6D3FEA' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      <span>Differential Calculus</span>
                      <span style={{ color: '#6D3FEA' }}>72% Mastered</span>
                    </div>
                    <div style={{ height: '8px', background: '#EFEBFD', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: '72%', height: '100%', background: '#6D3FEA' }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ flex: 1, background: '#FAF9FF', border: '1px solid #E2DDF5', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#6D3FEA' }}>12 Days 🔥</div>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Practice Streak</span>
                  </div>
                  <div style={{ flex: 1, background: '#FAF9FF', border: '1px solid #E2DDF5', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#10B981' }}>1,240 ⭐</div>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Total XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 5: COMPLETE LEARNING SPACE */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: '45% 55%',
            gap: '2.5rem',
            alignItems: 'center',
            opacity: currentSlide === 4 ? 1 : 0,
            visibility: currentSlide === 4 ? 'visible' : 'hidden',
            transition: 'all 0.6s ease',
            pointerEvents: currentSlide === 4 ? 'auto' : 'none'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <span style={{ display: 'inline-flex', padding: '0.4rem 1rem', borderRadius: '20px', background: 'rgba(109, 63, 234, 0.08)', color: '#6D3FEA', fontWeight: 700, fontSize: '0.85rem', width: 'fit-content' }}>
                Complete Learning Space
              </span>
              <h1 style={{ fontSize: '3.6rem', fontWeight: 800, color: '#1A1638', margin: 0, lineHeight: 1.1 }}>
                Everything<br /><span style={{ color: '#6D3FEA' }}>in one place.</span>
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#6B7280', margin: 0, maxWidth: '460px' }}>
                Courses, practice, AI tutoring, tests and progress — connected together.
              </p>
              <button onClick={handleExploreClick} style={{ padding: '0.85rem 2rem', borderRadius: '25px', background: '#6D3FEA', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '1rem', width: 'fit-content', cursor: 'pointer', marginTop: '0.5rem' }}>
                Explore LEARNIVO →
              </button>
            </div>

            <div style={{ perspective: '1000px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '100%',
                maxWidth: '560px',
                background: 'linear-gradient(135deg, #6D3FEA 0%, #4C26B7 100%)',
                color: '#FFF',
                borderRadius: '24px',
                padding: '2rem',
                boxShadow: '0 20px 50px rgba(109, 63, 234, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transition: 'transform 0.1s ease-out'
              }}>
                <h3 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 800 }}>LEARNIVO Learning Hub</h3>
                <p style={{ opacity: 0.9, fontSize: '0.95rem', margin: 0 }}>
                  Syllabus Upload • Practice Bank • AI Subject Tutor • Diagnostic Tests
                </p>

                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '1.25rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>Personalized Dashboard</div>
                    <span style={{ fontSize: '0.82rem', opacity: 0.85 }}>All learning modules synchronized</span>
                  </div>
                  <button onClick={handleExploreClick} style={{ background: '#FFF', color: '#6D3FEA', border: 'none', padding: '0.65rem 1.35rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>
                    Explore →
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Control Bar */}
      <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 3.5rem 2rem', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {[0, 1, 2, 3, 4].map(idx => (
            <div
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                position: 'relative',
                height: '12px',
                width: currentSlide === idx ? '38px' : '12px',
                borderRadius: currentSlide === idx ? '12px' : '50%',
                background: currentSlide === idx ? '#6D3FEA' : '#D8CEFB',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem', borderRadius: '20px', background: '#EFEAFB', color: '#6D3FEA', border: 'none', fontWeight: 700, cursor: 'pointer' }}
        >
          <span>Next</span>
          <span>›</span>
        </button>
      </footer>
    </div>
  );
}
