from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.database import (
    db_get_all_templates,
    db_get_template,
    db_create_template,
    db_update_template,
    db_delete_template
)
from backend.models import TemplateCreate, TemplateUpdate, TemplateResponse

router = APIRouter(prefix="/api/v1/templates", tags=["Templates"])

@router.get("", response_model=List[TemplateResponse])
def get_templates():
    rows = db_get_all_templates()
    return [TemplateResponse.from_db(row) for row in rows]

@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(template_id: str):
    row = db_get_template(template_id)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found"
        )
    return TemplateResponse.from_db(row)

@router.post("", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
def create_template(template: TemplateCreate):
    tpl_id = db_create_template(
        title=template.title,
        category=template.category,
        content_html=template.content_html
    )
    new_row = db_get_template(tpl_id)
    if not new_row:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve created template"
        )
    return TemplateResponse.from_db(new_row)

@router.put("/{template_id}", response_model=TemplateResponse)
def update_template(template_id: str, template: TemplateUpdate):
    success = db_update_template(
        tpl_id=template_id,
        title=template.title,
        category=template.category,
        content_html=template.content_html
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found or no changes made"
        )
    row = db_get_template(template_id)
    return TemplateResponse.from_db(row)

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(template_id: str):
    success = db_delete_template(template_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found"
        )
    return None

@router.delete("", status_code=status.HTTP_200_OK)
def clear_all_templates():
    db_clear_all_templates()
    return {"message": "All templates cleared successfully"}
