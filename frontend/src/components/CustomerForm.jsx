import React, { useState, useEffect } from 'react'

const CustomerForm = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        address: customer.address || '',
      })
    }
  }, [customer])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Customer Name" required className="w-full p-2 border" />
      <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 border" />
      <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="w-full p-2 border"></textarea>
      <div className="flex space-x-2">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
        <button onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
      </div>
    </form>
  )
}

export default CustomerForm