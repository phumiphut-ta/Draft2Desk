/**
 * Main Application Logic for Draft2Desk
 */

const API_BASE = '/api/v1/templates';
let templates = [];
let activeCategory = 'all';
let searchQuery = '';
let templateToDelete = null;
let activeUsageTemplate = null;

// DOM Elements
const templatesGrid = document.getElementById('templates-grid');
const templateCount = document.getElementById('template-count');
const categoryPills = document.getElementById('category-pills');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const fabAddTemplate = document.getElementById('fab-add-template');

// Modal Elements (Editor)
const editorModal = document.getElementById('editor-modal');
const modalTitle = document.getElementById('modal-title');
const templateForm = document.getElementById('template-form');
const editTemplateId = document.getElementById('edit-template-id');
const templateTitleInput = document.getElementById('template-title');
const templateCategoryInput = document.getElementById('template-category');
const templateContentInput = document.getElementById('template-content');
const btnCloseModal = document.getElementById('btn-close-modal');
const closeEditorModalBtn = document.getElementById('close-editor-modal');

// Drawer Elements (Variables)
const variablesDrawer = document.getElementById('variables-drawer');
const varsTemplateTitle = document.getElementById('vars-template-title');
const variablesForm = document.getElementById('variables-form');
const btnInsertResolved = document.getElementById('btn-insert-resolved');
const btnCancelResolved = document.getElementById('btn-cancel-resolved');
const closeVariablesDrawerBtn = document.getElementById('close-variables-drawer');

// Confirm Delete Modal Elements
const confirmModal = document.getElementById('confirm-modal');
const deleteTemplateName = document.getElementById('delete-template-name');
const btnConfirmDelete = document.getElementById('btn-confirm-delete');
const btnCancelDelete = document.getElementById('btn-cancel-delete');

// Settings Storage Key & Defaults
const SETTINGS_KEY = 'draft2desk_settings';
const DEFAULT_SETTINGS = {
    fontFamily: 'TH Sarabun New',
    fontSize: 16
};

let appSettings = { ...DEFAULT_SETTINGS };

function getAppSettings() {
    return appSettings;
}

function loadSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            appSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('Failed to load settings:', e);
        appSettings = { ...DEFAULT_SETTINGS };
    }
}

function saveSettings(fontFamily, fontSize) {
    appSettings = { fontFamily, fontSize: parseInt(fontSize, 10) || 16 };
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
    } catch (e) {
        console.error('Failed to save settings:', e);
    }
    applySettingsToUI();
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    fetchTemplates();
    setupEventListeners();
    setupSettingsEvents();
    applySettingsToUI();
});

