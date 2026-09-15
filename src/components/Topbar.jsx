'use client';

import { useState, useEffect } from 'react';
import { getStoredStudent } from '@/lib/profile';

export default function Topbar({ title, subtitle }) {
  const [student, setStudent] = useState({ name: 'Alex Morgan', grade: 'Grade 11', avatar: '/assets/images/avatar-1.png' });

  useEffect(() => {
    const data = getStoredStudent();
    if (data) setStudent(data);
  }, []);

  const initials = student.name ? student.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'AM';

  return (
    <div className="dashboard-topbar" style={{ marginBottom: '1.5rem' }}>
      <div className="greeting-text">
        <h2>{title || 'Subject AI Tutor'}</h2>
        <p>{subtitle || "Ask questions about subjects & concepts you've learned. Powered by SNS Agent Workbench."}</p>
      </div>

      <div className="topbar-right">
        <div id="sns-backend-badge"></div>
        <div className="user-avatar-badge">
          <div 
            className="user-avatar-img" 
            style={{ backgroundImage: `url('${student.avatar || '/assets/images/avatar-1.png'}')`, backgroundSize: 'cover' }}
          >
            {!student.avatar && initials}
          </div>
          <div>
            <h5 style={{ fontSize: '0.9rem', margin: 0 }}>{student.name || 'Alex Morgan'}</h5>
            <span style={{ fontSize: '0.78rem', color: 'var(--secondary-text)' }}>{student.grade || 'Student'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
