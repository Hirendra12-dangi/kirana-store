from fastapi import APIRouter
from datetime import date, timedelta
from database import supabase
from utils.interest import calculate_interest

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats():
    today = date.today()
    month_start = today.replace(day=1)
    
    # Apply interest to overdue transactions
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
    
    # Today's sales and profit
    today_sales = supabase.table("sales").select("total_amount, product_id, quantity").eq("sale_date", today.isoformat()).execute()
    today_sales_amount = sum(s["total_amount"] for s in today_sales.data)
    today_profit = 0
    for s in today_sales.data:
        product = supabase.table("products").select("purchase_price", "selling_price").eq("id", s["product_id"]).execute()
        if product.data:
            profit_per_unit = (product.data[0]["selling_price"] or 0) - (product.data[0]["purchase_price"] or 0)
            today_profit += s["quantity"] * profit_per_unit
    
    # Monthly revenue and profit
    monthly_sales = supabase.table("sales").select("total_amount, product_id, quantity").gte("sale_date", month_start.isoformat()).execute()
    monthly_revenue = sum(s["total_amount"] for s in monthly_sales.data)
    monthly_profit = 0
    for s in monthly_sales.data:
        product = supabase.table("products").select("purchase_price", "selling_price").eq("id", s["product_id"]).execute()
        if product.data:
            profit_per_unit = (product.data[0]["selling_price"] or 0) - (product.data[0]["purchase_price"] or 0)
            monthly_profit += s["quantity"] * profit_per_unit
    
    # Credit outstanding
    total_credit_outstanding = supabase.table("customers").select("total_due").execute()
    total_credit = sum(c["total_due"] for c in total_credit_outstanding.data if c["total_due"] and c["total_due"] > 0)
    
    # Overdue credit - calculate based on due dates
    overdue_transactions = supabase.table("credit_transactions").select("amount, interest_applied, due_date").eq("transaction_type", "credit").lt("due_date", today.isoformat()).execute()
    overdue_credit = sum(c["amount"] + (c["interest_applied"] or 0) for c in overdue_transactions.data)
    
    # Low stock count
    all_products = supabase.table("products").select("*").execute()
    low_stock_count = sum(1 for p in all_products.data if p["current_stock"] is not None and p["min_stock_alert"] is not None and p["current_stock"] < p["min_stock_alert"])
    
    # Total customers
    total_customers = supabase.table("customers").select("id", count=True).execute()
    total_customers_count = len(total_customers.data)
    
    # Top selling products
    sales_by_product = {}
    for s in monthly_sales.data:
        pid = s["product_id"]
        sales_by_product[pid] = sales_by_product.get(pid, 0) + s["total_amount"]
    top_selling = sorted(sales_by_product.items(), key=lambda x: x[1], reverse=True)[:5]
    top_products = []
    for pid, amt in top_selling:
        product = supabase.table("products").select("name").eq("id", pid).execute()
        if product.data:
            top_products.append({"name": product.data[0]["name"], "revenue": amt})
    
    # Recent sales
    recent_sales = supabase.table("sales").select("*, products(name)").order("created_at", desc=True).limit(5).execute()
    recent = []
    for s in recent_sales.data:
        recent.append({
            "id": s["id"],
            "product_name": s["products"]["name"],
            "quantity": s["quantity"],
            "total_amount": s["total_amount"],
            "sale_date": s["sale_date"]
        })
    
    # Pending dues alert
    pending_alerts = supabase.table("credit_transactions").select("customers(name)").eq("transaction_type", "credit").lt("due_date", today.isoformat()).execute()
    alerts = list(set(c["customers"]["name"] for c in pending_alerts.data))
    
    return {
        "today_sales": today_sales_amount,
        "today_profit": today_profit,
        "monthly_revenue": monthly_revenue,
        "monthly_profit": monthly_profit,
        "total_credit_outstanding": total_credit,
        "overdue_credit": overdue_credit,
        "low_stock_count": low_stock_count,
        "total_customers": total_customers_count,
        "top_selling_products": top_products,
        "recent_sales": recent,
        "pending_dues_alert": alerts
    }