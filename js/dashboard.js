/* ==========================================================================
   LEARNIVO — Student Dashboard & Syllabus Courses Controller
   ========================================================================== */

const PRIMARY_WEBHOOK = "https://api.agents.snsihub.ai/webhook/d519ae83-ca78-4432-906a-728a293e202f";
const SECONDARY_WEBHOOK = "https://api.agents.snsihub.ai/webhook/4a662d25-cbee-4e03-8afb-ecb929b27719";
const TEST_WEBHOOK = "https://api.agents.snsihub.ai/webhook-test/d519ae83-ca78-4432-906a-728a293e202f";

document.addEventListener('DOMContentLoaded', () => {
  if (typeof checkOnboardingGuard === 'function') {
    checkOnboardingGuard();
  }
  renderStudentDashboard();
  initCoursesSection();
});

function renderStudentDashboard() {
  const student = getStoredStudent();

  // Sync header profile details
  if (typeof updateHeaderProfile === 'function') {
    updateHeaderProfile(student);
  }

  const greetingName = document.getElementById('dash-greeting-name');
  if (greetingName) {
    const firstName = (student.name || 'Student').split(' ')[0];
    greetingName.textContent = `Welcome Back, ${firstName}! 👋`;
  }

  const levelGradeTag = document.getElementById('dash-level-grade-tag');
  if (levelGradeTag) {
    levelGradeTag.innerHTML = `Grade: <strong>${escapeHtml(student.grade || 'Grade 11')}</strong> • Personal Syllabus Mode`;
  }

  // Render stats
  const courses = student.syllabusCourses || student.courses || [];
  const xpVal = document.getElementById('dash-xp-val');
  const streakVal = document.getElementById('dash-streak-val');
  const solvedVal = document.getElementById('dash-solved-val');
  const accVal = document.getElementById('dash-acc-val');

  if (xpVal) xpVal.textContent = `${student.xp || 1240} XP`;
  if (streakVal) streakVal.textContent = `${student.streak || 12} Days`;
  if (solvedVal) solvedVal.textContent = `${courses.length} Active`;
  if (accVal) accVal.textContent = `${courses.length} Courses`;
}

function initCoursesSection() {
  const container = document.getElementById('courses-section-container') || document.getElementById('netflix-carousel-container');
  if (!container) return;

  const student = getStoredStudent();
  let syllabusCourses = student ? student.syllabusCourses : null;

  renderCoursesUI(container, syllabusCourses, false, null, null);
}

