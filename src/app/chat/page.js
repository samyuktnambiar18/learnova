'use client';

import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main" style={{ paddingBottom: '2rem' }}>
        <Topbar 
          title="Subject AI Tutor" 
          subtitle="Ask questions about subjects & concepts you've learned. Powered by SNS Agent Workbench & Supabase." 
        />
        <ChatInterface />
      </main>
    </div>
  );
}
