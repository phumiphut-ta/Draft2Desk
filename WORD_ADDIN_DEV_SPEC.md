# Word Web Add-in: Template Manager & Document Drafting Tool
## เอกสารข้อกำหนดโครงการสำหรับการพัฒนาต่อใน Antigravity / AI Coding Assistant

---

## 1. ภาพรวมโครงการ (Project Overview)
โครงการนี้เป็นการพัฒนา **Microsoft Word Web Add-in** ร่วมกับ **Python Web API (Backend)** เพื่อเพิ่มประสิทธิภาพการจัดทำเอกสารและ "การตั้งแท่นเอกสาร" ใน Microsoft 365 ทั้งบน **Windows และ macOS**

### ความสามารถหลัก (Key Features)
1. **Template Management:** สร้าง, บันทึก, แก้ไข, ลบ และจัดหมวดหมู่ Template บันทึกข้อความ/เอกสาร
2. **Cursor-Based Insertion:** เลือก Template แล้วกดปุ่ม Action เพื่อแทรกเนื้อหาลงในเอกสาร Word ณ ตำแหน่งที่เคอร์เซอร์กะพริบอยู่ทันที
3. **Rich Text & Formatting Support:** รองรับรูปแบบข้อความสมบูรณ์ (ตัวหนา, ตัวเอียง, สี, หัวข้อ, ตาราง, รายการแบบ Bullet/Numbering)
4. **Dynamic Variables / Placeholders:** รองรับการแทนที่ตัวแปรใน Template (เช่น `{{เลขที่หนังสือ}}`, `{{วันที่}}`, `{{เรื่อง}}`) ก่อนแทรกลงเอกสาร
5. **Cross-Platform:** ทำงานได้สมบูรณ์ทั้งบน Word สำหรับ Windows, macOS และ Word on the Web

---

## 2. สถาปัตยกรรมระบบ (System Architecture)

```
+-----------------------------------------------------------------------+
|                        Microsoft Word (Desktop / Web)                  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | Taskpane Panel (WebView2 / WebKit)                              |  |
|  |  - Frontend UI (HTML5, Tailwind CSS / Vanilla JS)               |  |
|  |  - Office.js SDK                                                |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------||----------------------------------+
                                    || REST API (JSON)
                                    \/
+-----------------------------------------------------------------------+
|                        Python Backend API Server                      |
|  - Framework: FastAPI / Flask                                         |
|  - Storage: LocalStorage / SQLite / MySQL / PostgreSQL                |
|  - Features: Template CRUD, Variables Parsing, User Preferences       |
+-----------------------------------------------------------------------+
```

---

## 3. โครงสร้างโปรเจกต์ (Project Structure)

```text
word-template-addin/
├── manifest.xml                 # ไฟล์ลงทะเบียน Add-in สำหรับ Microsoft Word
├── frontend/                    # ส่วน UI ของ Taskpane
│   ├── index.html               # หน้าหลัก Taskpane UI
│   ├── css/
│   │   └── style.css            # Style หลัก หรือใช้ Tailwind CSS CDN
│   ├── js/
│   │   ├── app.js               # Logic ควบคุม UI & เรียก Office.js
│   │   └── office-helper.js     # Helper function สำหรับจัดการ Word Document
│   └── assets/                  # ไอคอน (icon-16.png, icon-32.png, icon-80.png)
├── backend/                     # ส่วน Python Service
│   ├── main.py                  # FastAPI Application Entrypoint
│   ├── models.py                # Database / Pydantic Models
│   ├── database.py              # DB Connection setup
│   ├── routers/
│   │   └── templates.py         # API Endpoints สำหรับ Templates
│   └── requirements.txt         # Python Dependencies
└── docs/
    └── WORD_ADDIN_DEV_SPEC.md   # เอกสารข้อกำหนดระบบ
```

---

## 4. ข้อกำหนดทางเทคนิค (Technical Specifications)

