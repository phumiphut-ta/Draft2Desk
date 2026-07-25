/**
 * Office.js Helper Integration for Draft2Desk
 */

let isOfficeInitialized = false;

// Initialize Office.js
Office.onReady((info) => {
    const statusDot = document.getElementById("office-status-dot");
    const statusText = document.getElementById("office-status-text");

    if (info.host === Office.HostType.Word) {
        // Running inside Microsoft Word
        isOfficeInitialized = true;
        
        statusDot.className = "status-dot success";
        statusText.textContent = "Word Connected";
        console.log("Office.js is initialized inside Microsoft Word.");
    } else {
        // Running in a standalone web browser (Preview Mode)
        isOfficeInitialized = false;
        
        statusDot.className = "status-dot warning";
        statusText.textContent = "Browser Preview";
        console.log("Office.js is not loaded on Word host. Operating in Browser Preview Mode.");
        
        showToast("โหมดพรีวิว: รันภายนอก MS Word คุณสามารถกดทดสอบได้โดยจำลองการทำงาน", "info");
    }
});

/**
 * Helper to ensure the input content is HTML formatted.
 * Converts raw text newlines to <br> and spaces/tabs to &nbsp; where appropriate.
 */
function ensureHtmlFormat(content) {
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);
    if (!hasHtmlTags) {
        return content
            .split(/\n/)
            .map(line => {
                const leadingSpaces = line.match(/^([ \t]+)/);
                let text = line;
                if (leadingSpaces) {
                    const spaceCount = leadingSpaces[1].replace(/\t/g, '    ').length;
                    const nbsps = '&nbsp;'.repeat(spaceCount * 2);
                    text = nbsps + line.substring(leadingSpaces[1].length);
                }
                return text;
            })
            .join('<br>');
    }
    
    // For HTML, clean up raw newlines (\n) to <br> but avoid duplicate line breaks
    let formatted = content.replace(/\r\n/g, '\n').replace(/\n/g, '<br>');
    formatted = formatted
        .replace(/(<br\s*\/?>)+/gi, '<br>')
        .replace(/(<\/h[1-6]>|<ol>|<\/ol>|<ul>|<\/ul>|<li>|<\/li>|<tr>|<table>|<\/table>|<\/p>|<hr\s*\/?>)<br>/gi, '$1')
        .replace(/<br>(<h[1-6]>|<ol>|<ul>|<li>|<tr>|<table>|<\/tr>|<\/table>|<p\b|<hr\s*\/?>)/gi, '$1');
        
    formatted = formatted.replace(/(^|<br>)([ \t]+)/g, (match, p1, p2) => {
        const spaceCount = p2.replace(/\t/g, '    ').length;
        return p1 + '&nbsp;'.repeat(spaceCount * 2);
    });
    
    return formatted;
}

/**
 * Converts rich HTML content to WordprocessingML paragraphs (<w:p>) using browser DOM parser.
 */
