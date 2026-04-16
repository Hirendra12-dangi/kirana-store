import React, { useState, useEffect } from 'react'
import { salesAPI, productsAPI, customersAPI } from '../lib/api'
import SaleForm from '../components/SaleForm'
import DataTable from '../components/DataTable'

const Sales = () => {
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({})

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      const [salesData, productsData, customersData] = await Promise.all([
        salesAPI.getAll(filters),
        productsAPI.getAll(),
        customersAPI.getAll()
      ])
      setSales(salesData)
      setProducts(productsData)
      setCustomers(customersData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSale = async (saleData) => {
    try {
      await salesAPI.create(saleData)
      fetchData()
      setShowForm(false)
    } catch (error) {
      console.error('Error creating sale:', error)
    }
  }

  const handleVoidSale = async (id) => {
    try {
      await salesAPI.void(id)
      fetchData()
    } catch (error) {
      console.error('Error voiding sale:', error)
    }
  }

  const columns = [
    { key: 'product_name', header: 'Product', render: (sale) => products.find(p => p.id === sale.product_id)?.name },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unit_price', header: 'Unit Price' },
    { key: 'total_amount', header: 'Total' },
    { key: 'payment_mode', header: 'Payment' },
    { key: 'sale_date', header: 'Date' },
    { key: 'actions', header: 'Actions', render: (sale) => (
      <button onClick={() => handleVoidSale(sale.id)} className="text-red-500">Void</button>
    )}
  ]

  const summary = sales.reduce((acc, sale) => ({
    revenue: acc.revenue + sale.total_amount,
    profit: acc.profit + (sale.total_amount - (sale.quantity * (products.find(p => p.id === sale.product_id)?.purchase_price || 0)))
  }), { revenue: 0, profit: 0 })

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-500 text-white px-4 py-2 rounded">Add Sale</button>
      </div>
      {showForm && <SaleForm products={products} customers={customers} onSubmit={handleCreateSale} onCancel={() => setShowForm(false)} />}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Summary</h3>
        <p>Total Revenue: ₹{summary.revenue.toFixed(2)}</p>
        <p>Total Profit: ₹{summary.profit.toFixed(2)}</p>
      </div>
      <DataTable data={sales} columns={columns} />
    </div>
  )
}

export default Sales