### 4.1 Frontend Requirements
* **SDK:** `https://appsforoffice.microsoft.com/lib/1/hosted/office.js`
* **API Set:** WordApi 1.3 ขึ้นไป (เพื่อรองรับ `insertHtml`, `insertText`, `getSelection`)
* **Core Functions:**
  1. `Office.onReady()` Initialization
  2. `insertTemplateToDocument(htmlContent, placeholders)`:
     ```javascript
     async function insertTemplateToDocument(htmlContent) {
         await Word.run(async (context) => {
             const selection = context.document.getSelection();
             selection.insertHtml(htmlContent, Word.InsertLocation.replace);
             await context.sync();
         });
     }
     ```

### 4.2 Backend Requirements (Python API)
* **Framework:** FastAPI
* **CORS Middleware:** ต้องเปิดอนุญาตให้ Origin ของ Add-in เข้าถึงได้
* **Dependencies:** `fastapi`, `uvicorn`, `pydantic`, `sqlite3` หรือ `peewee` / `sqlalchemy`

---

## 5. รายละเอียด API Endpoints

### 1) Get All Templates
* **GET** `/api/v1/templates`
* **Response:**
  ```json
  [
    {
      "id": "tpl_01",
      "title": "บันทึกเสนอขออนุมัติหลักการ",
      "category": "งานสารบรรณ",
      "content_html": "<b>เรื่อง:</b> ขออนุมัติดำเนินโครงการ...<br><b>เรียน:</b> ...",
      "variables": ["โครงการ", "เรียน"]
    }
  ]
  ```

### 2) Create Template
* **POST** `/api/v1/templates`
* **Request Body:**
  ```json
  {
    "title": "ร่างคำสั่งมอบหมายงาน",
    "category": "งานบุคคล",
    "content_html": "<p>คำสั่ง... ที่ {{เลขที่คำสั่ง}}</p>"
  }
  ```

### 3) Delete Template
* **DELETE** `/api/v1/templates/{template_id}`

---

## 6. ขั้นตอนการติดตั้งทดสอบ (Sideloading Guide)

### บน Windows:
1. แชร์โฟลเดอร์โปรเจกต์ที่มี `manifest.xml` แบบ Shared Folder (`\\localhost\AddInManifests`)
2. เปิด Word -> **File** > **Options** > **Trust Center** > **Trust Center Settings** > **Trusted Add-in Catalogs**
3. ใส่ Network Path ของ Shared Folder แล้วกดยืนยัน
4. ไปที่แท็บ **Insert** > **My Add-ins** > **Shared Folder**

### บน macOS:
1. คัดลอก `manifest.xml` ไปไว้ในโฟลเดอร์:
   `~/Library/Containers/com.microsoft.Word/Data/Documents/wef/`
2. เปิด Word บน macOS -> ไปที่ **Insert** > **My Add-ins** จะพบ Add-in แสดงขึ้นมา

---

## 7. Roadmap / Tasks สำหรับพัฒนาต่อด้วย AI

- [ ] **Phase 1: Basic MVP**
  - [ ] สร้างไฟล์ `manifest.xml` และรัน `index.html` บน Localhost Web Server (เช่น Python `http.server` หรือ Live Server)
  - [ ] ทดสอบแทรกข้อความ HTML พื้นฐานลง Word ตรงจุด Cursor
- [ ] **Phase 2: Template CRUD & Local Storage / API**
  - [ ] ทำ UI เลือก/เพิ่ม/แก้ไข Template
  - [ ] ต่อ Backend Python FastAPI เพื่อบันทึก Template ลง Database
- [ ] **Phase 3: Variable Filling / Placeholders (Advanced)**
  - [ ] เมื่อเลือก Template หากมี `{{variable}}` ให้แสดงฟอร์มกรอกค่าก่อนกดแทรกลง Word
- [ ] **Phase 4: UI Refinement & Formatting Polish**
  - [ ] ตกแต่ง UI ด้วย Tailwind CSS / Office Fluent UI Design System
  - [ ] รองรับการดึง Style/Font ของเอกสารปัจจุบัน

