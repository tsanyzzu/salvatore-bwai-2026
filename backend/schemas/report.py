from pydantic import BaseModel
from typing import Optional

class ReportExportRequest(BaseModel):
    report_type: str  # "financial" | "inventory" | "reviews" | "all"
    format: str       # "pdf" | "excel" | "csv"
    timeframe: Optional[str] = "30_days"

class ReportExportResponse(BaseModel):
    filename: str
    file_content_base64: str
    content_type: str
    message: str
    status: str = "success"
