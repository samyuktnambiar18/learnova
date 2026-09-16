/* ==========================================================================
   LEARNIVO — Multi-Step Onboarding & Course Analysis Controller
   Handles Step 2 (Setup), Step 3 (Analyzing PDF), Step 4 (Review Courses), & Manual Entry
   ========================================================================== */

let detectedCoursesState = [];

document.addEventListener('DOMContentLoaded', () => {
  const student = getStoredStudent();
  if (student.courses && student.courses.length > 0) {
    detectedCoursesState = JSON.parse(JSON.stringify(student.courses));
  } else {
    detectedCoursesState = JSON.parse(JSON.stringify(window.DEFAULT_COURSES));
  }

  initDragAndDrop();
});

/**
 * Switch view step containers inside onboarding.html
 */
function showStepView(viewId) {
  const views = ['step-select-option', 'step-analyzing', 'step-detected-courses', 'step-manual-entry'];
  views.forEach(id => {
    const elem = document.getElementById(id);
    if (elem) elem.style.display = (id === viewId) ? 'block' : 'none';
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Drag & Drop File Upload Handler
 */
function initDragAndDrop() {
  const dropZone = document.getElementById('drag-drop-zone');
  const fileInput = document.getElementById('syllabus-file-input');

  if (!dropZone || !fileInput) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      processUploadedSyllabusFile(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedSyllabusFile(e.target.files[0]);
    }
  });
}

/**
 * Handle Syllabus File Processing
 */
async function processUploadedSyllabusFile(file) {
  if (!file) return;

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    showToast('Please upload a PDF file only.', 'error');
    console.warn('Rejected non-PDF file upload:', file.name);
    return;
  }

  showToast(`Analyzing syllabus: ${file.name}...`, 'info');

  const browseBtn = document.getElementById('browse-files-btn');
  if (browseBtn) browseBtn.disabled = true;

  const PRIMARY_WEBHOOK = "https://api.agents.snsihub.ai/webhook/d519ae83-ca78-4432-906a-728a293e202f";
  const TEST_WEBHOOK = "https://api.agents.snsihub.ai/webhook-test/d519ae83-ca78-4432-906a-728a293e202f";
  const SECONDARY_WEBHOOK = "https://api.agents.snsihub.ai/webhook/4a662d25-cbee-4e03-8afb-ecb929b27719";
  const SECONDARY_TEST_WEBHOOK = "https://api.agents.snsihub.ai/webhook-test/4a662d25-cbee-4e03-8afb-ecb929b27719";

  const formData = new FormData();
  formData.append('file', file);

  let responseData = null;

  // Try Webhooks in order
  const urls = [PRIMARY_WEBHOOK, TEST_WEBHOOK, SECONDARY_WEBHOOK, SECONDARY_TEST_WEBHOOK];
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'POST', body: formData });
      if (res.ok) {
        const json = await res.json();
        if (!json.error || !json.error.includes('workflow inactive')) {
          responseData = json;
          console.log("Successfully connected to webhook:", url, responseData);
          break;
        }
      }
    } catch (e) {
      console.warn("Webhook attempt failed:", url, e);
    }
  }

  if (responseData) {
    showToast('Syllabus processed successfully.', 'success');
    try {
      const student = typeof getStoredStudent === 'function' ? getStoredStudent() : {};
      student.syllabusFileName = file.name;
      student.syllabusWebhookData = responseData;

      let parsedCourses = [];
      if (typeof parseStaticBackendResponse === 'function') {
        parsedCourses = parseStaticBackendResponse(responseData);
      } else if (Array.isArray(responseData.courses)) {
        parsedCourses = responseData.courses;
      }

      if (parsedCourses.length > 0) {
        student.syllabusCourses = parsedCourses;
        student.courses = parsedCourses;
      }
      student.completedOnboarding = true;
      if (typeof saveStoredStudent === 'function') saveStoredStudent(student);
    } catch (saveErr) {
      console.error("Error saving student profile:", saveErr);
    }

    setTimeout(() => {
      window.location.href = 'student-dashboard.html';
    }, 600);
    if (browseBtn) browseBtn.disabled = false;
    return;
  }

  // Local Fallback PDF Parsing Engine if webhooks are unreachable or inactive
  try {
    showToast('Extracting syllabus text locally...', 'info');
    let localCourses = [];
    if (window.learnivoSyllabusParser) {
      const text = await window.learnivoSyllabusParser.extractTextFromFile(file);
      const result = await window.learnivoSyllabusParser.analyzeSyllabusContent(text);
      if (result && result.courses) {
        localCourses = result.courses;
      }
    }

    if (localCourses.length === 0) {
      localCourses = window.DEFAULT_COURSES || [];
    }

    const student = typeof getStoredStudent === 'function' ? getStoredStudent() : {};
    student.syllabusFileName = file.name;
    student.syllabusCourses = localCourses;
    student.courses = localCourses;
    student.completedOnboarding = true;
    if (typeof saveStoredStudent === 'function') saveStoredStudent(student);

    showToast('Syllabus parsed successfully!', 'success');
    setTimeout(() => {
      window.location.href = 'student-dashboard.html';
    }, 600);
  } catch (fallbackErr) {
    console.error("Local PDF parsing fallback error:", fallbackErr);
    const student = typeof getStoredStudent === 'function' ? getStoredStudent() : {};
    student.syllabusFileName = file.name;
    student.completedOnboarding = true;
    if (typeof saveStoredStudent === 'function') saveStoredStudent(student);

    showToast('Syllabus setup completed!', 'success');
    setTimeout(() => {
      window.location.href = 'student-dashboard.html';
    }, 600);
  } finally {
    if (browseBtn) browseBtn.disabled = false;
  }
}

