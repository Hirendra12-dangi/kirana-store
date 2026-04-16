from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from database import supabase
from models import Customer, CustomerCreate, CustomerUpdate

router = APIRouter()

@router.get("/", response_model=List[Customer])
def get_customers():
    response = supabase.table("customers").select("*").execute()
    return response.data

@router.post("/", response_model=Customer)
def create_customer(customer: CustomerCreate):
    data = customer.dict()
    data["created_at"] = datetime.utcnow().isoformat()
    response = supabase.table("customers").insert(data).execute()
    return response.data[0]

@router.put("/{customer_id}", response_model=Customer)
def update_customer(customer_id: str, customer: CustomerUpdate):
    data = customer.dict(exclude_unset=True)
    response = supabase.table("customers").update(data).eq("id", customer_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    return response.data[0]

@router.delete("/{customer_id}")
def delete_customer(customer_id: str):
    response = supabase.table("customers").delete().eq("id", customer_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted"}

@router.get("/{customer_id}/ledger")
def get_customer_ledger(customer_id: str):
    credits = supabase.table("credit_transactions").select("*").eq("customer_id", customer_id).order("transaction_date").execute()
    ledger = []
    balance = 0
    for c in credits.data:
        amount = c["amount"]
        if c["transaction_type"] == "credit":
            balance += amount
            ledger.append({
                "date": c["transaction_date"],
                "description": c["description"],
                "debit": amount,
                "credit": 0,
                "balance": balance,
                "interest": c["interest_applied"]
            })
        else:
            balance -= amount
            ledger.append({
                "date": c["transaction_date"],
                "description": c["description"],
                "debit": 0,
                "credit": amount,
                "balance": balance,
                "interest": 0
            })
    return ledger

@router.get("/debtors", response_model=List[Customer])
def get_debtors():
    response = supabase.table("customers").select("*").gt("total_due", 0).order("total_due", desc=True).execute()
    return response.data