// Fetch all templates from API
async function fetchTemplates() {
    try {
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error('Cannot fetch templates');
        templates = await response.json();
        
        updateCategories();
        renderTemplates();
    } catch (error) {
        console.error('Error fetching templates:', error);
        templatesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-exclamation text-danger" style="font-size: 2rem;"></i>
                <p>ไม่สามารถเชื่อมต่อฐานข้อมูลได้</p>
                <button class="btn btn-secondary" onclick="fetchTemplates()">
                    <i class="fa-solid fa-rotate-right"></i> ลองใหม่
                </button>
            </div>
        `;
        showToast('ไม่สามารถโหลดข้อมูลเทมเพลตได้', 'error');
    }
}

// Generate unique categories list & render pills
function updateCategories() {
    const categories = ['all', ...new Set(templates.map(t => t.category))];
    
    // Save reference to active one
    const currentActive = activeCategory;
    
    categoryPills.innerHTML = '';
    categories.forEach(cat => {
        const button = document.createElement('button');
        button.className = `pill ${cat === currentActive ? 'active' : ''}`;
        button.dataset.category = cat;
        button.textContent = cat === 'all' ? 'ทั้งหมด' : cat;
        button.addEventListener('click', () => {
            document.querySelectorAll('.category-filters .pill').forEach(p => p.classList.remove('active'));
            button.classList.add('active');
            activeCategory = cat;
            renderTemplates();
        });
        categoryPills.appendChild(button);
    });
    
    // If active category was deleted, fallback to all
    if (!categories.includes(currentActive)) {
        activeCategory = 'all';
        if (categoryPills.firstChild) {
            categoryPills.firstChild.classList.add('active');
        }
    }
}

// Render filtered templates list
function renderTemplates() {
    const filtered = templates.filter(tpl => {
        const matchesCategory = activeCategory === 'all' || tpl.category === activeCategory;
        const matchesSearch = tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              tpl.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              tpl.content_html.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    templateCount.textContent = filtered.length;
    templatesGrid.innerHTML = '';
    
    if (filtered.length === 0) {
        templatesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-folder-open"></i>
                <p>${templates.length === 0 ? 'ยังไม่มีเทมเพลตในระบบ กดปุ่ม + เพื่อสร้าง' : 'ไม่พบเทมเพลตที่ค้นหา'}</p>
            </div>
        `;
        return;
    }
    
    filtered.forEach(tpl => {
        const card = document.createElement('div');
        card.className = 'template-card';
        
        // Render variables preview
        let varsHtml = '<div class="card-variables">';
        if (tpl.variables && tpl.variables.length > 0) {
            // Show up to 3 variables, then show count
            const visibleVars = tpl.variables.slice(0, 3);
            visibleVars.forEach(v => {
                varsHtml += `<span class="var-tag">${v}</span>`;
            });
            if (tpl.variables.length > 3) {
                varsHtml += `<span class="var-tag count-tag">+${tpl.variables.length - 3}</span>`;
            }
        } else {
            varsHtml += '<span class="no-vars-text">ไม่มีตัวแปร (แทรกได้ทันที)</span>';
        }
        varsHtml += '</div>';
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${escapeHtml(tpl.title)}</h3>
                <span class="card-badge">${escapeHtml(tpl.category)}</span>
            </div>
            ${varsHtml}
            <div class="card-actions">
                <button class="btn btn-danger btn-icon-only btn-delete" title="ลบเทมเพลต">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
                <button class="btn btn-secondary btn-icon-only btn-edit" title="แก้ไขเทมเพลต">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn btn-primary btn-use" style="padding: 8px 16px;">
                    <i class="fa-solid fa-file-signature"></i> ใช้งาน
                </button>
            </div>
        `;
        
        // Attach action handlers
        card.querySelector('.btn-use').addEventListener('click', () => handleTemplateUsage(tpl));
        card.querySelector('.btn-edit').addEventListener('click', () => openEditorModal(tpl));
        card.querySelector('.btn-delete').addEventListener('click', () => openDeleteConfirm(tpl));
        
        templatesGrid.appendChild(card);
    });
}

// Handle Template Usage (Insert or customize variables)
function handleTemplateUsage(tpl) {
    activeUsageTemplate = tpl;
    if (tpl.variables && tpl.variables.length > 0) {
        // Open variables customized drawer
        varsTemplateTitle.textContent = tpl.title;
        variablesForm.innerHTML = '';
        
        tpl.variables.forEach(varName => {
            const formGroup = document.createElement('div');
            formGroup.className = 'var-input-group';
            
            // Set dynamic placeholder/type based on name if applicable (like วันที่)
            let type = 'text';
            let placeholder = `ระบุค่าสำหรับ {{${varName}}}`;
            
            formGroup.innerHTML = `
                <label for="var-${varName}">${varName}</label>
                <input type="${type}" id="var-${varName}" name="${varName}" placeholder="${placeholder}" required>
            `;
            variablesForm.appendChild(formGroup);
        });
        
        // Auto fill today's date for "วันที่" variable if present
        const dateInput = document.getElementById('var-วันที่');
        if (dateInput) {
            const today = new Date();
            const thaiMonths = [
                'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
            ];
            const dateStr = `${today.getDate()} ${thaiMonths[today.getMonth()]} ${today.getFullYear() + 543}`;
            dateInput.value = dateStr;
        }
        
        variablesDrawer.classList.add('active');
    } else {
        // Insert directly
        insertHtmlToWord(tpl.content_html);
    }
}

// Merge variables into template HTML and insert to Word
function insertResolvedTemplate() {
    if (!activeUsageTemplate) return;
    
    // Check form validity
    if (!variablesForm.reportValidity()) return;
    
    let resolvedHtml = activeUsageTemplate.content_html;
    
    // Replace all variables
    activeUsageTemplate.variables.forEach(varName => {
        const inputVal = document.getElementById(`var-${varName}`).value;
        // Escape input value to prevent breaking HTML structure
        const escapedVal = escapeHtml(inputVal);
        
        // Regex to match {{varName}} with optional spaces
        const regex = new RegExp(`\\{\\{\\s*${escapeRegExp(varName)}\\s*\\}\\}`, 'g');
        resolvedHtml = resolvedHtml.replace(regex, escapedVal);
    });
    
    // Perform Word insertion
    insertHtmlToWord(resolvedHtml);
    closeVariablesDrawer();
}

// Setup all general UI event listeners
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        renderTemplates();
    });
    
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        renderTemplates();
        searchInput.focus();
    });
    
    // FAB & Modal Editor Triggers
    fabAddTemplate.addEventListener('click', () => openEditorModal());
    btnCloseModal.addEventListener('click', closeEditorModal);
    closeEditorModalBtn.addEventListener('click', closeEditorModal);
    
    // Drawer Variables Triggers
    btnInsertResolved.addEventListener('click', insertResolvedTemplate);
    btnCancelResolved.addEventListener('click', closeVariablesDrawer);
    closeVariablesDrawerBtn.addEventListener('click', closeVariablesDrawer);
    
    // Save template form
    templateForm.addEventListener('submit', saveTemplate);
    
    // Delete confirm triggers
    btnConfirmDelete.addEventListener('click', execDeleteTemplate);
    btnCancelDelete.addEventListener('click', closeDeleteModal);
    
    // Close overlays when clicking outside the container
    editorModal.addEventListener('click', (e) => {
        if (e.target === editorModal) closeEditorModal();
    });
    variablesDrawer.addEventListener('click', (e) => {
        if (e.target === variablesDrawer) closeVariablesDrawer();
    });
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) closeDeleteModal();
    });
    
    // Rich Editor toolbar helper buttons
    document.querySelectorAll('.editor-toolbar .toolbar-btn').forEach(btn => {
        const command = btn.dataset.cmd;
        if (command) {
            btn.addEventListener('click', () => handleEditorToolbarCommand(command));
        }
    });
    
    // Quick Insert Variable button — uses inline row (no nested modal, avoids Word WebView z-index issues)
    const btnInsertPlaceholder = document.getElementById('btn-insert-placeholder');
    const variableInlineRow = document.getElementById('variable-inline-row');
    const variableNameInput = document.getElementById('variable-name-input');
    const btnConfirmVariable = document.getElementById('btn-confirm-variable');
    const btnCancelVariable = document.getElementById('btn-cancel-variable');

    function openVariableInline() {
        variableNameInput.value = '';
        variableInlineRow.style.display = 'flex';
        setTimeout(() => variableNameInput.focus(), 50);
    }
    function closeVariableInline() {
        variableInlineRow.style.display = 'none';
        variableNameInput.value = '';
    }
    function confirmInsertVariable() {
        const cleanName = variableNameInput.value.trim().replace(/[{}]+/g, '');
        if (cleanName) {
            insertTextAtTextareaCursor(templateContentInput, `{{${cleanName}}}`);
        }
        closeVariableInline();
    }

    btnInsertPlaceholder.addEventListener('click', () => {
        if (variableInlineRow.style.display === 'flex') {
            closeVariableInline();
        } else {
            openVariableInline();
        }
    });
    btnConfirmVariable.addEventListener('click', confirmInsertVariable);
    btnCancelVariable.addEventListener('click', closeVariableInline);
    variableNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); confirmInsertVariable(); }
        if (e.key === 'Escape') closeVariableInline();
    });
}

// Open Editor modal (create / edit modes)
function openEditorModal(tpl = null) {
    templateForm.reset();
    
    if (tpl) {
        // Edit Mode
        modalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square text-accent"></i> แก้ไขเทมเพลต';
        editTemplateId.value = tpl.id;
        templateTitleInput.value = tpl.title;
        templateCategoryInput.value = tpl.category;
        templateContentInput.value = tpl.content_html;
    } else {
        // Create Mode
        modalTitle.innerHTML = '<i class="fa-solid fa-plus-circle text-accent"></i> สร้างเทมเพลตใหม่';
        editTemplateId.value = '';
    }
    
    editorModal.classList.add('active');
    templateTitleInput.focus();
}

function closeEditorModal() {
    editorModal.classList.remove('active');
}

function closeVariablesDrawer() {
    variablesDrawer.classList.remove('active');
    activeUsageTemplate = null;
}

// Save template endpoint handler (create / update)
async function saveTemplate(e) {
    e.preventDefault();
    
    const id = editTemplateId.value;
    const title = templateTitleInput.value.trim();
    const category = templateCategoryInput.value.trim();
    const content_html = templateContentInput.value;
    
    const payload = { title, category, content_html };
    const url = id ? `${API_BASE}/${id}` : API_BASE;
    const method = id ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Failed to save template');
        }
        
        showToast(id ? 'ปรับปรุงเทมเพลตเรียบร้อย!' : 'บันทึกเทมเพลตใหม่เรียบร้อย!', 'success');
        closeEditorModal();
        fetchTemplates();
    } catch (error) {
        console.error('Error saving template:', error);
        showToast(`บันทึกล้มเหลว: ${error.message}`, 'error');
    }
}

// Open Delete confirm dialog
function openDeleteConfirm(tpl) {
    templateToDelete = tpl;
    deleteTemplateName.textContent = tpl.title;
    confirmModal.classList.add('active');
}

function closeDeleteModal() {
    confirmModal.classList.remove('active');
    templateToDelete = null;
}

// Delete endpoint executor
async function execDeleteTemplate() {
    if (!templateToDelete) return;
    
    try {
        const response = await fetch(`${API_BASE}/${templateToDelete.id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete template');
        
        showToast('ลบเทมเพลตสำเร็จ!', 'success');
        closeDeleteModal();
        fetchTemplates();
    } catch (error) {
        console.error('Error deleting template:', error);
        showToast(`ลบเทมเพลตล้มเหลว: ${error.message}`, 'error');
    }
}

// HTML Text Editor selection insertion helpers
function handleEditorToolbarCommand(command) {
    const textarea = templateContentInput;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    
    let replacement = '';
    
    switch (command) {
        case 'bold':
            replacement = `<b>${selected || 'ข้อความตัวหนา'}</b>`;
            break;
        case 'italic':
            replacement = `<i>${selected || 'ข้อความตัวเอียง'}</i>`;
            break;
        case 'heading1':
            replacement = `<h3>${selected || 'หัวข้อเรื่อง'}</h3>`;
            break;
        case 'heading2':
            replacement = `<h4>${selected || 'หัวข้อย่อย'}</h4>`;
            break;
        case 'bullet':
            replacement = `<ul>\n  <li>${selected || 'รายการที่ 1'}</li>\n  <li>รายการที่ 2</li>\n</ul>`;
            break;
        case 'number':
            replacement = `<ol>\n  <li>${selected || 'ลำดับที่ 1'}</li>\n  <li>ลำดับที่ 2</li>\n</ol>`;
            break;
        case 'underline':
            replacement = `<u>${selected || 'ข้อความขีดเส้นใต้'}</u>`;
            break;
        case 'indent':
            if (selected) {
                // Wrap only the selected text in an indented paragraph
                replacement = `<p style="margin-left:2em;">${selected}</p>`;
            } else {
                // No selection — insert 4 non-breaking spaces at cursor position only
                replacement = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            }
            break;
        case 'table':
            replacement = `<table border="1" style="width:100%; border-collapse: collapse; margin-top: 8px;">\n  <thead>\n    <tr style="background-color: #f3f4f6;">\n      <th>หัวข้อ 1</th>\n      <th>หัวข้อ 2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>ข้อมูลแถว 1 ช่อง 1</td>\n      <td>ข้อมูลแถว 1 ช่อง 2</td>\n    </tr>\n  </tbody>\n</table>`;
            break;
    }
    
    insertTextAtTextareaCursor(textarea, replacement);
}

function insertTextAtTextareaCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const originalText = textarea.value;
    
    textarea.value = originalText.substring(0, start) + text + originalText.substring(end);
    textarea.focus();
    
    // Set selection cursor position after inserted content
    const newPos = start + text.length;
    textarea.setSelectionRange(newPos, newPos);
    
    // Dispatch input event to ensure form updates
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

// Utilities
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Settings Event Handlers & Live Preview
function setupSettingsEvents() {
    const btnOpenSettings = document.getElementById('btn-open-settings');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalBtn = document.getElementById('close-settings-modal');
    const btnCancelSettings = document.getElementById('btn-cancel-settings');
    const btnSaveSettings = document.getElementById('btn-save-settings');
    const btnResetSettings = document.getElementById('btn-reset-settings');
    const fontFamilySelect = document.getElementById('settings-font-family');
    const fontSizeSelect = document.getElementById('settings-font-size');
    const fontPreview = document.getElementById('settings-font-preview');

    function updateLivePreview() {
        if (!fontPreview) return;
        const font = fontFamilySelect.value || 'TH Sarabun New';
        const size = fontSizeSelect.value || '16';
        fontPreview.style.fontFamily = `'${font}', 'Sarabun', sans-serif`;
        fontPreview.style.fontSize = `${size}pt`;
    }

    function openSettingsModal() {
        fontFamilySelect.value = appSettings.fontFamily;
        fontSizeSelect.value = appSettings.fontSize;
        updateLivePreview();
        settingsModal.classList.add('active');
    }

    function closeSettingsModal() {
        settingsModal.classList.remove('active');
    }

    if (btnOpenSettings) btnOpenSettings.addEventListener('click', openSettingsModal);
    if (closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
    if (btnCancelSettings) btnCancelSettings.addEventListener('click', closeSettingsModal);

    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) closeSettingsModal();
        });
    }

    if (fontFamilySelect) fontFamilySelect.addEventListener('change', updateLivePreview);
    if (fontSizeSelect) fontSizeSelect.addEventListener('change', updateLivePreview);

    if (btnSaveSettings) {
        btnSaveSettings.addEventListener('click', () => {
            saveSettings(fontFamilySelect.value, fontSizeSelect.value);
            closeSettingsModal();
            showToast(`บันทึกการตั้งค่าฟอนต์ (${appSettings.fontFamily} ${appSettings.fontSize}pt) เรียบร้อยแล้ว`, 'success');
        });
    }

    if (btnResetSettings) {
        btnResetSettings.addEventListener('click', () => {
            fontFamilySelect.value = DEFAULT_SETTINGS.fontFamily;
            fontSizeSelect.value = DEFAULT_SETTINGS.fontSize;
            updateLivePreview();
            saveSettings(DEFAULT_SETTINGS.fontFamily, DEFAULT_SETTINGS.fontSize);
            showToast('คืนค่าฟอนต์และขนาดตัวอักษรเป็นค่าเริ่มต้นแล้ว', 'info');
        });
    }
}

function applySettingsToUI() {
    // Optionally style editor textarea with default font/size
    const editorArea = document.getElementById('template-content');
    if (editorArea) {
        editorArea.style.fontFamily = `'${appSettings.fontFamily}', 'Sarabun', sans-serif`;
    }
}

