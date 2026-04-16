from fastapi import APIRouter, HTTPException
from typing import List
from datetime import date, datetime, timedelta
from database import supabase
from models import CreditTransaction, CreditTransactionCreate
from utils.interest import calculate_interest

router = APIRouter()

@router.get("/", response_model=List[CreditTransaction])
def get_credit_transactions():
    response = supabase.table("credit_transactions").select("*").execute()
    return response.data

@router.post("/", response_model=CreditTransaction)
def create_credit_transaction(credit: CreditTransactionCreate):
    data = credit.dict()
    data["created_at"] = datetime.utcnow().isoformat()
    data["transaction_date"] = credit.transaction_date.isoformat()  # Convert date to string
    data["due_date"] = credit.due_date.isoformat()  # Convert date to string
    response = supabase.table("credit_transactions").insert(data).execute()
    # Update customer due
    customer = supabase.table("customers").select("total_due").eq("id", credit.customer_id).execute()
    if customer.data:
        new_due = (customer.data[0]["total_due"] or 0) + credit.amount
        supabase.table("customers").update({"total_due": new_due}).eq("id", credit.customer_id).execute()
    return response.data[0]

@router.post("/payment")
def record_payment(customer_id: str, amount: float, description: str, payment_date: date):
    # Create payment transaction
    data = {
        "customer_id": customer_id,
        "amount": amount,
        "transaction_type": "payment",
        "description": description,
        "transaction_date": payment_date.isoformat(),
        "due_date": payment_date.isoformat(),  # Not applicable
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("credit_transactions").insert(data).execute()
    # Update customer due
    customer = supabase.table("customers").select("total_due").eq("id", customer_id).execute()
    if customer.data:
        new_due = (customer.data[0]["total_due"] or 0) - amount
        supabase.table("customers").update({"total_due": new_due}).eq("id", customer_id).execute()
    return {"message": "Payment recorded"}

@router.post("/apply-interest")
def apply_interest():
    today = date.today()
    overdue_date = today - timedelta(days=10)
    credits = supabase.table("credit_transactions").select("*").eq("transaction_type", "credit").lt("transaction_date", overdue_date.isoformat()).execute()
    for c in credits.data:
        days_overdue = (today - date.fromisoformat(c["transaction_date"])).days
        interest = calculate_interest(c["amount"], days_overdue)
        if interest > c["interest_applied"]:
            new_interest = interest - c["interest_applied"]
            supabase.table("credit_transactions").update({
                "interest_applied": interest,
                "is_overdue": True
            }).eq("id", c["id"]).execute()
            # Update customer due
            customer = supabase.table("customers").select("total_due").eq("id", c["customer_id"]).execute()
            if customer.data:
                new_due = (customer.data[0]["total_due"] or 0) + new_interest
                supabase.table("customers").update({"total_due": new_due}).eq("id", c["customer_id"]).execute()
    return {"message": "Interest applied"}

@router.get("/overdue")
def get_overdue_credits():
    today = date.today()
    credits = supabase.table("credit_transactions").select("*, customers(name)").eq("transaction_type", "credit").eq("is_overdue", True).execute()
    overdue = []
    for c in credits.data:
        days_overdue = (today - date.fromisoformat(c["transaction_date"])).days
        live_interest = calculate_interest(c["amount"], days_overdue)
        total_payable = c["amount"] + live_interest
        overdue.append({
            "id": c["id"],
            "customer_name": c["customers"]["name"],
            "amount": c["amount"],
            "interest": live_interest,
            "total_payable": total_payable,
            "days_overdue": days_overdue
        })
    return overdue

@router.get("/customer/{customer_id}", response_model=List[CreditTransaction])
def get_customer_credit_history(customer_id: str):
    response = supabase.table("credit_transactions").select("*").eq("customer_id", customer_id).execute()
    return response.data