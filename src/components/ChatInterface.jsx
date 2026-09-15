'use client';

import { useState, useEffect, useRef } from 'react';
import { getStoredStudent, DEFAULT_COURSES } from '@/lib/profile';
import { 
  getCurrentUser, 
  createConversation, 
  saveMessage, 
  loadUserConversations, 
  loadConversationMessages 
} from '@/lib/supabaseClient';
import { sendSubjectChatQuestion } from '@/lib/api';

export default function ChatInterface() {
  const [currentSubject, setCurrentSubject] = useState('Mathematics');
  const [currentTopic, setCurrentTopic] = useState('Quadratic Equations');
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [student, setStudent] = useState({ name: 'Alex Morgan', courses: DEFAULT_COURSES });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const data = getStoredStudent();
    if (data) {
      setStudent(data);
      if (data.courses && data.courses.length > 0) {
        const first = data.courses[0];
        setCurrentSubject(first.name);
        if (first.units && first.units.length > 0) {
          setCurrentTopic(first.units[0].name);
        }
      }
    }
  }, []);

  useEffect(() => {
    loadSubjectConversation(currentSubject);
  }, [currentSubject]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSubjectConversation = async (sub) => {
    const convs = await loadUserConversations(sub);
    if (convs && convs.length > 0) {
      const activeConv = convs[0];
      setActiveConversationId(activeConv.id);
      const msgs = await loadConversationMessages(activeConv.id);
      setMessages(msgs || []);
    } else {
      setActiveConversationId(null);
      setMessages([]);
    }
  };

  const handleSubjectSelect = async (subName) => {
    setCurrentSubject(subName);
    const course = (student.courses || DEFAULT_COURSES).find(c => c.name === subName);
    if (course && course.units && course.units.length > 0) {
      setCurrentTopic(course.units[0].name);
    } else {
      setCurrentTopic('General Concepts');
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setInputText('');
    await processQuestion(text);
  };

  const processQuestion = async (questionText) => {
    // 1. Get authenticated user & dynamic student name
    const currentUser = await getCurrentUser();
    const studentName = currentUser.name || student.name || 'Alex Morgan';

    console.log('Authenticated user:', currentUser);
    console.log('Student name:', studentName);

    // 2. Get or create conversation ID
    let convId = activeConversationId;
    if (!convId) {
      const newConv = await createConversation(currentSubject, currentTopic, questionText);
      if (newConv && newConv.id) {
        convId = newConv.id;
        setActiveConversationId(convId);
      }
    }

    console.log('Conversation ID:', convId);

    // 3. Immediately save user message to Supabase public.chat_messages
    console.log('Saving user message:', questionText);
    const userMsgObj = {
      id: 'usr-' + Date.now(),
      conversation_id: convId,
      user_id: currentUser.id,
      user_name: studentName,
      role: 'user',
      content: questionText,
      subject: currentSubject,
      topic: currentTopic,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsgObj]);
    setIsTyping(true);

    if (convId) {
      await saveMessage({
        conversationId: convId,
        userId: currentUser.id,
        userName: studentName,
        role: 'user',
        content: questionText,
        subject: currentSubject,
        topic: currentTopic
      });
    }

    // 4. Send request to SNS Agent Workbench Webhook
    const payload = {
      question: questionText,
      message: questionText,
      subject: currentSubject,
      topic: currentTopic,
      studentId: currentUser.id || 'S001',
      studentName: studentName,
      level: student.grade || 'Grade 11'
    };

    let replyObj = null;
    let aiReplyText = '';

    try {
      const res = await sendSubjectChatQuestion(payload);
      if (res && res.reply) {
        replyObj = res.reply;
        aiReplyText = typeof replyObj === 'object' && replyObj !== null ? (replyObj.text || '') : String(replyObj || '');
      }
    } catch (err) {
      console.error('AI Webhook exception:', err);
    }

    setIsTyping(false);

    // 5. If response received from webhook (text or videoUrl), display and save to Supabase
    const hasContent = replyObj && (replyObj.text || replyObj.videoUrl || (typeof replyObj === 'string' && replyObj.trim()));
    if (hasContent) {
      console.log('Saving AI response received from webhook:', aiReplyText || replyObj);
      const aiMsgObj = {
        id: 'ai-' + Date.now(),
        conversation_id: convId,
        user_id: currentUser.id,
        user_name: studentName,
        role: 'assistant',
        content: replyObj,
        subject: currentSubject,
        topic: currentTopic,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsgObj]);

      if (convId) {
        await saveMessage({
          conversationId: convId,
          userId: currentUser.id,
          userName: studentName,
          role: 'assistant',
          content: aiReplyText,
          subject: currentSubject,
          topic: currentTopic
        });
      }
    }
  };

  const handleResetChat = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const toggleHistoryPopover = async () => {
    if (!showHistory) {
      setShowHistory(true);
      setIsLoadingHistory(true);
      const convs = await loadUserConversations();
      setHistoryList(convs || []);
      setIsLoadingHistory(false);
    } else {
      setShowHistory(false);
    }
  };

  const selectHistoryItem = async (convId, sub) => {
    setActiveConversationId(convId);
    if (sub && sub !== currentSubject) {
      setCurrentSubject(sub);
    }
    setShowHistory(false);
    const msgs = await loadConversationMessages(convId);
    setMessages(msgs || []);
  };

  const renderMessageContent = (replyData) => {
    let textContent = '';
    let videoTitle = '';
    let videoUrl = '';
    let videoId = '';

    if (typeof replyData === 'object' && replyData !== null) {
      textContent = replyData.text || replyData.message || replyData.output || replyData.response || '';
      videoTitle = replyData.title || replyData.videoTitle || '';
      videoUrl = replyData.videoUrl || replyData.video_url || replyData.yt_url || replyData.ytUrl || replyData.youtube_url || replyData.url || '';
      videoId = replyData.videoId || '';
    } else {
      textContent = String(replyData || '');
    }

    if (!videoId && (videoUrl || textContent)) {
      const stringToSearch = (videoUrl + ' ' + textContent);
      const match = stringToSearch.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match) {
        videoId = match[1];
        if (!videoUrl) videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      }
    }

    let html = textContent
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.15rem; margin-top: 0.5rem; margin-bottom: 0.5rem;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.3rem; margin-top: 0.6rem; margin-bottom: 0.6rem;">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\$\$(.*?)\$\$/gs, '<div style="background: #FAF9FF; padding: 0.5rem 1rem; border-radius: 8px; margin: 0.5rem 0; font-family: var(--font-number); font-weight: 700; color: #6D3FEA; font-size: 1.05rem;">$$ $1 $$</div>')
      .replace(/\$(.*?)\$/g, '<code style="background: #EFEAFB; color: #6D3FEA; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 600;">$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/- (.*$)/gim, '• $1<br>');

    return (
      <div>
        {textContent && <div dangerouslySetInnerHTML={{ __html: html }} className="markdown-body" />}
        {(videoUrl || videoId) && (
          <div className="recommended-resource-card" style={{ marginTop: textContent ? '0.8rem' : 0, background: '#FAF9FF', border: '1px solid #E2DDF5', borderRadius: '12px', padding: '0.85rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#6D3FEA', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🎥</span> <span>Recommended Learning Resource</span>
            </div>
            {videoTitle && <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem 0', color: '#1A1638' }}>{videoTitle}</h4>}
            {videoId && (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', marginBottom: '0.5rem' }}>
                <iframe 
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`} 
                  title={videoTitle || 'YouTube Video'} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} 
                  allowFullScreen
                />
              </div>
            )}
            <div>
              <a href={videoUrl || `https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem' }}>
                ▶ Watch on YouTube
              </a>
            </div>
          </div>
        )}
      </div>
    );
  };

  const courses = student.courses || DEFAULT_COURSES;
  const currentCourse = courses.find(c => c.name === currentSubject) || courses[0];
  const quickQuestions = (currentCourse?.units || []).flatMap(u => (u.topics || []).map(t => `Explain ${t} with step-by-step example`)).slice(0, 4);

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-title-group">
          <div className="chat-avatar-icon">🧠</div>
          <div>
            <h3>AI Subject Assistant</h3>
            <p id="active-topic-badge">{currentSubject} • {currentTopic}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={toggleHistoryPopover} title="View Supabase Conversations">
            📜 History
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleResetChat} title="Start New Conversation">
            🔄 Reset Chat
          </button>

          {/* History Popover */}
          {showHistory && (
            <div className="chat-history-popover" style={{ display: 'block', position: 'absolute', top: '110%', right: 0, width: '320px', maxHeight: '380px', background: '#FFFFFF', border: '1px solid #E2DDF5', boxShadow: '0 10px 25px rgba(109, 63, 234, 0.15)', borderRadius: '12px', zIndex: 1000, overflowY: 'auto', padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #E2DDF5', paddingBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#6D3FEA' }}>📜 Supabase Chat History</span>
                <span style={{ fontSize: '0.8rem', color: '#6B7280', cursor: 'pointer', padding: '0.2rem 0.5rem' }} onClick={() => setShowHistory(false)}>✕</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {isLoadingHistory ? (
                  <span style={{ fontSize: '0.8rem', color: '#6B7280', padding: '0.5rem' }}>Loading history...</span>
                ) : historyList.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: '#6B7280', padding: '0.5rem' }}>No previous conversations found.</span>
                ) : (
                  historyList.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => selectHistoryItem(c.id, c.subject)}
                      style={{ padding: '0.5rem 0.6rem', borderRadius: '8px', background: c.id === activeConversationId ? '#EFEAFB' : '#FAF9FF', border: `1px solid ${c.id === activeConversationId ? '#6D3FEA' : '#E2DDF5'}`, cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#1A1638', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.title || 'Conversation'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.72rem', background: '#EFEAFB', color: '#6D3FEA', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                          {c.subject || 'General'}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>
                          {new Date(c.updated_at || c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subject Selector Bar */}
      <div className="chat-subject-bar">
        {courses.map(course => (
          <div 
            key={course.name}
            className={`subject-chip ${course.name === currentSubject ? 'active' : ''}`}
            onClick={() => handleSubjectSelect(course.name)}
          >
            {course.name.toLowerCase().includes('math') ? '∑' : course.name.toLowerCase().includes('physic') ? '⚛️' : course.name.toLowerCase().includes('chem') ? '🧪' : '📖'} {course.name}
          </div>
        ))}
      </div>

      {/* Message Area */}
      <div className="chat-messages-area">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const initials = student.name ? student.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'AM';
          return (
            <div key={msg.id || index} className={`chat-message ${isUser ? 'user-message' : 'ai-message'}`}>
              <div className="message-avatar">{isUser ? initials : '✨'}</div>
              <div className="message-bubble">
                {renderMessageContent(msg.content)}
                <div className="message-meta" style={{ marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {isUser ? 'You' : 'SNS Agent Workbench'} • {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="chat-message ai-message typing-container-msg">
            <div className="message-avatar">✨</div>
            <div className="message-bubble">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <div className="quick-questions-wrapper">
        {(quickQuestions.length > 0 ? quickQuestions : [`Explain core concepts of ${currentSubject}`]).map((q, i) => (
          <button key={i} type="button" className="quick-chip" onClick={() => processQuestion(q)}>
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="chat-input-area">
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            className="chat-input-field" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask a question about ${currentSubject}...`} 
            autoComplete="off"
            required
          />
          <button type="submit" className="chat-send-btn" title="Send question">
            ➔
          </button>
        </form>
      </div>
    </div>
  );
}
