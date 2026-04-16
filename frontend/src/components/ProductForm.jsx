import React, { useState, useEffect } from 'react'

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    purchase_price: '',
    selling_price: '',
    current_stock: '',
    min_stock_alert: '',
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        unit: product.unit || '',
        purchase_price: product.purchase_price || '',
        selling_price: product.selling_price || '',
        current_stock: product.current_stock || '',
        min_stock_alert: product.min_stock_alert || '',
      })
    }
  }, [product])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" required className="w-full p-2 border" />
      <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" className="w-full p-2 border" />
      <input name="unit" value={formData.unit} onChange={handleChange} placeholder="Unit (e.g., kg, piece)" className="w-full p-2 border" />
      <input name="purchase_price" type="number" step="0.01" value={formData.purchase_price} onChange={handleChange} placeholder="Purchase Price" className="w-full p-2 border" />
      <input name="selling_price" type="number" step="0.01" value={formData.selling_price} onChange={handleChange} placeholder="Selling Price" className="w-full p-2 border" />
      <input name="current_stock" type="number" step="0.01" value={formData.current_stock} onChange={handleChange} placeholder="Current Stock" className="w-full p-2 border" />
      <input name="min_stock_alert" type="number" step="0.01" value={formData.min_stock_alert} onChange={handleChange} placeholder="Min Stock Alert" className="w-full p-2 border" />
      <div className="flex space-x-2">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
        <button onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
      </div>
    </form>
  )
}

export default ProductForm