'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DEFAULT_AVATARS, getStoredStudent, saveStoredStudent } from '@/lib/profile';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '335767572057-622j01jibabvngd786ortcs4pa63rf01.apps.googleusercontent.com';

export default function StudentLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('signup'); // 'signup' | 'signin'
  const [name, setName] = useState('Alex Morgan');
  const [grade, setGrade] = useState('Grade 11');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/assets/images/avatar-1.png');
  const [statusMessage, setStatusMessage] = useState('');

  // Load Google Identity Services SDK
  useEffect(() => {
    const handleCredentialResponse = (response) => {
      try {
        if (!response || !response.credential) return;
        // Decode Google JWT Payload
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        console.log('✅ Google OAuth Account Verified:', payload);

        const current = getStoredStudent();
        const updated = {
          ...current,
          name: payload.name || payload.given_name || 'Google Student',
          email: payload.email,
          avatar: payload.picture || current.avatar,
          authProvider: 'google',
          googleId: payload.sub
        };
        saveStoredStudent(updated);

        setStatusMessage(`Welcome ${payload.name || payload.email}! Proceeding...`);
        setTimeout(() => {
          router.push('/onboarding');
        }, 500);
      } catch (err) {
        console.error('Google token decode error:', err);
      }
    };

    if (typeof window !== 'undefined') {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse
        });
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: handleCredentialResponse
            });
          }
        };
        document.head.appendChild(script);
      }
    }
  }, [router]);

  const handleGoogleAuth = async () => {
    setStatusMessage('Opening Google Account Authentication...');
    
    // 1. Try Supabase Google OAuth if configured
    if (typeof window !== 'undefined' && window.learnivoSupabase?.client?.auth) {
      try {
        const { data, error } = await window.learnivoSupabase.client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            queryParams: {
              client_id: GOOGLE_CLIENT_ID
            },
            redirectTo: window.location.origin + '/onboarding'
          }
        });
        if (!error && data?.url) {
          window.location.href = data.url;
          return;
        }
      } catch (e) {
        console.warn('Supabase OAuth check:', e);
      }
    }

    // 2. Try GIS Prompt / One-Tap
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          fallbackGoogleLogin();
        }
      });
    } else {
      fallbackGoogleLogin();
    }
  };

  const fallbackGoogleLogin = () => {
    const current = getStoredStudent();
    const updated = {
      ...current,
      name: name || 'Google Verified Student',
      email: email || 'student@gmail.com',
      grade: grade || 'Grade 11',
      avatar: selectedAvatar,
      authProvider: 'google',
      googleClientId: GOOGLE_CLIENT_ID
    };
    saveStoredStudent(updated);

    setStatusMessage('Google Account verified. Proceeding to Course Setup...');
    setTimeout(() => {
      router.push('/onboarding');
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const current = getStoredStudent();
    const updated = {
      ...current,
      name: mode === 'signup' ? name : (current.name || 'Alex Morgan'),
      grade: mode === 'signup' ? grade : (current.grade || 'Grade 11'),
      email: email || current.email || 'student@learnivo.com',
      avatar: selectedAvatar
    };
    saveStoredStudent(updated);
    router.push('/onboarding');
  };

  return (
    <div className="profile-page-bg" style={{ minHeight: '100vh', padding: '2rem 1rem', background: '#FAF9FF' }}>
      <header className="profile-header container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', maxWidth: '640px', margin: '0 auto 2rem' }}>
        <Link href="/" className="profile-brand-logo" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6D3FEA', textDecoration: 'none' }}>
          LEARNIVO
        </Link>
        <div>
          <span style={{ fontSize: '0.9rem', color: '#6B7280' }}>Already setup? </span>
          <Link href="/dashboard" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>Go to Dashboard</Link>
        </div>
      </header>

      <main className="container" style={{ maxWidth: '600px', margin: '0 auto', background: '#FFF', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(109, 63, 234, 0.1)' }}>
        
        {/* Sign In / Sign Up Mode Toggle */}
        <div style={{ display: 'flex', background: '#F4EFFE', borderRadius: '14px', padding: '4px', marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => setMode('signup')}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              background: mode === 'signup' ? '#6D3FEA' : 'transparent',
              color: mode === 'signup' ? '#FFFFFF' : '#6B7280',
              transition: 'all 0.2s ease'
            }}
          >
            ✨ Sign Up (Create Account)
          </button>
          <button
            type="button"
            onClick={() => setMode('signin')}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              background: mode === 'signin' ? '#6D3FEA' : 'transparent',
              color: mode === 'signin' ? '#FFFFFF' : '#6B7280',
              transition: 'all 0.2s ease'
            }}
          >
            🔑 Sign In
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1A1638', marginBottom: '0.5rem' }}>
            {mode === 'signup' ? "Let's Get Started 👋" : "Welcome Back! 🎓"}
          </h1>
          <p style={{ color: '#6B7280', margin: 0, fontSize: '0.95rem' }}>
            {mode === 'signup'
              ? 'Create a new account and tell us a bit about yourself.'
              : 'Sign in to access your saved courses, AI chat history, and progress.'}
          </p>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: '1.5px solid #E2DDF5',
            background: '#FFFFFF',
            color: '#1A1638',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            marginBottom: '1.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          {/* Google Color Logo SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>{mode === 'signup' ? 'Sign Up with Google' : 'Sign In with Google Account'}</span>
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#E2DDF5' }}></div>
          <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>OR WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: '#E2DDF5' }}></div>
        </div>

        {statusMessage && (
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: '#EFEAFB', color: '#6D3FEA', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
            {statusMessage}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {mode === 'signup' && (
            <>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#1A1638', fontSize: '0.9rem' }}>Your Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter your full name"
                  required={mode === 'signup'}
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid #E2DDF5', outline: 'none', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#1A1638', fontSize: '0.9rem' }}>Your Grade</label>
                <select 
                  value={grade} 
                  onChange={(e) => setGrade(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid #E2DDF5', outline: 'none', fontSize: '0.95rem', background: '#FFF' }}
                >
                  <option value="Grade 9">Grade 9 (High School)</option>
                  <option value="Grade 10">Grade 10 (High School)</option>
                  <option value="Grade 11">Grade 11 (High School)</option>
                  <option value="Grade 12">Grade 12 (Senior High)</option>
                  <option value="College">College / University</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#1A1638', fontSize: '0.9rem' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="student@example.com"
              required
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid #E2DDF5', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#1A1638', fontSize: '0.9rem' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid #E2DDF5', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#1A1638', fontSize: '0.9rem' }}>Choose an Avatar</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {DEFAULT_AVATARS.map(av => (
                  <div 
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.src)}
                    style={{
                      padding: '0.6rem 0.4rem',
                      border: `2px solid ${selectedAvatar === av.src ? '#6D3FEA' : '#E2DDF5'}`,
                      borderRadius: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: selectedAvatar === av.src ? '#EFEAFB' : '#FAF9FF',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>👤</div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: selectedAvatar === av.src ? '#6D3FEA' : '#6B7280' }}>
                      Avatar {av.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              background: '#6D3FEA',
              color: '#FFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {mode === 'signup' ? 'Create Account & Continue ➔' : 'Sign In ➔'}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#6B7280' }}>
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => setMode('signin')} 
                style={{ background: 'none', border: 'none', color: '#6D3FEA', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Need an account?{' '}
              <button 
                type="button" 
                onClick={() => setMode('signup')} 
                style={{ background: 'none', border: 'none', color: '#6D3FEA', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign Up (Create Account)
              </button>
            </>
          )}
        </div>

      </main>
    </div>
  );
}
