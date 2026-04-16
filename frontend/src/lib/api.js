import { supabase } from './supabaseClient'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiCall = async (endpoint, options = {}) => {
  const token = (await supabase.auth.getSession()).data.session?.access_token
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }
  return response.json()
}

export const productsAPI = {
  getAll: () => apiCall('/api/products'),
  getById: (id) => apiCall(`/api/products/${id}`),
  create: (data) => apiCall('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/api/products/${id}`, { method: 'DELETE' }),
  getLowStock: () => apiCall('/api/products/low-stock'),
  restock: (id, quantity, reason) => apiCall(`/api/products/${id}/restock`, { method: 'POST', body: JSON.stringify({ quantity, reason }) }),
  getProfitHistory: (id) => apiCall(`/api/products/${id}/profit-history`),
}

export const salesAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters)
    return apiCall(`/api/sales?${params}`)
  },
  create: (data) => apiCall('/api/sales', { method: 'POST', body: JSON.stringify(data) }),
  void: (id) => apiCall(`/api/sales/${id}`, { method: 'DELETE' }),
  getSummary: (dateFrom, dateTo) => apiCall(`/api/sales/summary?date_from=${dateFrom}&date_to=${dateTo}`),
  getByProduct: (dateFrom, dateTo) => apiCall(`/api/sales/by-product?date_from=${dateFrom}&date_to=${dateTo}`),
  getDailyChart: () => apiCall('/api/sales/daily-chart'),
}

export const customersAPI = {
  getAll: () => apiCall('/api/customers'),
  create: (data) => apiCall('/api/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/api/customers/${id}`, { method: 'DELETE' }),
  getLedger: (id) => apiCall(`/api/customers/${id}/ledger`),
  getDebtors: () => apiCall('/api/customers/debtors'),
}

export const creditAPI = {
  getAll: () => apiCall('/api/credit'),
  create: (data) => apiCall('/api/credit', { method: 'POST', body: JSON.stringify(data) }),
  recordPayment: (customerId, amount, description, paymentDate) => apiCall('/api/credit/payment', { method: 'POST', body: JSON.stringify({ customer_id: customerId, amount, description, payment_date: paymentDate }) }),
  applyInterest: () => apiCall('/api/credit/apply-interest', { method: 'POST' }),
  getOverdue: () => apiCall('/api/credit/overdue'),
  getCustomerHistory: (id) => apiCall(`/api/credit/customer/${id}`),
}

export const dashboardAPI = {
  getStats: () => apiCall('/api/dashboard/stats'),
}

export const expensesAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters)
    return apiCall(`/api/expenses?${params}`)
  },
  create: (data) => apiCall('/api/expenses', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/api/expenses/${id}`, { method: 'DELETE' }),
  getSummary: (dateFrom, dateTo) => apiCall(`/api/expenses/summary?date_from=${dateFrom}&date_to=${dateTo}`),
}