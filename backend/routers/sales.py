from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date, datetime
from database import supabase
from models import Sale, SaleCreate

router = APIRouter()

@router.get("/", response_model=List[Sale])
def get_sales(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    customer_id: Optional[str] = Query(None),
    payment_mode: Optional[str] = Query(None)
):
    query = supabase.table("sales").select("*")
    if date_from:
        query = query.gte("sale_date", date_from.isoformat())
    if date_to:
        query = query.lte("sale_date", date_to.isoformat())
    if customer_id:
        query = query.eq("customer_id", customer_id)
    if payment_mode:
        query = query.eq("payment_mode", payment_mode)
    response = query.execute()
    return response.data

@router.post("/", response_model=Sale)
def create_sale(sale: SaleCreate):
    # Check stock
    product = supabase.table("products").select("current_stock").eq("id", sale.product_id).execute()
    if not product.data or product.data[0]["current_stock"] < sale.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Deduct stock
    new_stock = product.data[0]["current_stock"] - sale.quantity
    supabase.table("products").update({"current_stock": new_stock}).eq("id", sale.product_id).execute()
    
    # Create sale
    data = sale.dict()
    data["created_at"] = datetime.utcnow().isoformat()
    data["sale_date"] = sale.sale_date.isoformat()  # Convert date to string
    response = supabase.table("sales").insert(data).execute()
    
    # If credit, create credit transaction
    if sale.payment_mode == "credit":
        due_date = sale.sale_date.replace(day=min(31, sale.sale_date.day + 10))
        credit_data = {
            "customer_id": sale.customer_id,
            "amount": sale.total_amount,
            "transaction_type": "credit",
            "description": f"Sale credit for {sale.quantity} units",
            "transaction_date": sale.sale_date.isoformat(),
            "due_date": due_date.isoformat(),
            "created_at": datetime.utcnow().isoformat()
        }
        supabase.table("credit_transactions").insert(credit_data).execute()
        
        # Update customer total_due
        customer = supabase.table("customers").select("total_due").eq("id", sale.customer_id).execute()
        if customer.data:
            new_due = (customer.data[0]["total_due"] or 0) + sale.total_amount
            supabase.table("customers").update({"total_due": new_due}).eq("id", sale.customer_id).execute()
    
    return response.data[0]

@router.delete("/{sale_id}")
def delete_sale(sale_id: str):
    # Get sale
    sale = supabase.table("sales").select("*").eq("id", sale_id).execute()
    if not sale.data:
        raise HTTPException(status_code=404, detail="Sale not found")
    sale = sale.data[0]
    
    # Restore stock
    product = supabase.table("products").select("current_stock").eq("id", sale["product_id"]).execute()
    new_stock = (product.data[0]["current_stock"] or 0) + sale["quantity"]
    supabase.table("products").update({"current_stock": new_stock}).eq("id", sale["product_id"]).execute()
    
    # If credit, remove credit transaction and update due
    if sale["payment_mode"] == "credit":
        supabase.table("credit_transactions").delete().eq("customer_id", sale["customer_id"]).eq("amount", sale["total_amount"]).eq("transaction_type", "credit").execute()
        customer = supabase.table("customers").select("total_due").eq("id", sale["customer_id"]).execute()
        if customer.data:
            new_due = (customer.data[0]["total_due"] or 0) - sale["total_amount"]
            supabase.table("customers").update({"total_due": new_due}).eq("id", sale["customer_id"]).execute()
    
    # Delete sale
    supabase.table("sales").delete().eq("id", sale_id).execute()
    return {"message": "Sale voided"}

@router.get("/summary")
def get_sales_summary(date_from: date, date_to: date):
    sales = supabase.table("sales").select("*").gte("sale_date", date_from.isoformat()).lte("sale_date", date_to.isoformat()).execute()
    total_revenue = sum(s["total_amount"] for s in sales.data)
    total_profit = 0
    for s in sales.data:
        product = supabase.table("products").select("purchase_price", "selling_price").eq("id", s["product_id"]).execute()
        if product.data:
            profit_per_unit = (product.data[0]["selling_price"] or 0) - (product.data[0]["purchase_price"] or 0)
            total_profit += s["quantity"] * profit_per_unit
    return {
        "total_revenue": total_revenue,
        "total_profit": total_profit,
        "sales_count": len(sales.data)
    }

@router.get("/by-product")
def get_sales_by_product(date_from: date, date_to: date):
    sales = supabase.table("sales").select("product_id, total_amount").gte("sale_date", date_from.isoformat()).lte("sale_date", date_to.isoformat()).execute()
    product_revenue = {}
    for s in sales.data:
        pid = s["product_id"]
        product_revenue[pid] = product_revenue.get(pid, 0) + s["total_amount"]
    return product_revenue

@router.get("/daily-chart")
def get_daily_sales_chart():
    from datetime import timedelta
    end_date = date.today()
    start_date = end_date - timedelta(days=30)
    sales = supabase.table("sales").select("sale_date, total_amount").gte("sale_date", start_date.isoformat()).lte("sale_date", end_date.isoformat()).execute()
    daily = {}
    for s in sales.data:
        d = s["sale_date"]
        daily[d] = daily.get(d, 0) + s["total_amount"]
    return [{"date": k, "amount": v} for k, v in daily.items()]