from pydantic import BaseModel
from typing import List, Optional

class ProductMarginItem(BaseModel):
    sku: str
    name: str
    price: float
    estimated_cost: float
    margin_amount: float
    margin_pct: float
    units_sold: int

class MonthlyFinancialTrend(BaseModel):
    month: str
    revenue: float
    gross_profit: float
    net_profit: float

class FinancialSummaryResponse(BaseModel):
    total_revenue: float
    total_cogs: float
    gross_profit: float
    operating_expenses: float
    net_profit: float
    profit_margin_pct: float
    revenue_forecast_next_month: float
    financial_health_status: str
    ai_financial_insight: str
    monthly_trends: List[MonthlyFinancialTrend]
    product_margins: List[ProductMarginItem]
