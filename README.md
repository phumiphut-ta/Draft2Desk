# Draft2Desk - Smart Document Drafting Word Web Add-in

**Draft2Desk** คือ Microsoft Word Web Add-in และระบบบริหารจัดการเทมเพลตร่างเอกสารราชการ/องค์กรแบบสมาร์ท ช่วยให้ผู้ใช้งานเลือกเทมเพลตร่าง กรอกตัวแปรเฉพาะจุด และแทรกลงในเอกสาร Word ได้ทันทีในรูปแบบ **กล่องข้อความลอย (Floating Text Box) ที่โปร่งใส ไม่มีเส้นขอบ** สามารถลากขยับปรับตำแหน่งได้อย่างอิสระ

---

## 🌟 คุณสมบัติเด่น (Key Features)

1. **Floating Transparent Text Box Insertion (DrawingML / VML)**:
   - แทรกลง Word ในลักษณะกล่องข้อความลอยตัว (Floating Shape) ที่โปร่งใสไร้สีพื้นหลัง (`filled="f"`) และไร้เส้นขอบ (`stroked="f"`)
   - ย่อขยายความสูงพอดีกับเนื้อหาอัตโนมัติ (`mso-fit-shape-to-text:t`)
   - รองรับการลากย้ายตำแหน่งอิสระบนหน้ากระดาษ Word
2. **Dynamic Variables Parser**:
   - ตรวจจับตัวแปรในวงเล็บปีกกาคู่ `{{ชื่อตัวแปร}}` ในเนื้อหาเทมเพลตอัตโนมัติ
   - สร้างฟิลด์กรอกข้อมูลให้ผู้ใช้พิมพ์ก่อนแทรกลง Word
3. **Rich Text Formatting Toolbar**:
   - แถบเครื่องมือช่วยจัดรูปแบบเนื้อหาครบครัน: ตัวหนา (`<b>`), ตัวเอียง (`<i>`), ขีดเส้นใต้ (`<u>`), ย่อหน้า/เว้นระยะ (`&nbsp;` / `indent`), หัวข้อเรื่อง, รายการสัญลักษณ์, และตาราง
4. **Font Family & Font Size Configuration**:
   - มีระบบตั้งค่าฟอนต์หลัก (เช่น `TH Sarabun New`, `Angsana New`, `Kanit`, `Tahoma`) และขนาดตัวอักษรมาตรฐาน (เช่น `16pt`)
   - บันทึกค่าลง `localStorage` และสร้างแท็ก OOXML (`<w:rFonts>`, `<w:sz>`) กำหนดรูปแบบให้อย่างถูกต้อง
5. **Modern Dark Theme UI & Browser Preview**:
   - หน้าตา UI สวยงามตามสไตล์ Glassmorphism และโทนสีนีออนม่วง-ฟ้า
   - มีโหมดพรีวิวจำลองผลลัพธ์ (Mock Preview) เมื่อรันนอก MS Word
6. **One-Click Automated Installers**:
   - สคริปต์ติดตั้งอัตโนมัติในคลิกเดียวสำหรับทั้ง **macOS** และ **Windows**

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
Draft2Desk/
├── backend/
│   ├── database.py         # SQLite connection & schema initialization
│   ├── main.py             # FastAPI app & static file router
│   ├── models.py           # Pydantic schemas & Regex variable parser
│   ├── requirements.txt    # Python dependencies
│   └── routers/
│       └── templates.py    # REST CRUD endpoints
├── frontend/
│   ├── assets/             # Branding icons (16px, 32px, 80px)
│   ├── css/
│   │   └── style.css       # Premium Dark Theme stylesheet
│   ├── js/
│   │   ├── app.js          # Core app controller, UI modals, & settings
│   │   └── office-helper.js# Office.js SDK, OOXML generator, & Mock preview
│   └── index.html          # Main Taskpane interface
├── scripts/
│   ├── install_mac.command # macOS 1-click installer
│   ├── install_win.bat     # Windows 1-click installer
│   └── build_exe.py        # PyInstaller packaging script
├── manifest.xml            # Office Add-in manifest configuration
├── README.md               # Overview & quick start guide
├── USER_MANUAL.md          # User operation manual (Thai)
└── DEVELOPER_GUIDE.md      # Technical architecture & API reference
```

---

## 🚀 การติดตั้งและใช้งาน (Quick Start)

### วิธีที่ 1: การติดตั้งด้วย 1-Click Installer (แนะนำ)

#### สำหรับ macOS:
ดับเบิลคลิกไฟล์:
```bash
scripts/install_mac.command
```

#### สำหรับ Windows:
ดับเบิลคลิกไฟล์:
```bash
scripts/install_win.bat
```

---

### 🗑️ การถอนการติดตั้ง (Uninstallation)

หากต้องการถอนการติดตั้ง Add-in ออกจาก Microsoft Word:

* **บน macOS:** ดับเบิลคลิกไฟล์ `scripts/uninstall_mac.command`
* **บน Windows:** ดับเบิลคลิกไฟล์ `scripts/uninstall_win.bat`

*สคริปต์จะลบไฟล์ `manifest.xml` ออกจากโฟลเดอร์ของ Word และปิดเซิร์ฟเวอร์หลังบ้านให้อัตโนมัติ*

---

### วิธีที่ 2: การติดตั้งแบบ Manual (สำหรับนักพัฒนา)

1. **เตรียม Environment และติดตั้ง Dependencies**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate    # บน Windows ใช้: .venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```

2. **เปิดใช้งาน Backend Server**:
   ```bash
   uvicorn backend.main:app --host 127.0.0.1 --port 8000
   ```
   *หน้าจอแอดอินจะพร้อมใช้งานที่ `http://127.0.0.1:8000`*

3. **ติดตั้ง Add-in ใน Microsoft Word (Sideloading)**:
   * **macOS**: คัดลอก `manifest.xml` ไปยัง `~/Library/Containers/com.microsoft.Word/Data/Documents/wef/`
   * **Windows**: เปิด Word -> File -> Options -> Trust Center -> Trusted Add-in Catalogs -> ระบุพาทโฟลเดอร์ที่เก็บ `manifest.xml`

---

## 📚 เอกสารประกอบเพิ่มเติม (Documentation)

- 📖 [USER_MANUAL.md](USER_MANUAL.md): คู่มือการใช้งานสำหรับผู้ใช้ทั่วไป
- 🛠️ [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md): คู่มือสำหรับนักพัฒนา โครงสร้าง API และ OOXML Specification
- 📋 [WORD_ADDIN_DEV_SPEC.md](WORD_ADDIN_DEV_SPEC.md): เอกสารข้อกำหนดระบบ (Dev Spec)
