const PROD_WEBHOOK_URL = 'https://api.agents.snsihub.ai/webhook/4a662d25-cbee-4e03-8afb-ecb929b27719';
const TEST_WEBHOOK_URL = 'https://api.agents.snsihub.ai/webhook-test/4a662d25-cbee-4e03-8afb-ecb929b27719';

/**
 * Send chat question to SNS Agent Workbench Webhook asynchronously.
 * Tries production webhook first; if inactive/404, automatically routes to the active workbench test endpoint.
 */
export async function sendSubjectChatQuestion(payload) {
  const messageText = payload.question || payload.message || payload.text || '';

  const requestBody = {
    message: messageText,
    question: messageText,
    chatInput: messageText,
    input: messageText,
    query: messageText,
    text: messageText,
    prompt: messageText,
    type: 'chat',
    subject: payload.subject || 'Mathematics',
    topic: payload.topic || 'General',
    student_id: payload.studentId || 'S001',
    student_name: payload.studentName || 'Alex Morgan',
    level: payload.level || 'Grade 11',
    timestamp: new Date().toISOString(),
    source: 'learnivo-subject-chat'
  };

  const endpoints = [PROD_WEBHOOK_URL, TEST_WEBHOOK_URL];

  for (const url of endpoints) {
    try {
      console.log(`Sending message to SNS Agent Workbench webhook (${url})...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ SNS Agent Workbench received message successfully:', data);

        const parsed = parseWebhookResult(data);

        return {
          status: 'success',
          reply: {
            text: parsed.text || '',
            videoUrl: parsed.videoUrl || '',
            title: parsed.title || ''
          }
        };
      } else {
        console.warn(`Webhook ${url} returned status ${response.status} (Workflow may be in test mode)`);
      }
    } catch (e) {
      console.warn(`Fetch error for ${url}:`, e);
    }
  }

  return {
    status: 'empty',
    reply: {
      text: '',
      videoUrl: '',
      title: ''
    }
  };
}

/**
 * Recursively extracts message text, video URL, and title from Workbench response payload
 */
function parseWebhookResult(data) {
  let messageText = '';
  let videoUrl = '';
  let videoTitle = '';

  function searchObj(obj) {
    if (!obj || typeof obj !== 'object') return;

    if (typeof obj.text === 'string' && obj.text.trim()) messageText = messageText || obj.text;
    if (typeof obj.message === 'string' && obj.message.trim()) messageText = messageText || obj.message;
    if (typeof obj.reply === 'string' && obj.reply.trim()) messageText = messageText || obj.reply;
    if (typeof obj.output === 'string' && obj.output.trim()) messageText = messageText || obj.output;
    if (typeof obj.response === 'string' && obj.response.trim()) messageText = messageText || obj.response;
    if (typeof obj.content === 'string' && obj.content.trim()) messageText = messageText || obj.content;

    if (typeof obj.videoUrl === 'string' && obj.videoUrl) videoUrl = videoUrl || obj.videoUrl;
    if (typeof obj.video_url === 'string' && obj.video_url) videoUrl = videoUrl || obj.video_url;
    if (typeof obj.yt_url === 'string' && obj.yt_url) videoUrl = videoUrl || obj.yt_url;
    if (typeof obj.ytUrl === 'string' && obj.ytUrl) videoUrl = videoUrl || obj.ytUrl;
    if (typeof obj.youtube_url === 'string' && obj.youtube_url) videoUrl = videoUrl || obj.youtube_url;
    if (typeof obj.url === 'string' && (obj.url.includes('youtube') || obj.url.includes('youtu.be'))) videoUrl = videoUrl || obj.url;
    if (typeof obj.title === 'string' && obj.title) videoTitle = obj.title;

    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object') searchObj(obj[key]);
    }
  }

  if (typeof data === 'string') {
    messageText = data;
  } else {
    searchObj(data);
  }

  // Extract YouTube URL from message text if embedded
  if (!videoUrl && messageText) {
    const match = messageText.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) {
      videoUrl = match[0].startsWith('http') ? match[0] : 'https://' + match[0];
    }
  }

  return { text: messageText, videoUrl, title: videoTitle };
}
