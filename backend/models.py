from pydantic import BaseModel, Field
from typing import List
import re

def extract_variables(html_content: str) -> List[str]:
    if not html_content:
        return []
    # Find all pattern like {{variable_name}}
    found = re.findall(r'\{\{\s*([^{}]+?)\s*\}\}', html_content)
    seen = set()
    unique_vars = []
    for var in found:
        trimmed = var.strip()
        if trimmed and trimmed not in seen:
            seen.add(trimmed)
            unique_vars.append(trimmed)
    return unique_vars

class TemplateCreate(BaseModel):
    title: str = Field(..., min_length=1, description="ชื่อเทมเพลต")
    category: str = Field(..., min_length=1, description="หมวดหมู่เทมเพลต")
    content_html: str = Field(..., description="เนื้อหาเอกสารรูปแบบ HTML")

class TemplateUpdate(BaseModel):
    title: str = Field(..., min_length=1, description="ชื่อเทมเพลต")
    category: str = Field(..., min_length=1, description="หมวดหมู่เทมเพลต")
    content_html: str = Field(..., description="เนื้อหาเอกสารรูปแบบ HTML")

class TemplateResponse(BaseModel):
    id: str
    title: str
    category: str
    content_html: str
    variables: List[str] = []

    @classmethod
    def from_db(cls, db_row: dict):
        content = db_row.get("content_html", "")
        return cls(
            id=db_row["id"],
            title=db_row["title"],
            category=db_row["category"],
            content_html=content,
            variables=extract_variables(content)
        )
