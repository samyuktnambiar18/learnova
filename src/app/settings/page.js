'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { getStoredStudent, saveStoredStudent } from '@/lib/profile';

export default function SettingsPage() {
  const [student, setStudent] = useState({ name: '', grade: '' });

  useEffect(() => {
    setStudent(getStoredStudent());
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    saveStoredStudent(student);
    alert('Settings saved successfully!');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main" style={{ paddingBottom: '2rem' }}>
        <Topbar title="Settings & Profile Configuration" subtitle="Update your account preferences and study configurations." />
        <div className="card" style={{ background: '#FFF', padding: '2rem', borderRadius: '16px', border: '1px solid #E2DDF5', maxWidth: '600px' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>Display Name</label>
              <input 
                type="text" 
                value={student.name} 
                onChange={(e) => setStudent({ ...student, name: e.target.value })}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #E2DDF5' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>Grade Level</label>
              <input 
                type="text" 
                value={student.grade} 
                onChange={(e) => setStudent({ ...student, grade: e.target.value })}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #E2DDF5' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
              Save Settings 💾
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