function convertHtmlToOoxml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;
    
    let ooxmlParagraphs = [];
    let currentRuns = [];
    
    function escapeXml(unsafe) {
        if (!unsafe) return '';
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }
    
    // Read active font family & size settings
    const settings = (typeof getAppSettings === 'function') ? getAppSettings() : { fontFamily: 'TH Sarabun New', fontSize: 16 };
    const fontFamily = settings.fontFamily || 'TH Sarabun New';
    const fontSizeHalfPt = Math.round((parseFloat(settings.fontSize) || 16) * 2);

    function traverse(node, state = { bold: false, italic: false, underline: false, indent: 0 }) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue;
            if (text) {
                let runPr = `<w:rFonts w:ascii="${fontFamily}" w:hAnsi="${fontFamily}" w:eastAsia="${fontFamily}" w:cs="${fontFamily}"/><w:sz w:val="${fontSizeHalfPt}"/><w:szCs w:val="${fontSizeHalfPt}"/><w:lang w:val="th-TH" w:bidi="th-TH"/>`;
                if (state.bold) runPr += '<w:b/><w:bCs/>';
                if (state.italic) runPr += '<w:i/><w:iCs/>';
                if (state.underline) runPr += '<w:u w:val="single"/>';
                
                const rPrBlock = `<w:rPr>${runPr}</w:rPr>`;
                currentRuns.push(`<w:r>${rPrBlock}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            const newState = { ...state };
            
            if (tagName === 'b' || tagName === 'strong') {
                newState.bold = true;
            } else if (tagName === 'i' || tagName === 'em') {
                newState.italic = true;
            } else if (tagName === 'u') {
                newState.underline = true;
            }

            // Parse margin-left style for indent (e.g. style="margin-left:2em;")
            if (node.style && node.style.marginLeft) {
                const ml = parseFloat(node.style.marginLeft);
                if (!isNaN(ml) && ml > 0) {
                    // 1em ≈ 720 twips (approximate for Word)
                    newState.indent = Math.round(ml * 720);
                }
            }
            
            const isBlock = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr'].includes(tagName);
            
            if (isBlock || tagName === 'br') {
                if (currentRuns.length > 0) {
                    commitParagraph(state.indent);
                }
                if (tagName === 'li') {
                    newState.indent = 720; // 0.5 inch in twips
                }
            }
            
            for (let child of node.childNodes) {
                traverse(child, newState);
            }
            
            if (isBlock) {
                commitParagraph(newState.indent);
            }
        }
    }
    
    function commitParagraph(indent) {
        if (currentRuns.length > 0) {
            let pPr = '';
            if (indent > 0) {
                pPr = `<w:pPr><w:ind w:left="${indent}"/></w:pPr>`;
            }
            ooxmlParagraphs.push(`<w:p>${pPr}${currentRuns.join('')}</w:p>`);
            currentRuns = [];
        } else {
            ooxmlParagraphs.push('<w:p/>');
        }
    }
    
    for (let child of body.childNodes) {
        traverse(child);
    }
    commitParagraph(0);
    
    while (ooxmlParagraphs.length > 1 && ooxmlParagraphs[ooxmlParagraphs.length - 1] === '<w:p/>') {
        ooxmlParagraphs.pop();
    }
    
    return ooxmlParagraphs.join('');
}

/**
 * Creates OOXML markup representing a floating, transparent, borderless Text Box with auto-fitting height.
 * Wraps it in a Flat OPC Package to comply with Word's strict schema verification for insertOoxml.
 */
function createFloatingTextBoxOoxml(htmlContent) {
    const cleanHtml = ensureHtmlFormat(htmlContent);
    const paragraphsOoxml = convertHtmlToOoxml(cleanHtml);
    
    // Construct a complete Flat OPC Package enclosing a transparent and borderless VML shape
    const ooxml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">
  <pkg:part pkg:name="/_rels/.rels" pkg:contentType="application/vnd.openxmlformats-package.relationships+xml" pkg:padding="512">
    <pkg:xmlData>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
      </Relationships>
    </pkg:xmlData>
  </pkg:part>
  <pkg:part pkg:name="/word/document.xml" pkg:contentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml">
    <pkg:xmlData>
      <w:document 
        xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
        xmlns:v="urn:schemas-microsoft-com:vml"
        xmlns:o="urn:schemas-microsoft-com:office:office">
        <w:body>
          <w:p>
            <w:r>
              <w:pict>
                <!-- VML Shape: position:absolute (floats), filled="f" (transparent), stroked="f" (no border) -->
                <v:rect style="position:absolute;margin-left:0pt;margin-top:0pt;width:400pt;height:250pt;z-index:251659264;v-text-anchor:top" filled="f" stroked="f">
                  <v:textbox style="mso-fit-shape-to-text:t;">
                    <w:txbxContent>
                      ${paragraphsOoxml}
                    </w:txbxContent>
                  </v:textbox>
                </v:rect>
              </w:pict>
            </w:r>
          </w:p>
        </w:body>
      </w:document>
    </pkg:xmlData>
  </pkg:part>
</pkg:package>`;
    return ooxml;
}

/**
 * Inserts content into the Microsoft Word Document inside a floating, transparent, borderless Text Box.
 * @param {string} htmlContent - The rich HTML content to insert
 * @returns {Promise<boolean>} - Promise resolving to true if inserted, false otherwise
 */
async function insertHtmlToWord(htmlContent) {
    const settings = (typeof getAppSettings === 'function') ? getAppSettings() : { fontFamily: 'TH Sarabun New', fontSize: 16 };
    const cleanHtml = ensureHtmlFormat(htmlContent);

    if (isOfficeInitialized) {
        try {
            // Generate valid DrawingML OOXML for a transparent borderless text box shape
            const ooxml = createFloatingTextBoxOoxml(htmlContent);

            await Word.run(async (context) => {
                const selection = context.document.getSelection();
                try {
                    selection.insertOoxml(ooxml, Word.InsertLocation.replace);
                    await context.sync();
                } catch (ooxmlErr) {
                    console.warn("insertOoxml failed, fallback to insertHtml:", ooxmlErr);
                    const fullHtml = `<div lang="th-TH" xml:lang="th-TH" spellcheck="false" style="font-family: '${settings.fontFamily}', 'TH Sarabun New', 'Angsana New', sans-serif; font-size: ${settings.fontSize}pt; text-align: justify; text-justify: inter-cluster; line-height: 1.6;">${cleanHtml}</div>`;
                    selection.insertHtml(fullHtml, Word.InsertLocation.replace);
                    await context.sync();
                }
            });
            showToast("แทรกกล่องข้อความเรียบร้อยแล้ว!", "success");
            return true;
        } catch (error) {
            console.error("Error inserting into Word:", error);
            showToast(`เกิดข้อผิดพลาดในการแทรกเนื้อหา: ${error.message || 'GeneralException'}`, "error");
            return false;
        }
    } else {
        // Fallback for standalone browser testing
        console.log("%c[Draft2Desk Fallback] Generated OOXML:", "color: #8b5cf6; font-weight: bold;");
        const ooxml = createFloatingTextBoxOoxml(htmlContent);
        console.log(ooxml);
        
        // Show visual mock text box in HTML
        const cleanHtml = ensureHtmlFormat(htmlContent);
        const mockPreviewHtml = `
            <div style="border: 2px dashed #8b5cf6; padding: 16px; border-radius: 6px; background: transparent; position: relative; margin: 15px 0; color: #1f2937;">
                <span style="position: absolute; top: -10px; left: 10px; background: #8b5cf6; color: white; font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-family: sans-serif; text-transform: uppercase;">
                    Floating Text Box (Transparent & Borderless in Word)
                </span>
                <div style="font-family: 'Sarabun', sans-serif; font-size: 15px; line-height: 1.6; color: #1f2937; margin-top: 5px;">
                    ${cleanHtml}
                </div>
            </div>
        `;
        showMockPreview(mockPreviewHtml);
        showToast("จำลอง: แทรกกล่องข้อความลอยเรียบร้อย (ดูพรีวิวและรหัส OOXML ใน Console)", "success");
        return true;
    }
}

/**
 * Creates a mock preview overlay of the HTML content being inserted
 * @param {string} htmlContent - The HTML content to preview
 */
function showMockPreview(htmlContent) {
    // Remove existing preview if any
    const existing = document.getElementById("mock-preview-modal");
    if (existing) existing.remove();

    const settings = (typeof getAppSettings === 'function') ? getAppSettings() : { fontFamily: 'TH Sarabun New', fontSize: 16 };

    const overlay = document.createElement("div");
    overlay.id = "mock-preview-modal";
    overlay.className = "modal-overlay active";
    overlay.style.zIndex = "200";

    overlay.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3><i class="fa-solid fa-desktop text-accent"></i> หน้าต่างจำลองผลลัพธ์ (Preview)</h3>
                <button class="close-modal-btn" id="close-preview-modal">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="modal-body" style="background: white; color: black; font-family: '${settings.fontFamily}', 'Sarabun', sans-serif; font-size: ${settings.fontSize}pt; padding: 24px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; max-height: 50vh;">
                ${htmlContent}
            </div>
            <div class="modal-footer">
                <span style="font-size: 0.72rem; color: var(--text-muted); margin-right: auto; align-self: center;">
                    * ข้อความนี้จะถูกแทรกลง Word ณ จุดเคอร์เซอร์
                </span>
                <button type="button" id="btn-close-preview" class="btn btn-primary">ปิด</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector("#close-preview-modal");
    const closeBtn2 = overlay.querySelector("#btn-close-preview");

    const dismiss = () => {
        overlay.classList.remove("active");
        setTimeout(() => overlay.remove(), 300);
    };

    closeBtn.addEventListener("click", dismiss);
    closeBtn2.addEventListener("click", dismiss);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) dismiss();
    });
}

/**
 * Displays a toast notification in the UI
 * @param {string} message - Message text
 * @param {'success'|'info'|'error'} type - Notification type
 */
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let iconClass = "fa-circle-check";
    if (type === "info") iconClass = "fa-circle-info";
    if (type === "error") iconClass = "fa-triangle-exclamation";

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove from DOM after animation completes
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
