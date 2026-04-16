from fastapi import APIRouter, HTTPException, Query
from typing import List
from datetime import date, datetime
from database import supabase
from models import Expense, ExpenseCreate

router = APIRouter()

@router.get("/", response_model=List[Expense])
def get_expenses(date_from: Optional[date] = Query(None), date_to: Optional[date] = Query(None)):
    query = supabase.table("expenses").select("*")
    if date_from:
        query = query.gte("expense_date", date_from.isoformat())
    if date_to:
        query = query.lte("expense_date", date_to.isoformat())
    response = query.execute()
    return response.data

@router.post("/", response_model=Expense)
def create_expense(expense: ExpenseCreate):
    data = expense.dict()
    data["created_at"] = datetime.utcnow().isoformat()
    data["expense_date"] = expense.expense_date.isoformat()  # Convert date to string
    response = supabase.table("expenses").insert(data).execute()
    return response.data[0]

@router.delete("/{expense_id}")
def delete_expense(expense_id: str):
    response = supabase.table("expenses").delete().eq("id", expense_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted"}

@router.get("/summary")
def get_expenses_summary(date_from: date, date_to: date):
    expenses = supabase.table("expenses").select("*").gte("expense_date", date_from.isoformat()).lte("expense_date", date_to.isoformat()).execute()
    summary = {}
    for e in expenses.data:
        cat = e["category"]
        summary[cat] = summary.get(cat, 0) + e["amount"]
    return summary