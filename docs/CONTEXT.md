# 🧠 บริบทโครงการและภาพรวมสถาปัตยกรรม (Project Context)

เอกสารนี้รวบรวมบริบทของโครงการ (Project Context) สำหรับผู้พัฒนาและ AI Coding Assistant เพื่อให้เข้าใจถึงเป้าหมาย สถาปัตยกรรม ข้อกำหนดทางเทคนิค และพฤติกรรมหลักของระบบ **Draft2Desk** อย่างครบถ้วน

---

## 📌 1. ภาพรวมโครงการและพันธกิจ (Project Identity & Mission)

* **ชื่อโครงการ:** Draft2Desk (Smart Document Drafting Word Web Add-in)
* **ผู้ใช้งานหลัก:** เจ้าหน้าที่งานสารบรรณ, นิติกร, ฝ่ายกฎหมาย, เลขานุการผู้บริหาร และเจ้าหน้าที่ธุรการจัดทำเอกสารหนังสือราชการ
* **เป้าหมายหลัก:** เพิ่มความเร็วและลดข้อผิดพลาดในการร่างเอกสารหนังสือราชการและเอกสารสัญญาใน Microsoft Word โดยสามารถเลือกเทมเพลตมาตรฐาน เติมคำในช่องว่างด้วยตัวแปร (ข้อความทั่วไป และ ปุ่มวิทยุเลือก มี/ไม่มี) แล้วแทรกลงใน Word ณ ตำแหน่งเคอร์เซอร์ได้ทันทีในรูปแบบกล่องข้อความลอยกึ่งกลาง A4 (Half-A4 Floating Textbox)

---

## 🛠️ 2. เทคโนโลยีที่ใช้ (Technology Stack)

```text
+-------------------------------------------------------------------------+
|                              Draft2Desk Stack                           |
+-------------------------------------------------------------------------+
|  Frontend : Vanilla HTML5, Custom Dark-Mode CSS (Glassmorphism), JS    |
|  Office   : Office.js SDK, OOXML / VML Generator, Manifest V1.1        |
|  Backend  : Python 3.9+, FastAPI, Uvicorn, Pydantic                     |
|  Database : SQLite3 (draft2desk.db)                                     |
|  Install  : Shell / Batch 1-Click Installers with Windows Registry Reg   |
+-------------------------------------------------------------------------+
```

---

## 📐 3. กฎและพฤติกรรมหลักของระบบ (Key Technical Invariants)

1. **ระบบจัดรูปแบบและตัดคำภาษาไทย (Thai Typography & Proofing Engine):**
   - ใช้ฟอนต์มาตรฐาน `TH Sarabun New` ขนาด `16pt` ระยะบรรทัด `line-height: 1.6`
   - จัดกระจายช่องไฟอย่างสมดุลด้วย `text-align: justify; text-justify: inter-cluster;`
   - ป้องกันเส้นแดงเตือนสะกดผิดด้วยแท็กภาษา `lang="th-TH" xml:lang="th-TH"` และ OOXML `<w:lang w:val="th-TH" w:bidi="th-TH"/>`
   - ตัดคำภาษาไทยอัตโนมัติด้วย `Intl.Segmenter('th', { granularity: 'word' })` แทรก `\u200B` (Zero-width space) โดย **ปกป้อง HTML Entities (`&nbsp;`)** ไม่ให้กลายเป็นเซมิโคลอนส่วนเกิน

2. **กล่องข้อความลอยความกว้างครึ่ง A4 (Half-A4 Floating Textbox):**
   - ข้อความถูกแทรกลง Word ในรูปแบบ VML Floating Textbox ลอยตัว โปร่งใส (Transparent) ไร้กรอบ (Borderless)
   - ความกว้างคงที่ **10.5 ซม. (ครึ่ง A4)** พร้อมขอบซ้าย-ขวา **0.5 ซม.** (`inset="0.5cm,0.2cm,0.5cm,0.2cm"`)

