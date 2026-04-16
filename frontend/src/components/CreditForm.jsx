import React, { useState } from 'react'

const CreditForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
      <input name="customer_id" value={formData.customer_id} onChange={handleChange} placeholder="Customer ID" required className="w-full p-2 border" />
      <input name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} placeholder="Amount" required className="w-full p-2 border" />
      <input name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border" />
      <input name="transaction_date" type="date" value={formData.transaction_date} onChange={handleChange} required className="w-full p-2 border" />
      <div className="flex space-x-2">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
        <button onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
      </div>
    </form>
  )
}

export default CreditForm