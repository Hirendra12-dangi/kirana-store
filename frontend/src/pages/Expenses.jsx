import React, { useState, useEffect } from 'react'
import { expensesAPI } from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import DataTable from '../components/DataTable'

const Expenses = () => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const data = await expensesAPI.getAll()
      setExpenses(data)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (expenseData) => {
    try {
      await expensesAPI.create(expenseData)
      fetchExpenses()
      setShowForm(false)
    } catch (error) {
      console.error('Error creating expense:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await expensesAPI.delete(id)
      fetchExpenses()
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const columns = [
    { key: 'category', header: 'Category' },
    { key: 'amount', header: 'Amount', render: (expense) => `₹${expense.amount}` },
    { key: 'description', header: 'Description' },
    { key: 'expense_date', header: 'Date' },
    { key: 'actions', header: 'Actions', render: (expense) => (
      <button onClick={() => handleDelete(expense.id)} className="text-red-500">Delete</button>
    )}
  ]

  const summary = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {})

  const chartData = Object.entries(summary).map(([category, amount]) => ({ category, amount }))

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-500 text-white px-4 py-2 rounded">Add Expense</button>
      </div>
      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); handleCreate(Object.fromEntries(new FormData(e.target))) }} className="bg-white p-6 rounded shadow space-y-4">
          <input name="category" placeholder="Category" required className="w-full p-2 border" />
          <input name="amount" type="number" step="0.01" placeholder="Amount" required className="w-full p-2 border" />
          <input name="description" placeholder="Description" className="w-full p-2 border" />
          <input name="expense_date" type="date" required className="w-full p-2 border" />
          <div className="flex space-x-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Monthly Summary by Category</h3>
        <BarChart width={600} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" fill="#8884d8" />
        </BarChart>
      </div>
      <DataTable data={expenses} columns={columns} />
    </div>
  )
}

export default Expenses