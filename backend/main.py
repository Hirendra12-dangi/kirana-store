from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import products, sales, customers, credit, dashboard, expenses
import os

app = FastAPI(title="Kirana Store Management System", version="1.0.0")

# CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(sales.router, prefix="/api/sales", tags=["Sales"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(credit.router, prefix="/api/credit", tags=["Credit"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["Expenses"])

@app.get("/")
def read_root():
    return {"message": "Kirana Store API"}