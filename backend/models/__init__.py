from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    unit: Optional[str] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    current_stock: Optional[float] = None
    min_stock_alert: Optional[float] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime

class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: str
    total_due: float
    created_at: datetime

class SaleBase(BaseModel):
    product_id: str
    customer_id: Optional[str] = None
    quantity: float
    unit_price: float
    total_amount: float
    payment_mode: str
    sale_date: date
    notes: Optional[str] = None

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: str
    created_at: datetime

class CreditTransactionBase(BaseModel):
    customer_id: str
    amount: float
    transaction_type: str
    description: Optional[str] = None
    transaction_date: date
    due_date: date

class CreditTransactionCreate(CreditTransactionBase):
    pass

class CreditTransaction(CreditTransactionBase):
    id: str
    is_overdue: bool
    interest_applied: float
    created_at: datetime

class ExpenseBase(BaseModel):
    category: str
    amount: float
    description: Optional[str] = None
    expense_date: date

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: str
    created_at: datetime

class StockAdjustmentBase(BaseModel):
    product_id: str
    adjustment_type: str
    quantity_change: float
    reason: Optional[str] = None

class StockAdjustmentCreate(StockAdjustmentBase):
    pass

class StockAdjustment(StockAdjustmentBase):
    id: str
    adjusted_at: datetime