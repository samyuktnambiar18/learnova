import { createClient } from '@supabase/supabase-js';
import { getStoredStudent, saveStoredStudent } from './profile';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlmdcjpeezmjccodalfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_R9r9wKLHuVZa4C_JvplwnA_EtTjsoNI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Get current authenticated user or persistent student profile details
 */
export async function getCurrentUser() {
  let authUser = null;
  let studentName = null;

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.log('Supabase auth.getUser() check:', error.message || error);
    }
    if (user && user.id) {
      authUser = user;
      studentName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name;

      try {
        const { data: profData } = await supabase
          .from('profiles')
          .select('name, display_name, full_name')
          .eq('id', user.id)
          .single();
        if (profData) {
          studentName = profData.display_name || profData.full_name || profData.name || studentName;
        }
      } catch (pErr) {
        // Ignore if profiles table is not present
      }
    }
  } catch (e) {
    console.warn('Supabase auth.getUser exception:', e);
  }

  const student = typeof window !== 'undefined' ? getStoredStudent() : { id: 'S001', name: 'Alex Morgan' };

  if (!studentName) {
    studentName = student.name || 'Alex Morgan';
  }

  if (!student.uuid || !student.uuid.includes('-')) {
    student.uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6';
    if (typeof window !== 'undefined') {
      saveStoredStudent(student);
    }
  }

  const finalUserId = authUser ? authUser.id : student.uuid;

  return {
    id: finalUserId,
    email: authUser ? authUser.email : (student.email || 'student@learnivo.com'),
    name: studentName,
    user_name: studentName
  };
}

/**
 * Create a new conversation row in public.chat_conversations
 */
export async function createConversation(subject, topic, firstQuestionText = '') {
  const user = await getCurrentUser();
  const title = generateTitle(firstQuestionText, subject, topic);

  const newConv = {
    user_id: user.id,
    title: title,
    subject: subject || 'Mathematics',
    topic: topic || 'General',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert([newConv])
      .select()
      .single();

    if (error) {
      console.error('CHAT CONVERSATION CREATION ERROR:', error);
    } else if (data) {
      console.log('✅ Created chat_conversation in Supabase:', data.id);
      saveLocalConversation(data);
      return data;
    }
  } catch (err) {
    console.error('Supabase createConversation exception:', err);
  }

  newConv.id = 'conv-' + Date.now();
  saveLocalConversation(newConv);
  return newConv;
}

/**
 * Save a chat message row into public.chat_messages
 */
export async function saveMessage({ conversationId, userId, userName, role, content, subject, topic }) {
  if (!content) return null;
  const user = await getCurrentUser();
  const finalUserId = userId || user.id;
  const finalUserName = userName || user.name || 'Student';

  const msgObj = {
    conversation_id: conversationId,
    user_id: finalUserId,
    user_name: finalUserName,
    role: role || 'user',
    content: content,
    subject: subject || 'Mathematics',
    topic: topic || 'General',
    created_at: new Date().toISOString()
  };

  saveLocalMessage(msgObj);

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([msgObj])
      .select()
      .single();

    if (error) {
      console.error('CHAT MESSAGE SAVE ERROR:', error);
    } else {
      console.log('✅ Saved chat_message to Supabase:', data ? data.id : 'success');
      if (conversationId) {
        await supabase
          .from('chat_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
      return data;
    }
  } catch (err) {
    console.error('Supabase saveMessage exception:', err);
  }

  return msgObj;
}

/**
 * Load user's conversations ordered by updated_at descending
 */
export async function loadUserConversations(subject = null) {
  const user = await getCurrentUser();
  try {
    let query = supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (user && user.id) {
      query = query.eq('user_id', user.id);
    }

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;
    if (error) {
      console.error('LOAD USER CONVERSATIONS ERROR:', error);
    } else if (data && data.length > 0) {
      return data;
    }
  } catch (e) {
    console.error('Supabase loadUserConversations exception:', e);
  }

  return getLocalConversations(user.id, subject);
}

/**
 * Load all messages belonging to a conversation ordered by created_at ascending
 */
export async function loadConversationMessages(conversationId) {
  if (!conversationId) return [];

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('LOAD CONVERSATION MESSAGES ERROR:', error);
    } else if (data && data.length > 0) {
      return data;
    }
  } catch (e) {
    console.error('Supabase loadConversationMessages exception:', e);
  }

  return getLocalMessages(conversationId);
}

function generateTitle(questionText, subject, topic) {
  if (!questionText) return `${subject || 'Study'} Discussion`;
  let clean = questionText.replace(/^(explain|what is|how to|can you|tell me about|how do i)\s+/i, '').trim();
  if (clean.length > 36) {
    clean = clean.substring(0, 36) + '...';
  }
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function saveLocalConversation(conv) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('learnivo_conversations');
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(c => c.id === conv.id);
    if (idx >= 0) list[idx] = conv;
    else list.unshift(conv);
    localStorage.setItem('learnivo_conversations', JSON.stringify(list));
  } catch(e) {}
}

function getLocalConversations(userId, subject) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('learnivo_conversations');
    if (raw) {
      let list = JSON.parse(raw);
      if (subject) list = list.filter(c => c.subject === subject);
      return list;
    }
  } catch(e) {}
  return [];
}

function saveLocalMessage(msg) {
  if (typeof window === 'undefined') return;
  try {
    const key = 'learnivo_msgs_' + (msg.conversation_id || 'default');
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    list.push(msg);
    localStorage.setItem(key, JSON.stringify(list));
  } catch(e) {}
}

function getLocalMessages(conversationId) {
  if (typeof window === 'undefined') return [];
  try {
    const key = 'learnivo_msgs_' + conversationId;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return [];
}