function renderCoursesUI(container, coursesData, loading, errorMsg, fileErrorMsg) {
  let contentHtml = '';

  if (fileErrorMsg) {
    contentHtml += `
      <div style="padding: 0.75rem 1rem; background: #FEE2E2; border: 1px solid #FCA5A5; color: #991B1B; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem;">
        ⚠️ ${escapeHtml(fileErrorMsg)}
      </div>
    `;
  }

  if (loading) {
    contentHtml += `
      <div style="padding: 3rem 1.5rem; text-align: center; background: #FAF9FF; border-radius: 12px; border: 1px dashed #CBD5E1;">
        <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid #E2DDF5; border-top-color: #6C5CE7; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <h4 style="margin-top: 1rem; color: #1A1638; font-size: 1.1rem;">Analyzing your syllabus...</h4>
        <p style="color: #6B7280; font-size: 0.85rem; margin: 0;">Extracting units, topics, and generating video recommendations.</p>
      </div>
    `;
  } else if (errorMsg) {
    contentHtml += `
      <div style="padding: 2rem; text-align: center; background: #FEF2F2; border-radius: 12px; border: 1px solid #FECACA;">
        <p style="color: #DC2626; font-size: 1rem; font-weight: 600; margin-bottom: 1rem;">${escapeHtml(errorMsg)}</p>
        <button onclick="triggerDashboardPdfUpload()" class="btn btn-primary btn-sm">Try Again</button>
      </div>
    `;
  } else if (!coursesData || coursesData.length === 0) {
    contentHtml += `
      <div style="padding: 3rem 1.5rem; text-align: center; background: #FAF9FF; border-radius: 12px; border: 2px dashed #E2DDF5;">
        <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📄</div>
        <h4 style="color: #1A1638; margin: 0 0 0.5rem 0; font-size: 1.1rem;">Upload your syllabus to create personalized courses.</h4>
        <p style="color: #6B7280; font-size: 0.85rem; margin-bottom: 1.25rem;">Supports PDF format only.</p>
        <button onclick="triggerDashboardPdfUpload()" class="btn btn-primary" style="padding: 0.75rem 1.75rem; font-weight: 600;">Upload Syllabus PDF</button>
      </div>
    `;
  } else {
    contentHtml += `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        ${coursesData.map((courseItem) => `
          <div style="background: #FAF9FF; padding: 1.5rem; border-radius: 12px; border: 1px solid #E2DDF5;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h4 style="margin: 0; font-size: 1.2rem; color: #1A1638; font-weight: 700;">${escapeHtml(courseItem.course)}</h4>
              <span style="font-size: 0.85rem; padding: 0.25rem 0.75rem; background: #EFEBFD; color: #6C5CE7; border-radius: 20px; font-weight: 600;">
                Videos: ${(courseItem.videos || []).length}
              </span>
            </div>

            ${(courseItem.topics && courseItem.topics.length > 0) ? `
              <div style="margin-bottom: 1.25rem;">
                <h5 style="font-size: 0.9rem; color: #4B5563; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">Units / Topics</h5>
                <ul style="margin: 0; padding-left: 1.2rem; color: #374151; font-size: 0.95rem; line-height: 1.6;">
                  ${courseItem.topics.map(t => `<li>${escapeHtml(typeof t === 'string' ? t : (t.name || JSON.stringify(t)))}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${(courseItem.videos && courseItem.videos.length > 0) ? `
              <div>
                <h5 style="font-size: 0.9rem; color: #4B5563; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem;">Recommended Learning Videos</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
                  ${courseItem.videos.map(vid => `
                    <div style="background: #FFF; border-radius: 8px; overflow: hidden; border: 1px solid #E2DDF5;">
                      ${vid.videoId ? `
                        <div style="position: relative; width: 100%; padding-top: 56.25%;">
                          <iframe src="https://www.youtube.com/embed/${vid.videoId}" title="${escapeHtml(vid.title)}" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"></iframe>
                        </div>
                      ` : (vid.thumbnail ? `<img src="${vid.thumbnail}" alt="${escapeHtml(vid.title)}" style="width: 100%; height: auto; aspect-ratio: 16/9; object-fit: cover;">` : '')}

                      <div style="padding: 0.75rem;">
                        <h6 style="margin: 0 0 0.35rem 0; font-size: 0.9rem; color: #1A1638;">${escapeHtml(vid.title)}</h6>
                        ${vid.topic ? `<span style="font-size: 0.75rem; color: #6C5CE7; background: #F3F0FF; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 600; display: inline-block; margin-bottom: 0.35rem;">${escapeHtml(vid.topic)}</span>` : ''}
                        ${vid.reason ? `<p style="margin: 0; font-size: 0.78rem; color: #6B7280;">${escapeHtml(vid.reason)}</p>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid #E2DDF5; display: flex; justify-content: flex-end;">
              <a href="chat.html?course=${encodeURIComponent(courseItem.course)}" class="btn btn-primary btn-sm">View Course →</a>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div className="card" style="background: #FFF; padding: 1.5rem; border-radius: 16px; border: 1px solid #E2DDF5; margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h3 style="font-size: 1.3rem; margin: 0; color: #1A1638; font-weight: 700;">Courses</h3>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: #6B7280;">Upload your syllabus to create personalized courses.</p>
        </div>
        ${(coursesData && coursesData.length > 0 && !loading) ? `
          <button onclick="triggerDashboardPdfUpload()" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 0.4rem;">
            📄 Upload New Syllabus PDF
          </button>
        ` : ''}
      </div>
      <input type="file" id="dashboard-pdf-file-input" accept="application/pdf,.pdf" style="display: none;" onchange="handleDashboardPdfSelect(event)" />
      ${contentHtml}
    </div>
  `;
}

function triggerDashboardPdfUpload() {
  const input = document.getElementById('dashboard-pdf-file-input');
  if (input) input.click();
}

async function handleDashboardPdfSelect(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const container = document.getElementById('courses-section-container') || document.getElementById('netflix-carousel-container');
  if (!container) return;

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    renderCoursesUI(container, null, false, null, "Please upload a PDF file only.");
    return;
  }

  renderCoursesUI(container, null, true, null, null);

  const formData = new FormData();
  formData.append("file", file);

  try {
    let res;
    try {
      res = await fetch(PRIMARY_WEBHOOK, { method: "POST", body: formData });
      if (!res.ok && res.status === 404) {
        try {
          const testRes = await fetch(TEST_WEBHOOK, { method: "POST", body: formData });
          if (testRes.ok) res = testRes;
          else {
            const secRes = await fetch(SECONDARY_WEBHOOK, { method: "POST", body: formData });
            if (secRes.ok) res = secRes;
          }
        } catch (e) {}
      }
    } catch (netErr) {
      res = await fetch(SECONDARY_WEBHOOK, { method: "POST", body: formData });
    }

    if (!res.ok) {
      throw new Error(`Upload status ${res.status}`);
    }

    const responseJson = await res.json();
    console.log("Course generation response:", responseJson);

    const parsedCourses = parseStaticBackendResponse(responseJson);

    const student = getStoredStudent();
    student.syllabusCourses = parsedCourses;
    saveStoredStudent(student);

    renderCoursesUI(container, parsedCourses, false, null, null);
  } catch (err) {
    console.error("Webhook processing error:", err);
    renderCoursesUI(container, null, false, "Unable to analyze your syllabus. Please try again.", null);
  }
}

function parseStaticBackendResponse(data) {
  if (!data) return [];
  let rawCourses = [];
  if (Array.isArray(data)) {
    if (data.length > 0 && (data[0].videoId || data[0].title) && !data[0].topics && !data[0].course) {
      rawCourses = [{ course: "Syllabus Course", topics: Array.from(new Set(data.map(v => v.topic).filter(Boolean))), videos: data }];
    } else {
      rawCourses = data;
    }
  } else if (typeof data === 'object') {
    if (Array.isArray(data.courses)) rawCourses = data.courses;
    else if (Array.isArray(data.data)) rawCourses = data.data;
    else if (Array.isArray(data.results)) rawCourses = data.results;
    else rawCourses = [data];
  }

  return rawCourses.map((c, i) => {
    const name = c.course || c.name || c.title || c.subject || `Course ${i + 1}`;
    let topics = [];
    if (Array.isArray(c.topics)) topics = c.topics;
    else if (Array.isArray(c.units)) {
      c.units.forEach(u => {
        if (typeof u === 'string') topics.push(u);
        else if (u && u.name) topics.push(u.name);
        else if (u && Array.isArray(u.topics)) topics.push(...u.topics);
      });
    } else if (typeof c.topics === 'string') topics = [c.topics];

    let videos = [];
    const rawVids = c.videos || c.recommendations || c.youtube_videos || (Array.isArray(c.output) ? c.output : []);
    if (Array.isArray(rawVids)) {
      videos = rawVids.map(v => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = v.url ? v.url.match(regExp) : null;
        const vId = v.videoId || v.video_id || (match && match[2].length === 11 ? match[2] : null);
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

    return { course: name, topics: topics, videos: videos };
  });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

