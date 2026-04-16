from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path
import os

# Load backend/.env automatically when running locally
dotenv_path = Path(__file__).parent / ".env"
if dotenv_path.exists():
    load_dotenv(dotenv_path)

# Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_URL or SUPABASE_KEY environment variables. "
        "Set them in backend/.env or in your shell before starting Uvicorn."
    )

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# Database schema (create these tables manually in Supabase)
"""
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT,
    purchase_price NUMERIC(10,2),
    selling_price NUMERIC(10,2),
    current_stock NUMERIC(10,2),
    min_stock_alert NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    total_due NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    customer_id UUID REFERENCES customers(id),
    quantity NUMERIC(10,2),
    unit_price NUMERIC(10,2),
    total_amount NUMERIC(10,2),
    payment_mode TEXT,
    sale_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    amount NUMERIC(10,2),
    transaction_type TEXT,
    description TEXT,
    transaction_date DATE,
    due_date DATE,
    is_overdue BOOLEAN DEFAULT FALSE,
    interest_applied NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT,
    amount NUMERIC(10,2),
    description TEXT,
    expense_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    adjustment_type TEXT,
    quantity_change NUMERIC(10,2),
    reason TEXT,
    adjusted_at TIMESTAMPTZ DEFAULT NOW()
);
"""