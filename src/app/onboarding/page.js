'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DEFAULT_COURSES, getStoredStudent, saveStoredStudent } from '@/lib/profile';

const WEBHOOK_URL = 'https://api.agents.snsihub.ai/webhook/4a662d25-cbee-4e03-8afb-ecb929b27719';
const TEST_WEBHOOK_URL = 'https://api.agents.snsihub.ai/webhook-test/4a662d25-cbee-4e03-8afb-ecb929b27719';

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState('select-option'); // 'select-option' | 'manual-entry'

  // Manual course selection state
  const [selectedCourses, setSelectedCourses] = useState(DEFAULT_COURSES.map(c => c.name));

  const handleBrowseFilesClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      processPdfUpload(file);
    }
    // Reset file input value so selecting the same file triggers change again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      processPdfUpload(file);
    }
  };

  const processPdfUpload = async (file) => {
    if (!file) return;

    // 1. ACCEPT PDF ONLY
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setUploadStatus('error');
      setStatusMessage('Please upload a PDF file only.');
      console.warn('Rejected non-PDF file upload:', file.name);
      return;
    }

    // 3. UPLOAD STATE
    setSelectedFile(file);
    setFileName(file.name);
    setUploadStatus('uploading');
    setStatusMessage('Uploading syllabus...');
    setIsUploading(true);

    // 2. SEND THE PDF DIRECTLY TO THE WEBHOOK
    try {
      const formData = new FormData();
      formData.append('file', file);

      let response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData
      });

      // If production webhook returns 404 (workbench workflow in test mode), retry test endpoint
      if (!response.ok && response.status === 404) {
        try {
          const testRes = await fetch(TEST_WEBHOOK_URL, {
            method: 'POST',
            body: formData
          });
          if (testRes.ok) {
            response = testRes;
          }
        } catch (testErr) {
          // Ignore test fallback error and handle original failure below
        }
      }

      if (response.ok) {
        let responseData = {};
        try {
          responseData = await response.json();
        } catch (jsonErr) {
          responseData = { status: 'completed' };
        }

        // 4. HANDLE WEBHOOK RESPONSE (Log complete response)
        console.log("Syllabus webhook response:", responseData);

        // 5. SUCCESS
        setUploadStatus('success');
        setStatusMessage('Syllabus uploaded successfully.');

        // Preserve returned webhook data in existing application state
        try {
          const student = getStoredStudent();
          student.syllabusFileName = file.name;
          student.syllabusWebhookData = responseData;
          saveStoredStudent(student);
        } catch (saveErr) {
          console.error("Error storing student state:", saveErr);
        }

      } else {
        const errText = await response.text().catch(() => '');
        const error = new Error(`Server returned HTTP ${response.status}: ${errText}`);
        
        // 6. ERROR HANDLING
        console.error("Syllabus upload error:", error);
        setUploadStatus('error');
        setStatusMessage('Unable to upload syllabus. Please try again.');
      }
    } catch (error) {
      // 6. ERROR HANDLING
      console.error("Syllabus upload error:", error);
      setUploadStatus('error');
      setStatusMessage('Unable to upload syllabus. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCourse = (courseName) => {
    if (selectedCourses.includes(courseName)) {
      setSelectedCourses(selectedCourses.filter(c => c !== courseName));
    } else {
      setSelectedCourses([...selectedCourses, courseName]);
    }
  };

  const handleFinishManual = () => {
    const student = getStoredStudent();
    const enrolled = DEFAULT_COURSES.filter(c => selectedCourses.includes(c.name));
    student.courses = enrolled.length > 0 ? enrolled : DEFAULT_COURSES;
    student.completedOnboarding = true;
    saveStoredStudent(student);
    router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9FF', padding: '2rem 1rem' }}>
      {/* Header */}
      <header className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', maxWidth: '1000px' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6D3FEA', textDecoration: 'none' }}>
          LEARNIVO
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1638' }}>Alex Morgan</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Grade 10</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6D3FEA', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
            AM
          </div>
        </div>
      </header>

      <main className="container" style={{ maxWidth: '960px', margin: '0 auto', background: '#FFF', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(109, 63, 234, 0.08)' }}>
        
        {viewMode === 'select-option' ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1A1638', margin: '0 0 0.5rem 0' }}>
                Let's Set Up Your Learning 🎓
              </h2>
              <p style={{ color: '#6B7280', fontSize: '1rem', margin: 0 }}>
                Upload your syllabus or add your courses so LEARNIVO can personalize your learning experience.
              </p>
            </div>

            {/* Hidden Input for PDF picker */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf,.pdf"
              disabled={isUploading}
              style={{ display: 'none' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
              
              {/* Option Card 1: Upload Your Syllabus */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed #6D3FEA',
                  borderRadius: '16px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  background: '#FAF9FF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justify: 'space-between',
                  gap: '1.25rem'
                }}
              >
                <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: '#EFEAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                  📄
                </div>

                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1A1638', margin: '0 0 0.4rem 0' }}>Upload Your Syllabus</h3>
                  <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0, lineHeight: 1.4 }}>
                    Drag & drop your PDF here<br />or browse your local files
                  </p>
                </div>

                {fileName && (
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#6D3FEA', background: '#EFEAFB', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                    📄 {fileName}
                  </div>
                )}

                {/* Status Message */}
                {statusMessage && (
                  <div style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: uploadStatus === 'success' ? '#10B981' : uploadStatus === 'error' ? '#EF4444' : '#6D3FEA',
                    background: uploadStatus === 'success' ? '#ECFDF5' : uploadStatus === 'error' ? '#FEF2F2' : '#EFEAFB',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    width: '100%'
                  }}>
                    {statusMessage}
                  </div>
                )}

                <button 
                  type="button" 
                  onClick={handleBrowseFilesClick}
                  disabled={isUploading}
                  className="btn btn-outline"
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '25px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    opacity: isUploading ? 0.6 : 1,
                    cursor: isUploading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isUploading ? 'Uploading...' : 'Browse Files'}
                </button>

                <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                  Supported formats: PDF
                </div>

                {uploadStatus === 'success' && (
                  <button 
                    type="button" 
                    onClick={() => router.push('/dashboard')}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    Continue to Dashboard ➔
                  </button>
                )}
              </div>

              {/* Option Card 2: Add Courses Manually */}
              <div 
                style={{
                  border: '2px dashed #D6C7FB',
                  borderRadius: '16px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  background: '#FAF9FF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justify: 'space-between',
                  gap: '1.25rem'
                }}
              >
                <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: '#EFEAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: '#6D3FEA' }}>
                  ＋
                </div>

                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1A1638', margin: '0 0 0.4rem 0' }}>Add Courses Manually</h3>
                  <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0, lineHeight: 1.4 }}>
                    Prefer to enter your courses, units,<br />and topics yourself?
                  </p>
                </div>

                <button 
                  type="button" 
                  onClick={() => setViewMode('manual-entry')}
                  className="btn btn-outline"
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '25px',
                    fontWeight: 700,
                    fontSize: '0.95rem'
                  }}
                >
                  Add Courses Manually
                </button>

                <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                  Quick form setup without document upload
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Manual Course Selection Sub-view */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1A1638', margin: 0 }}>Add Courses Manually 📚</h2>
                <p style={{ color: '#6B7280', margin: '0.25rem 0 0 0' }}>Select your subjects to configure your learning path.</p>
              </div>
              <button type="button" onClick={() => setViewMode('select-option')} className="btn btn-outline btn-sm">
                ← Back to Upload
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {DEFAULT_COURSES.map(course => {
                const isSelected = selectedCourses.includes(course.name);
                return (
                  <div 
                    key={course.name}
                    onClick={() => toggleCourse(course.name)}
                    style={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: `2px solid ${isSelected ? '#6D3FEA' : '#E2DDF5'}`,
                      background: isSelected ? '#EFEAFB' : '#FAF9FF',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1A1638' }}>{course.name} ({course.code})</h3>
                      <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>{(course.units || []).length} Main Learning Units</span>
                    </div>
                    <div style={{ fontSize: '1.4rem' }}>{isSelected ? '✅' : '➕'}</div>
                  </div>
                );
              })}
            </div>

            <button type="button" onClick={handleFinishManual} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Complete Setup & Go to Dashboard ➔
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
