# 📦 คู่มือการติดตั้งระบบ Draft2Desk ฉบับสมบูรณ์ (Installation Guide)

คู่มือนี้แนะนำขั้นตอนการติดตั้งระบบ **Draft2Desk - Smart Document Drafting Add-in** สำหรับ Microsoft Word ทั้งบนระบบปฏิบัติการ **macOS** และ **Windows** พร้อมขั้นตอนการถอนการติดตั้งอย่างปลอดภัย

---

## 💻 สิ่งที่ต้องเตรียมก่อนติดตั้ง (System Requirements)

> [!IMPORTANT]
> กรุณาตรวจสอบให้แน่ใจว่าเครื่องของคุณมีโปรแกรมต่อไปนี้ครบถ้วน:
> 1. **Microsoft Word** (เวอร์ชันสำหรับ macOS หรือ Windows ที่รองรับ Office Web Add-ins)
> 2. **Python 3.9 ขึ้นไป** (ดาวน์โหลดฟรีได้จาก [python.org](https://www.python.org/downloads/))

---

## 🚀 วิธีที่ 1: การติดตั้งด้วย 1-Click Automated Installer (แนะนำสำหรับผู้ใช้ทั่วไป)

วิธีนี้เป็นวิธีที่ง่ายที่สุด สคริปต์จะทำการคัดลอก Manifest สื่อสารกับ Word สร้างสภาพแวดล้อม Python และเปิดเซิร์ฟเวอร์ให้อัตโนมัติในคลิกเดียว

---

### 🍎 สำหรับผู้ใช้งาน macOS:

1. เปิดโฟลเดอร์โปรเจกต์ **Draft2Desk**
2. ไปที่โฟลเดอร์ **`scripts/`** ➔ ดับเบิลคลิกไฟล์ **`install_mac.command`**
3. หน้าต่าง Terminal จะเปิดขึ้นมาและดำเนินการให้อัตโนมัติ:
   - คัดลอก `manifest.xml` ไปยังโฟลเดอร์ `WEF` ของ Word
   - สร้างสภาพแวดล้อม Python Isolated Virtualenv (`.venv`)
   - ติดตั้ง dependencies และเปิดเซิร์ฟเวอร์ที่ `http://127.0.0.1:8000`
4. เปิดโปรแกรม **Microsoft Word** ➔ ไปที่แถบ **แทรก (Insert)** ➔ เลือก **ส่วนเติมเต็มของฉัน (My Add-ins)** ➔ เลือก **Draft2Desk**

---

### 🪟 สำหรับผู้ใช้งาน Windows:

1. เปิดโฟลเดอร์โปรเจกต์ **Draft2Desk**
2. ไปที่โฟลเดอร์ **`scripts/`** ➔ ดับเบิลคลิกไฟล์ **`install_win.bat`**
3. สคริปต์ Command Prompt จะเปิดขึ้นมาและดำเนินงานให้อัตโนมัติ:
   - คัดลอก `manifest.xml` ไปยังโฟลเดอร์ `%APPDATA%\Microsoft\Word\AddIns`
   - **ลงทะเบียน Windows Registry (`Trusted Catalogs`) ให้อัตโนมัติ** เพื่อเปิดสิทธิ์ใช้งานใน Word โดยไม่ต้องเข้าตั้งค่าเอง
   - สร้างและเปิดใช้งาน `.venv` สภาพแวดล้อม Python
   - เริ่มต้นเซิร์ฟเวอร์ที่ `http://127.0.0.1:8000`
4. เปิด **Microsoft Word** ➔ ไปที่แถบ **แทรก (Insert)** ➔ **ส่วนเติมเต็มของฉัน (My Add-ins)** ➔ เลือกแถบ **โฟลเดอร์ที่แชร์ (Shared Folder)** ➔ คลิกเลือก **Draft2Desk**

---

## 🛠️ วิธีที่ 2: การติดตั้งและ Sideload แบบ Manual (สำหรับนักพัฒนา)

หากคุณต้องการรันผ่าน Command Line / Terminal เอง ให้ทำตามขั้นตอนดังนี้:

### ขั้นตอนที่ 1: ติดตั้ง Dependencies และเปิด Backend Server
```bash
# 1. เข้าสู่โฟลเดอร์โปรเจกต์
cd Draft2Desk

# 2. สร้างและเปิดใช้งาน Virtual Environment
python3 -m venv .venv
source .venv/bin/activate    # บน Windows ใช้: .venv\Scripts\activate

# 3. ติดตั้งไลบรารีที่จำเป็น
pip install -r backend/requirements.txt

# 4. เปิดรัน FastAPI Backend Server
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### ขั้นตอนที่ 2: Sideload Manifest เข้า Microsoft Word

#### บน macOS:
คัดลอกไฟล์ `manifest.xml` ไปไว้ในไดเรกทอรี WEF:
```bash
mkdir -p ~/Library/Containers/com.microsoft.Word/Data/Documents/wef/
cp manifest.xml ~/Library/Containers/com.microsoft.Word/Data/Documents/wef/
```

#### บน Windows:
1. ไปที่ `File (ไฟล์)` ➔ `Options (ตัวเลือก)` ➔ `Trust Center (ศูนย์ความไว้วางใจ)` ➔ `Trust Center Settings`
2. เลือก **Trusted Add-in Catalogs** ➔ ใส่พาธโฟลเดอร์ที่เก็บ `manifest.xml` ➔ ติ๊ก **Show in Menu** ➔ กด OK และรีสตาร์ท Word

---

## 🗑️ การถอนการติดตั้งอย่างปลอดภัย (Uninstallation)

หากต้องการถอนการติดตั้งแอดอินออกจาก Microsoft Word:

* **บน macOS:** ดับเบิลคลิกไฟล์ `scripts/uninstall_mac.command`
* **บน Windows:** ดับเบิลคลิกไฟล์ `scripts/uninstall_win.bat`

---

## ❓ การแก้ไขปัญหาที่พบบ่อย (Troubleshooting)

| ปัญหาที่พบ | สาเหตุ | วิธีแก้ไข |
| :--- | :--- | :--- |
| **ไม่พบเมนู Draft2Desk ใน Word** | Word ยังไม่ได้โหลด Manifest ใหม่ | ปิดโปรแกรม Word ทั้งหมดแล้วเปิดขึ้นมาใหม่ หรือตรวจสอบว่าคัดลอก `manifest.xml` ลงโฟลเดอร์ถูกต้อง |
| **ขึ้นข้อความ "Cannot connect to server"** | เซิร์ฟเวอร์ Backend ยังไม่ได้รัน | ดับเบิลคลิกสคริปต์ `install_mac.command` หรือ `install_win.bat` เพื่อเปิดรันเซิร์ฟเวอร์ |
| **ตัวอักษรภาษาไทยขีดเส้นแดงสะกดผิด** | Word กำหนดภาษาตรวจคำผิดเป็น English | ระบบอัปเดตแท็ก `lang="th-TH"` ให้อัตโนมัติแล้ว หากยังพบให้รีเฟรช Taskpane ใน Word |
