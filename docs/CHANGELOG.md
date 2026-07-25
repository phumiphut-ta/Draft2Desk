# 📋 ประวัติการปรับปรุงระบบ (CHANGELOG)

ไฟล์นี้รวบรวมประวัติการอัปเดต การเปลี่ยนแปลง และคุณสมบัติใหม่ของระบบ **Draft2Desk - Smart Document Drafting Add-in** สำหรับ Microsoft Word ตามมาตรฐาน [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [v1.0.0] - 2026-07-25 (Initial Release - Production Ready)

### 🌟 คุณสมบัติใหม่ (Added):
- **ระบบตัวแปรปุ่มวิทยุ (Radio Button Variables - `{{opt:ชื่อคำ}}`):**
  - รองรับการสร้างตัวแปรตัวเลือกประเภท **มี / ไม่มี** ในเทมเพลตเอกสาร
  - เลือก **`🔘 มี`** ➔ แทรกลงใน Word เป็นคำว่าตามที่ระบุ (เช่น *มีเอกสารแนบ* หรือ *ด่วนที่สุด*)
  - เลือก **`⚪ ไม่มี`** ➔ ไม่ใส่คำนั้นลงไปในเอกสาร (ลบตัวแปรออกเป็นช่องว่างเปล่าอย่างสะอาด)
- **เอนจินจัดรูปแบบภาษาไทย (Thai Typography & Proofing Engine):**
  - ลบเส้นแดงเตือนสะกดผิดใน MS Word ด้วยการระบุภาษา `lang="th-TH" xml:lang="th-TH"` และ OOXML `<w:lang w:val="th-TH" w:bidi="th-TH"/>`
  - ระบบตัดคำภาษาไทยอัตโนมัติเมื่อขึ้นบรรทัดใหม่ด้วย `Intl.Segmenter('th', { granularity: 'word' })` ร่วมกับอักขระ Zero-width space (`\u200B`)
  - ป้องกันปัญหาอักขระย่อหน้ากลายเป็นอรรถประโยชน์เซมิโคลอน (Protect HTML Entities `&nbsp;`)
  - จัดระยะช่องไฟภาษาไทยให้กระจายตัวสวยงามสมดุลด้วย `text-align: justify; text-justify: inter-cluster;`
- **กล่องข้อความลอยกึ่งกลาง A4 (Half-A4 Floating Text Box):**
  - แทรกเนื้อหาลง Word ในรูปแบบ VML Floating Text Box ลอยตัว ไม่มีสีพื้นหลัง (Transparent) และไม่มีเส้นขอบ (Borderless) สามารถจับลากเคลื่อนย้ายได้อิสระ
  - กำหนดความกว้างมาตรฐานเท่ากับ **10.5 ซม. (ครึ่ง A4)** พร้อมระยะขอบซ้าย-ขวาฝั่งละ **0.5 ซม.** (`inset="0.5cm,0.2cm,0.5cm,0.2cm"`)
- **ระบบตั้งค่าฟอนต์และการสำรองข้อมูล (Font Settings & Backup/Restore):**
  - ระบบเลือกและบันทึกฟอนต์มาตรฐาน (`TH Sarabun New`, `Angsana New`, `Kanit`, `Tahoma`) และขนาดตัวอักษร (`14pt`, `16pt`, `18pt`) พร้อมกล่อง Live Preview
  - ส่งออกไฟล์สำรองข้อมูล `.json` รวมทั้งเทมเพลตทั้งหมดและการตั้งค่าฟอนต์
  - ระบบคืนค่าข้อมูล (Restore Backup) ที่ทำการล้างข้อมูลเดิมในฐานข้อมูลออกก่อนอัตโนมัติ และคืนค่าฟอนต์ให้อัตโนมัติ
- **สคริปต์ติดตั้งและถอนการติดตั้งใน 1-Click (Automated Installers & Uninstallers):**
  - สคริปต์ติดตั้งอัตโนมัติสำหรับ **macOS** (`install_mac.command`) และ **Windows** (`install_win.bat`) พร้อมระบบจัดการ Virtual environment (`.venv`) แยกส่วน
  - สคริปต์ถอนการติดตั้งปลอดภัย (`uninstall_mac.command`, `uninstall_win.bat`) ที่ลบ Manifest และหยุดเซิร์ฟเวอร์เจาะจงเฉพาะ PID บนพอร์ต 8000
- **ชุดเอกสารประกอบโครงการสมบูรณ์ (Documentation Suite):**
  - จัดเก็บเอกสารทั้งหมดไว้อย่างเป็นระเบียบในโฟลเดอร์ `docs/` (`INSTALLATION_GUIDE.md`, `USER_MANUAL.md`, `DEVELOPER_GUIDE.md`, `WORD_ADDIN_DEV_SPEC.md`)
  - เพิ่ม ER-Diagram (Mermaid ERD) และ Data Dictionary Table

### 🗑️ สิ่งที่ถูกยกเลิก (Removed):
- ยกเลิกตัวแปรประเภท Checkbox ตามคำขอของผู้ใช้งาน เพื่อสลับมาใช้ปุ่มวิทยุ (Radio Button) ที่ชัดเจนและสมบูรณ์กว่า

---

> **ผู้พัฒนา:** Phumiphut Phumisantiphong  
> **Repository:** [https://github.com/phumiphut-ta/Draft2Desk.git](https://github.com/phumiphut-ta/Draft2Desk.git)
