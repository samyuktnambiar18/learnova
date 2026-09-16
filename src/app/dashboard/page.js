'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { getStoredStudent, saveStoredStudent } from '@/lib/profile';

const PRIMARY_WEBHOOK = "https://api.agents.snsihub.ai/webhook/d519ae83-ca78-4432-906a-728a293e202f";
const TEST_WEBHOOK = "https://api.agents.snsihub.ai/webhook-test/d519ae83-ca78-4432-906a-728a293e202f";
const SECONDARY_WEBHOOK = "https://api.agents.snsihub.ai/webhook/4a662d25-cbee-4e03-8afb-ecb929b27719";

export default function DashboardPage() {
  const [student, setStudent] = useState(null);
  const [coursesData, setCoursesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [fileErrorMsg, setFileErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const s = getStoredStudent();
    setStudent(s);
    if (s && s.syllabusCourses && Array.isArray(s.syllabusCourses) && s.syllabusCourses.length > 0) {
      setCoursesData(s.syllabusCourses);
    }
  }, []);

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const parseBackendResponse = (data) => {
    if (!data) return [];

    // Unwrap SNS Workbench test execution response if nested
    if (data && data.output && Array.isArray(data.output.items) && data.output.items.length > 0) {
      const itemJson = data.output.items[0].json;
      if (itemJson) data = itemJson;
    }

    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch(e) {}
    }
    if (data && typeof data.syllabusText === 'string' && data.syllabusText.trim().startsWith('{')) {
      try { data = JSON.parse(data.syllabusText); } catch(e) {}
    }

    let rawCourses = [];
    if (Array.isArray(data)) {
      if (data.length > 0 && (data[0].videoId || data[0].title) && !data[0].topics && !data[0].course) {
        rawCourses = [{
          course: "Personalized Syllabus Course",
          topics: Array.from(new Set(data.map(v => v.topic).filter(Boolean))),
          videos: data
        }];
      } else {
        rawCourses = data;
      }
    } else if (typeof data === 'object') {
      if (Array.isArray(data.courses)) rawCourses = data.courses;
      else if (Array.isArray(data.data)) rawCourses = data.data;
      else if (Array.isArray(data.results)) rawCourses = data.results;
      else {
        rawCourses = [data];
      }
    }

    return rawCourses.map((c, i) => {
      const name = c.course || c.name || c.title || c.subject || `Personalized Course ${i + 1}`;
      
      let topics = [];
      if (Array.isArray(c.topics)) topics = c.topics;
      else if (Array.isArray(c.units)) {
        c.units.forEach(u => {
          if (typeof u === 'string') topics.push(u);
          else if (u && u.name) topics.push(u.name);
          else if (u && Array.isArray(u.topics)) topics.push(...u.topics);
        });
      } else if (typeof c.topics === 'string') {
        topics = [c.topics];
      }

      let videos = [];
      const rawVids = c.videos || c.recommendations || c.youtube_videos || (Array.isArray(c.output) ? c.output : []);
      if (Array.isArray(rawVids)) {
        videos = rawVids.map(v => {
          const vId = v.videoId || v.video_id || extractYouTubeId(v.url);
          return {
            title: v.title || 'Recommended Video',
            videoId: vId,
            url: v.url || (vId ? `https://www.youtube.com/watch?v=${vId}` : ''),
            thumbnail: v.thumbnail || (vId ? `https://img.youtube.com/vi/${vId}/mqdefault.jpg` : ''),
            topic: v.topic || '',
            reason: v.reason || v.description || ''
          };
        }).filter(v => v.videoId || v.title);
      }

      return {
        course: name,
        topics: topics,
        videos: videos
      };
    });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFileErrorMsg("Please upload a PDF file only.");
      return;
    }

    setFileErrorMsg(null);
    setErrorMsg(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      let responseJson = null;

      // 1. Try primary production endpoint
      try {
        const res = await fetch(PRIMARY_WEBHOOK, { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          if (!data.error || !data.error.includes("workflow inactive")) {
            responseJson = data;
          }
        }
      } catch (e) {
        console.warn("Primary webhook failed, trying test endpoint:", e);
      }

      // 2. Fallback to test mode endpoint (active during canvas editing in SNS workbench)
      if (!responseJson) {
        try {
          const testRes = await fetch(TEST_WEBHOOK, { method: "POST", body: formData });
          if (testRes.ok) {
            responseJson = await testRes.json();
          }
        } catch (e) {
          console.warn("Test webhook failed:", e);
        }
      }

      // 3. Fallback to secondary endpoint if needed
      if (!responseJson) {
        const secRes = await fetch(SECONDARY_WEBHOOK, { method: "POST", body: formData });
        if (secRes.ok) {
          responseJson = await secRes.json();
        } else {
          throw new Error(`Upload status ${secRes.status}`);
        }
      }

      console.log("Course generation response:", responseJson);

      const parsedCourses = parseBackendResponse(responseJson);
      setCoursesData(parsedCourses);

      if (student) {
        const updated = { ...student, syllabusCourses: parsedCourses };
        setStudent(updated);
        saveStoredStudent(updated);
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
      setErrorMsg("Unable to analyze your syllabus. Please try again.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  if (!student) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main" style={{ paddingBottom: '2rem' }}>
        <Topbar 
          title={`Welcome Back, ${student.name.split(' ')[0]}! 👋`} 
          subtitle="Here is your learning summary and AI subject tutor progress." 
        />

        <input 
          type="file" 
          ref={fileInputRef} 
          accept="application/pdf,.pdf" 
          style={{ display: 'none' }} 
          onChange={onFileChange} 
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
              <h3>{coursesData ? coursesData.length : (student.courses ? student.courses.length : 0)}</h3>
              <p>Active Courses</p>
            </div>
          </div>
        </div>

        {/* Main Grid: Courses Section (Left) & Quick Actions (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          
          {/* COURSES SECTION */}
          <div className="card" style={{ background: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2DDF5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#1A1638', fontWeight: 700 }}>Courses</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#6B7280' }}>
                  Upload your syllabus to create personalized courses.
                </p>
              </div>

              {coursesData && coursesData.length > 0 && !loading && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  📄 Upload New Syllabus PDF
                </button>
              )}
            </div>

            {fileErrorMsg && (
              <div style={{ padding: '0.75rem 1rem', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                ⚠️ {fileErrorMsg}
              </div>
            )}

            {/* LOADING STATE */}
            {loading && (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: '#FAF9FF', borderRadius: '12px', border: '1px border-dashed #CBD5E1' }}>
                <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #E2DDF5', borderTopColor: '#6C5CE7', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h4 style={{ marginTop: '1rem', color: '#1A1638', fontSize: '1.1rem' }}>Analyzing your syllabus...</h4>
                <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0 }}>Extracting units, topics, and generating video recommendations.</p>
              </div>
            )}

            {/* ERROR STATE */}
            {!loading && errorMsg && (
              <div style={{ padding: '2rem', textAlign: 'center', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                <p style={{ color: '#DC2626', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                  {errorMsg}
                </p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary btn-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !errorMsg && (!coursesData || coursesData.length === 0) && (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: '#FAF9FF', borderRadius: '12px', border: '2px dashed #E2DDF5' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📄</div>
                <h4 style={{ color: '#1A1638', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Upload your syllabus to create personalized courses.
                </h4>
                <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Supports PDF format only.
                </p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.75rem', fontWeight: 600 }}
                >
                  Upload Syllabus PDF
                </button>
              </div>
            )}

            {/* DISPLAY COURSES CARDS */}
            {!loading && !errorMsg && coursesData && coursesData.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {coursesData.map((courseItem, idx) => (
                  <div key={idx} style={{ background: '#FAF9FF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2DDF5' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#1A1638', fontWeight: 700 }}>
                        {courseItem.course}
                      </h4>
                      <span style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', background: '#EFEBFD', color: '#6C5CE7', borderRadius: '20px', fontWeight: 600 }}>
                        Videos: {courseItem.videos ? courseItem.videos.length : 0}
                      </span>
                    </div>

                    {courseItem.topics && courseItem.topics.length > 0 && (
                      <div style={{ marginBottom: '1.25rem' }}>
                        <h5 style={{ fontSize: '0.9rem', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                          Units / Topics
                        </h5>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#374151', fontSize: '0.95rem', lineHeight: '1.6' }}>
                          {courseItem.topics.map((t, tidx) => (
                            <li key={tidx}>{typeof t === 'string' ? t : (t.name || JSON.stringify(t))}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {courseItem.videos && courseItem.videos.length > 0 && (
                      <div>
                        <h5 style={{ fontSize: '0.9rem', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                          Recommended Learning Videos
                        </h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                          {courseItem.videos.map((vid, vidx) => (
                            <div key={vidx} style={{ background: '#FFF', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2DDF5', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                              {vid.videoId ? (
                                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                                  <iframe 
                                    src={`https://www.youtube.com/embed/${vid.videoId}`} 
                                    title={vid.title} 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen 
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                  />
                                </div>
                              ) : vid.thumbnail ? (
                                <img src={vid.thumbnail} alt={vid.title} style={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover' }} />
                              ) : null}

                              <div style={{ padding: '0.75rem' }}>
                                <h6 style={{ margin: '0 0 0.35rem 0', fontSize: '0.9rem', color: '#1A1638', lineHeight: '1.3' }}>
                                  {vid.title}
                                </h6>
                                {vid.topic && (
                                  <span style={{ fontSize: '0.75rem', color: '#6C5CE7', background: '#F3F0FF', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600, display: 'inline-block', marginBottom: '0.35rem' }}>
                                    {vid.topic}
                                  </span>
                                )}
                                {vid.reason && (
                                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#6B7280', lineHeight: '1.4' }}>
                                    {vid.reason}
                                  </p>
                                )}
                                {vid.url && (
                                  <a href={vid.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.8rem', color: '#6C5CE7', fontWeight: 600, textDecoration: 'none' }}>
                                    Watch on YouTube ↗
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2DDF5', display: 'flex', justifyContent: 'flex-end' }}>
                      <Link href={`/chat?course=${encodeURIComponent(courseItem.course)}`} className="btn btn-primary btn-sm">
                        View Course →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="card" style={{ background: '#FFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2DDF5', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: '#1A1638' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="btn btn-primary" 
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                📄 Upload Syllabus PDF
              </button>
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