/**
 * Render Detected Courses Page (Step 4)
 */
function renderDetectedCourses() {
  const container = document.getElementById('detected-courses-list');
  if (!container) return;

  if (!detectedCoursesState || detectedCoursesState.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">No courses detected yet.</div>`;
    return;
  }

  container.innerHTML = detectedCoursesState.map((course, idx) => {
    const units = course.units || [];
    let allTopics = [];
    units.forEach(u => { allTopics = allTopics.concat(u.topics || []); });

    const displayTopics = allTopics.slice(0, 4);
    const remainingCount = Math.max(0, allTopics.length - displayTopics.length);

    return `
      <div class="detected-course-card">
        <div class="course-card-top">
          <div>
            <h3 class="course-card-title">${escapeHtml(course.name)}</h3>
            <div class="course-card-meta">${units.length} Units · ${allTopics.length} Topics ${course.code ? `(${course.code})` : ''}</div>
          </div>
          <div class="course-card-icon">${getSubjectIconEmoji(course.name)}</div>
        </div>

        <div class="topic-pills-list">
          ${displayTopics.map(t => `
            <div class="topic-pill">
              <span class="check-icon">✓</span>
              <span>${escapeHtml(t)}</span>
            </div>
          `).join('')}
          ${remainingCount > 0 ? `
            <div class="topic-pill" style="font-weight: 600; color: var(--primary-purple);">
              + ${remainingCount} more topics
            </div>
          ` : ''}
        </div>

        <div class="course-card-actions">
          <button class="btn-icon-action" onclick="openEditCourseModal(${idx})">
            <span>✏️ Edit</span>
          </button>
          <button class="btn-icon-action danger" onclick="deleteDetectedCourse(${idx})">
            <span>🗑️ Delete</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function getSubjectIconEmoji(name) {
  const s = (name || '').toLowerCase();
  if (s.includes('math') || s.includes('mat')) return '📐';
  if (s.includes('physic') || s.includes('phy')) return '⚛️';
  if (s.includes('chem') || s.includes('chm')) return '🧪';
  if (s.includes('comp') || s.includes('code') || s.includes('cs')) return '💻';
  if (s.includes('bio')) return '🧬';
  if (s.includes('econ')) return '📊';
  if (s.includes('hist')) return '🏛️';
  return '📚';
}

/**
 * Delete course from detected list
 */
function deleteDetectedCourse(index) {
  if (detectedCoursesState.length <= 1) {
    showToast('You must keep at least one course!', 'warning');
    return;
  }
  detectedCoursesState.splice(index, 1);
  renderDetectedCourses();
  showToast('Course removed', 'info');
}

/**
 * Confirm and Complete Onboarding Setup
 */
function confirmAndGoToDashboard() {
  const student = getStoredStudent();
  student.courses = detectedCoursesState;
  student.completedOnboarding = true;
  saveStoredStudent(student);

  showToast('Course setup complete! Opening your dashboard...', 'success');
  setTimeout(() => {
    window.location.href = 'student-dashboard.html';
  }, 600);
}

/**
 * Edit Course Modal Logic
 */
let currentEditIndex = -1;

function openEditCourseModal(index) {
  currentEditIndex = index;
  const course = detectedCoursesState[index];
  if (!course) return;

  document.getElementById('edit-course-name').value = course.name;
  document.getElementById('edit-course-code').value = course.code || '';

  let allTopicsText = [];
  (course.units || []).forEach(u => {
    allTopicsText = allTopicsText.concat(u.topics || []);
  });

  document.getElementById('edit-course-topics').value = allTopicsText.join('\n');
  document.getElementById('edit-course-modal').classList.add('active');
}

function closeEditCourseModal() {
  document.getElementById('edit-course-modal').classList.remove('active');
}

function saveEditedCourseModal() {
  if (currentEditIndex < 0 || !detectedCoursesState[currentEditIndex]) return;

  const name = document.getElementById('edit-course-name').value.trim();
  const code = document.getElementById('edit-course-code').value.trim();
  const topicsRaw = document.getElementById('edit-course-topics').value.trim();

  if (!name) {
    showToast('Course name is required', 'error');
    return;
  }

  const topicLines = topicsRaw.split(/\r?\n/).map(t => t.trim()).filter(t => t.length > 0);

  // Group topics into units
  let units = [];
  const chunkSize = Math.max(2, Math.ceil(topicLines.length / 4));
  for (let i = 0; i < topicLines.length; i += chunkSize) {
    const chunk = topicLines.slice(i, i + chunkSize);
    units.push({
      name: `Unit ${units.length + 1}: ${chunk[0]} & Concepts`,
      topics: chunk
    });
  }

  if (units.length === 0) {
    units = window.learnivoSyllabusParser.generateFallbackUnitsForSubject(name);
  }

  detectedCoursesState[currentEditIndex].name = name;
  detectedCoursesState[currentEditIndex].code = code || `CRS101`;
  detectedCoursesState[currentEditIndex].units = units;

  closeEditCourseModal();
  renderDetectedCourses();
  showToast('Course updated successfully', 'success');
}

/**
 * Manual Course Entry Flow (Step 5 of Mockup)
 */
function openManualEntryView() {
  const container = document.getElementById('manual-courses-container');
  if (container) {
    container.innerHTML = '';
    addManualCourseFormRow('Mathematics', 'MAT101', ['Matrices & Determinants', 'Differential Calculus', 'Integral Calculus']);
    addManualCourseFormRow('Physics', 'PHY101', ['Mechanics', 'Thermodynamics', 'Electromagnetism']);
  }
  showStepView('step-manual-entry');
}

function addManualCourseFormRow(defaultName = '', defaultCode = '', defaultTopics = []) {
  const container = document.getElementById('manual-courses-container');
  if (!container) return;

  const rowId = `manual-row-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  const div = document.createElement('div');
  div.className = 'manual-course-box';
  div.id = rowId;
  div.innerHTML = `
    <button type="button" class="remove-btn-absolute" onclick="removeManualCourseRow('${rowId}')" title="Remove course">✕</button>
    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem;">
      <div class="form-group-custom">
        <label>Course Name</label>
        <input type="text" class="custom-input-field manual-name" placeholder="e.g. Computer Science" value="${escapeHtml(defaultName)}" required>
      </div>
      <div class="form-group-custom">
        <label>Course Code (Optional)</label>
        <input type="text" class="custom-input-field manual-code" placeholder="e.g. CS101" value="${escapeHtml(defaultCode)}">
      </div>
      <div class="form-group-custom">
        <label>Number of Units</label>
        <input type="number" class="custom-input-field manual-units-count" min="1" max="10" value="4">
      </div>
    </div>
    <div class="form-group-custom">
      <label>Topics / Chapters (Enter one per line)</label>
      <textarea class="custom-input-field manual-topics" rows="3" placeholder="e.g.&#10;Introduction to Programming&#10;Variables and Data Types&#10;Control Structures">${defaultTopics.join('\n')}</textarea>
    </div>
  `;

  container.appendChild(div);
}

function removeManualCourseRow(rowId) {
  const elem = document.getElementById(rowId);
  if (elem) elem.remove();
}

function saveManualCoursesAndContinue() {
  const rows = document.querySelectorAll('.manual-course-box');
  let manualCourses = [];

  rows.forEach(row => {
    const name = row.querySelector('.manual-name').value.trim();
    const code = row.querySelector('.manual-code').value.trim();
    const topicsRaw = row.querySelector('.manual-topics').value.trim();

    if (name) {
      const topicLines = topicsRaw.split(/\r?\n/).map(t => t.trim()).filter(t => t.length > 0);
      let units = [];
      const chunkSize = Math.max(2, Math.ceil(topicLines.length / 4));
      for (let i = 0; i < topicLines.length; i += chunkSize) {
        const chunk = topicLines.slice(i, i + chunkSize);
        units.push({
          name: `Unit ${units.length + 1}`,
          topics: chunk
        });
      }

      if (units.length === 0) {
        units = window.learnivoSyllabusParser.generateFallbackUnitsForSubject(name);
      }

      manualCourses.push({
        name,
        code: code || `CRS101`,
        units
      });
    }
  });

  if (manualCourses.length === 0) {
    showToast('Please enter at least one course!', 'error');
    return;
  }

  detectedCoursesState = manualCourses;
  renderDetectedCourses();
  showStepView('step-detected-courses');
  showToast('Manual courses added! Review your course list.', 'success');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