3. **ตัวแปรแบบปุ่มวิทยุ (Radio Button Variables - `{{opt:ชื่อคำ}}`):**
   - ตัวแปรประเภทตัวเลือก **มี / ไม่มี**
   - เลือก **`🔘 มี`** ➔ แทรกลงใน Word เป็นคำว่า `ชื่อคำ`
   - เลือก **`⚪ ไม่มี`** ➔ ไม่ใส่คำนั้นลงไปในเอกสาร (ลบตัวแปรออกเป็นช่องว่างเปล่า `""`)

4. **การสำรองและคืนค่าข้อมูล (Backup & Restore Invariants):**
   - ไฟล์สำรองข้อมูล `.json` บรรจุทั้ง `templates` และ `settings` (`fontFamily` & `fontSize`)
   - เมื่อทำการคืนค่าข้อมูล (Restore) ระบบจะทำการ **ล้างข้อมูลเดิมในฐานข้อมูลออกก่อน (`DELETE /api/v1/templates`)** เพื่อป้องกันข้อมูลซ้ำซ้อน

5. **สคริปต์ติดตั้งและลงทะเบียนอัตโนมัติ (Automated Installers):**
   - สคริปต์ `install_mac.command` และ `install_win.bat` สร้างและรันภายใต้ `.venv` เสมอ
   - สคริปต์บน Windows ลงทะเบียน `Trusted Catalogs` ใน Windows Registry ให้อัตโนมัติ (`HKCU\Software\Microsoft\Office\16.0\Word\Security\Trusted Catalogs\Draft2Desk`)

---

## 📂 4. ผังโครงสร้างไฟล์และบทบาท (Directory Mapping)

* **`manifest.xml`**: ไฟล์ลงทะเบียนแอดอินกับ Microsoft Word (แท็บ Home, กลุ่ม Draft2Desk, ไอคอน 16/32/80px)
* **`backend/`**:
  - `main.py`: จุดเริ่มต้น FastAPI Server & Static Files Serving
  - `database.py`: เชื่อมต่อ SQLite, โครงสร้างตาราง `templates`, seeds และ CRUD functions
  - `models.py`: Pydantic Models & Dynamic Regex Parser (`{{var}}` และ `{{opt:var}}`)
  - `routers/templates.py`: REST API Endpoints (`GET`, `POST`, `PUT`, `DELETE`)
* **`frontend/`**:
  - `index.html`: หน้าต่าง Taskpane UI หลัก
  - `css/style.css`: สไตล์ชีตระบบ Dark Mode (Glassmorphism & Neon Glow Tokens)
  - `js/app.js`: ตัวควบคุม UI, ตัวแปร Radio, การตั้งค่าฟอนต์ และ Export/Import
  - `js/office-helper.js`: Office.js SDK Integration, OOXML VML Generator, Thai Segmenter
* **`docs/`**:
  - `context.md`: เอกสารบริบทโครงการฉบับนี้
  - `INSTALLATION_GUIDE.md`: คู่มือการติดตั้งพร้อมวิดีโอสาธิต
  - `USER_MANUAL.md`: คู่มือการใช้งานสำหรับผู้ใช้ทั่วไป
  - `DEVELOPER_GUIDE.md`: คู่มือนักพัฒนา, ER-Diagram & Data Dictionary
  - `WORD_ADDIN_DEV_SPEC.md`: เอกสารข้อกำหนดระบบ (Dev Spec)
  - `CHANGELOG.md`: ประวัติการอัปเดตระบบ
* **`scripts/`**:
  - `install_mac.command` / `install_win.bat`: สคริปต์ติดตั้ง 1-Click
  - `uninstall_mac.command` / `uninstall_win.bat`: สคริปต์ถอนการติดตั้ง

---

## 🚀 5. คำสั่งและขั้นตอนการพัฒนาที่สำคัญ (Key Commands)

```bash
# 1. การเปิดรัน Backend Server
source .venv/bin/activate
uvicorn backend.main:app --host 127.0.0.1 --port 8000

# 2. การสอบทานไวยากรณ์ภาษา Python
python3 -m py_compile backend/routers/templates.py backend/database.py backend/main.py

# 3. การทดสอบ REST API endpoints
curl http://127.0.0.1:8000/api/v1/templates
```
