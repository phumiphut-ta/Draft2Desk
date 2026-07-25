import sqlite3
import os
import uuid

DB_PATH = os.path.join(os.path.dirname(__file__), "draft2desk.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create templates table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        content_html TEXT NOT NULL
    )
    """)
    
    # Check if table is empty to insert seeds
    cursor.execute("SELECT COUNT(*) FROM templates")
    if cursor.fetchone()[0] == 0:
        # Seed templates
        seeds = [
            (
                "tpl_01",
                "บันทึกเสนอขออนุมัติหลักการ",
                "งานสารบรรณ",
                """<p><b>ส่วนราชการ:</b> {{หน่วยงาน}} โทร. {{เบอร์โทร}}</p>
<p><b>ที่:</b> {{เลขที่หนังสือ}} &nbsp;&nbsp;&nbsp;&nbsp;<b>วันที่:</b> {{วันที่}}</p>
<p><b>เรื่อง:</b> ขออนุมัติดำเนินโครงการ {{ชื่อโครงการ}}</p>
<hr>
<p><b>เรียน:</b> {{เรียน}}</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ด้วย {{หน่วยงาน}} มีความประสงค์จะดำเนินโครงการ {{ชื่อโครงการ}} โดยมีวัตถุประสงค์เพื่อ {{วัตถุประสงค์}} ในระหว่างวันที่ {{วันที่จัดงาน}} ณ {{สถานที่จัดงาน}} วงเงินงบประมาณทั้งสิ้น {{งบประมาณ}} บาท ({{งบประมาณตัวอักษร}})</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ดังนั้น เพื่อให้การดำเนินงานเป็นไปด้วยความเรียบร้อยและบรรลุวัตถุประสงค์ จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติหลักการดำเนินโครงการดังกล่าว</p>
<br>
<p style="text-align: right;">(ลงชื่อ)...........................................</p>
<p style="text-align: right;">({{ผู้เสนออนุมัติ}})</p>
<p style="text-align: right;">ตำแหน่ง {{ตำแหน่ง}}</p>"""
            ),
            (
                "tpl_02",
                "คำสั่งแต่งตั้งคณะทำงาน",
                "งานบุคคล",
                """<h3 style="text-align: center;">คำสั่ง {{หน่วยงาน}}</h3>
<h3 style="text-align: center;">ที่ {{เลขที่คำสั่ง}}/{{ปี พ.ศ.}}</h3>
<h4 style="text-align: center;">เรื่อง แต่งตั้งคณะทำงาน {{ชื่อคณะทำงาน}}</h4>
<hr>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ด้วย {{หน่วยงาน}} จะดำเนินการ {{ภารกิจ}} เพื่อให้การดำเนินงานดังกล่าวสำเร็จลุล่วงอย่างมีประสิทธิภาพ อาศัยอำนาจตามความใน {{กฎหมาย/ระเบียบ}} จึงแต่งตั้งคณะทำงานโดยมีองค์ประกอบดังต่อไปนี้</p>
<ol>
  <li>{{ประธานทำงาน}} - ประธานคณะทำงาน</li>
  <li>{{คณะทำงานคนที่หนึ่ง}} - คณะทำงาน</li>
  <li>{{คณะทำงานคนที่สอง}} - คณะทำงาน</li>
  <li>{{เลขานุการ}} - คณะทำงานและเลขานุการ</li>
</ol>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;มีหน้าที่และอำนาจปฏิบัติงานตามที่ได้รับมอบหมาย และรายงานผลต่อ {{ผู้บังคับบัญชา}} ต่อไป</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ทั้งนี้ ตั้งแต่บัดนี้เป็นต้นไป</p>
<br>
<p style="text-align: center;">สั่ง ณ วันที่ {{วันที่สั่ง}}</p>
<br>
<p style="text-align: right;">(ลงชื่อ)...........................................</p>
<p style="text-align: right;">({{ผู้มีอำนาจสั่งการ}})</p>
<p style="text-align: right;">ตำแหน่ง {{ตำแหน่งผู้สั่ง}}</p>"""
            )
        ]
        
        cursor.executemany(
            "INSERT INTO templates (id, title, category, content_html) VALUES (?, ?, ?, ?)",
            seeds
        )
        conn.commit()
        print("Database seeded with default templates.")
        
    conn.close()

# Database helper CRUD operations
def db_get_all_templates():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, category, content_html FROM templates")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def db_get_template(tpl_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, category, content_html FROM templates WHERE id = ?", (tpl_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def db_create_template(title, category, content_html):
    conn = get_db_connection()
    cursor = conn.cursor()
    tpl_id = f"tpl_{uuid.uuid4().hex[:8]}"
    cursor.execute(
        "INSERT INTO templates (id, title, category, content_html) VALUES (?, ?, ?, ?)",
        (tpl_id, title, category, content_html)
    )
    conn.commit()
    conn.close()
    return tpl_id

def db_update_template(tpl_id, title, category, content_html):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE templates SET title = ?, category = ?, content_html = ? WHERE id = ?",
        (title, category, content_html, tpl_id)
    )
    conn.commit()
    changes = cursor.rowcount
    conn.close()
    return changes > 0

def db_delete_template(tpl_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM templates WHERE id = ?", (tpl_id,))
    conn.commit()
    changes = cursor.rowcount
    conn.close()
    return changes > 0
