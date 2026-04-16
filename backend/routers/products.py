from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from database import supabase
from models import Product, ProductCreate, ProductUpdate, StockAdjustmentCreate

router = APIRouter()

@router.get("/", response_model=List[Product])
def get_products():
    response = supabase.table("products").select("*").execute()
    return response.data

@router.get("/{product_id}", response_model=Product)
def get_product(product_id: str):
    response = supabase.table("products").select("*").eq("id", product_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return response.data[0]

@router.post("/", response_model=Product)
def create_product(product: ProductCreate):
    data = product.dict()
    data["created_at"] = datetime.utcnow().isoformat()
    data["updated_at"] = datetime.utcnow().isoformat()
    response = supabase.table("products").insert(data).execute()
    return response.data[0]

@router.put("/{product_id}", response_model=Product)
def update_product(product_id: str, product: ProductUpdate):
    data = product.dict(exclude_unset=True)
    data["updated_at"] = datetime.utcnow().isoformat()
    response = supabase.table("products").update(data).eq("id", product_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return response.data[0]

@router.delete("/{product_id}")
def delete_product(product_id: str):
    response = supabase.table("products").delete().eq("id", product_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

@router.get("/low-stock", response_model=List[Product])
def get_low_stock_products():
    response = supabase.table("products").select("*").filter("current_stock", "lt", "min_stock_alert").execute()
    return response.data

@router.post("/{product_id}/restock")
def restock_product(product_id: str, quantity: float, reason: str):
    # Update stock
    response = supabase.table("products").select("current_stock").eq("id", product_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
    current_stock = response.data[0]["current_stock"] or 0
    new_stock = current_stock + quantity
    supabase.table("products").update({"current_stock": new_stock, "updated_at": datetime.utcnow().isoformat()}).eq("id", product_id).execute()
    
    # Record adjustment
    adjustment = StockAdjustmentCreate(product_id=product_id, adjustment_type="restock", quantity_change=quantity, reason=reason)
    supabase.table("stock_adjustments").insert(adjustment.dict()).execute()
    return {"message": "Stock updated"}

@router.get("/{product_id}/profit-history")
def get_profit_history(product_id: str):
    # Get product prices
    product = supabase.table("products").select("purchase_price", "selling_price").eq("id", product_id).execute()
    if not product.data:
        raise HTTPException(status_code=404, detail="Product not found")
    purchase = product.data[0]["purchase_price"] or 0
    selling = product.data[0]["selling_price"] or 0
    profit_per_unit = selling - purchase
    
    # Get sales
    sales = supabase.table("sales").select("quantity", "sale_date").eq("product_id", product_id).execute()
    history = []
    for sale in sales.data:
        history.append({
            "date": sale["sale_date"],
            "profit": sale["quantity"] * profit_per_unit
        })
    return history